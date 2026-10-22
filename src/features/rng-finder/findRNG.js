import { LCG, RNG, encounterIndex, isBattle } from 'suikoden-rng-lib/encounters';
import Status from './SearchStatus';
import Encounters from './Encounters';

// The lib's RNG step is raw * MULTIPLIER + INCREMENT; `scan` does it inline on a bare integer.
// Keep these local consts (read from the import once): V8 reads an imported or exported binding
// from memory on every use, which slowed the scan loop by a factor of two in plain mode.
const { MULTIPLIER, INCREMENT } = LCG;

// Whether a battle starts, and which group it is, depend only on the 15-bit rand of an RNG state
// (see `scan`), so both are tabulated once per area. The lib's own isBattle and encounterIndex
// fill the tables, so the game's rules stay defined there.
export function tablesFor(area) {
  const battle = new Uint8Array(0x8000); // battle[r]: a state with rand r starts a battle
  const group = new Uint8Array(0x8000); // group[r]: the group picked when the NEXT rand is r
  const probe = new RNG(0);
  for (let r = 0; r < 0x8000; r++) {
    probe.raw = r << 16; // a state whose rand is r
    battle[r] = isBattle(probe, area) ? 1 : 0;
    probe.prev(); // a state whose next rand is r
    group[r] = encounterIndex(probe, area);
  }
  return { battle, group };
}

// The hot loop: it runs about 4 billion times in a full search, so it is a function of its own
// and as small as it can be (V8 compiles it far better that way than inside the bookkeeping
// around it). It works on the bare 32-bit RNG state, with the lib's generator step inlined:
// raw * MULTIPLIER + INCREMENT, and rand is bits 16-30.
//
// Scans from state.raw for up to `budget` steps, or until the buffer is full. Leaves the RNG
// state it ended on in state.raw and the steps taken in state.steps (a realistic skip can take
// one more than the budget).
function scan(state, budget, { battle, group }, encounters, realistic) {
  let raw = state.raw;
  let steps = 0;
  for (; steps < budget; steps++) {
    if (battle[(raw >>> 16) & 0x7fff] === 1) {
      const next = (Math.imul(raw, MULTIPLIER) + INCREMENT) | 0;
      encounters.push(group[(next >>> 16) & 0x7fff], raw >>> 0);
      if (realistic) {
        raw = next;
        steps++;
      }
      if (encounters.isFull()) {
        raw = (Math.imul(raw, MULTIPLIER) + INCREMENT) | 0;
        steps++;
        break;
      }
    }
    raw = (Math.imul(raw, MULTIPLIER) + INCREMENT) | 0;
  }
  state.raw = raw;
  state.steps = steps;
}

// The earliest RNG a run could start at and still see the battle at `matchRaw` first: the call
// right after the last battle value before it (any earlier start would hit that battle, or run
// into it). Walks back from the match with prev(), so it can go back past where the search
// began. `gap` is how many values lie between that earlier battle and the match.
export function findFirstPossible(area, matchRaw) {
  const rng = new RNG(matchRaw);
  let gap = 0;
  for (; gap < 0xffffffff; gap++) {
    rng.prev();
    if (isBattle(rng, area)) break;
  }
  rng.next(); // back onto the call after that battle
  return { firstPossibleRNG: rng.raw, gap };
}

// area is an AREAS entry from suikoden-rng-lib/encounters; encounters are group indices into
// area.encounters, in the order they were fought.
//
// realistic: after a battle the game spends the next RNG call picking the enemy group, so that
// value can never start a battle. Realistic mode skips it; otherwise two battle values in a row
// both count, which the game can't produce.
//
// By default the search stops at the first match. With findAll it reports every match, up to
// maxMatches (a short sequence can match thousands of times).
//
// A search covers half the RNG's cycle, 2^31 steps. The game never looks at bit 31 of the state,
// and the generator never carries anything from bit 31 into the bits below it, so a state and
// the same state with bit 31 flipped play out identically. Every match therefore has a twin
// (raw ^ 0x80000000) exactly 2^31 steps away, which the other half would only repeat. Matches
// are reported once, as the value the scan reached; see rngPair.js for showing both.
//
// maxSteps is how many steps to scan from the seed. A match is reported if it STARTS inside
// them; the scan carries on just past the end to see the rest of one that straddles it.
//
// Returns the matches found, each { foundEncounterRNG, firstPossibleRNG, gap }, in the order the
// scan reached them; the same matches also go out through `progress` as they are found.
export const HALF_CYCLE = 0x80000000;

export function findRNG(
  area,
  encounters,
  rngSeed,
  progress,
  { realistic = false, findAll = false, maxMatches = 1000, maxSteps = HALF_CYCLE } = {},
) {
  if (encounters.length <= 1) {
    return [];
  }

  const status = new Status(progress, { findAll });
  const startTime = new Date().getTime();
  const runtime = () => `Runtime: ${(new Date().getTime() - startTime) / 1000} seconds.`;

  const generatedEncounters = new Encounters();
  const matches = [];

  // Battles are counted from the start of the scan, so a match can be placed relative to the end
  // of the steps: bufferStart is the count at the buffer's first slot, and boundary the count
  // when the steps ran out (matches at or after it started too late to be reported).
  let bufferStart = 0;
  let boundary = Infinity;

  // Searches the buffer for the sequence and records what it finds. Returns true once the search
  // is over: the first match in first-match mode, or maxMatches matches.
  const searchBuffer = () => {
    const before = matches.length;
    for (
      let at = generatedEncounters.search(encounters);
      at >= 0 && bufferStart + at < boundary && matches.length < maxMatches;
      at = generatedEncounters.search(encounters, at + 1)
    ) {
      const foundEncounterRNG = generatedEncounters.seedAt(at);
      matches.push({ foundEncounterRNG, ...findFirstPossible(area, foundEncounterRNG) });
      if (!findAll) break;
    }

    if (matches.length > before) status.update({ matches });
    if (matches.length > 0 && !findAll) {
      status.update({ done: true, message: runtime() }).log();
      return true;
    }
    if (matches.length >= maxMatches) {
      status
        .update({
          done: true,
          progress: 100,
          message: `Stopped at ${maxMatches} matches; a longer sequence gives fewer. ${runtime()}`,
        })
        .log();
      return true;
    }
    return false;
  };

  // Called with a full buffer. Keeps the end so a match across the boundary is found: one short
  // of the pattern, so that a match entirely inside the kept part (already reported) can't be
  // found again.
  const searchFullBufferAndRotate = () => {
    status.update({ message: `Checking group of ${generatedEncounters.size} fights` }).log();
    if (searchBuffer()) return true;
    bufferStart += generatedEncounters.size - (encounters.length - 1);
    generatedEncounters.rotateEndToStart(encounters.length - 1);
    status.update({ message: 'Generating fights to search' }).log();
    return false;
  };

  const tables = tablesFor(area);
  const CHUNK = Math.ceil(maxSteps / 100); // steps between progress updates (1% of the search)
  const state = { raw: rngSeed | 0, steps: 0 };
  let done = 0;
  let nextProgress = CHUNK;

  while (done < maxSteps) {
    scan(state, Math.min(nextProgress, maxSteps) - done, tables, generatedEncounters, realistic);
    done += state.steps;
    if (done >= nextProgress) {
      status.update({ progress: (done / maxSteps) * 100 }).log();
      nextProgress += CHUNK;
    }
    if (generatedEncounters.isFull() && searchFullBufferAndRotate()) return matches;
  }

  // The steps are up. A match that began before the end may need a few more battles to finish.
  boundary = bufferStart + generatedEncounters.index;
  const needed = boundary + encounters.length - 1;
  while (bufferStart + generatedEncounters.index < needed) {
    scan(state, 4096, tables, generatedEncounters, realistic);
    if (generatedEncounters.isFull() && searchFullBufferAndRotate()) return matches;
  }

  // The last buffer is rarely full by now, and its battles still count
  if (searchBuffer()) return matches;

  status
    .update({
      progress: 100,
      message: matches.length > 0 ? `${matches.length} matches. ${runtime()}` : 'No match found.',
      done: true,
    })
    .log();
  return matches;
}
