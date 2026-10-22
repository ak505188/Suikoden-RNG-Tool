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

// The hot loop: it runs about 2 billion times in a full search, so it is a function of its own
// and as small as it can be (V8 compiles it far better that way than inside the bookkeeping
// around it). It works on the bare 32-bit RNG state, with the lib's generator step inlined:
// raw * MULTIPLIER + INCREMENT, and rand is bits 16-30.
//
// It records the battles a player would get walking from state.raw. After a battle the game
// spends the next call picking the group, so that value is skipped. A skipped value that is
// itself a battle, though, is a place a player could have started and fought it first. When its
// group is `firstGroup` it is noted in state.candidates, for the caller to check the rest of the
// pattern: three numbers each, the RNG state, the buffer slot of the battle before it, and its
// step (`base` is the steps taken before this call).
//
// Scans from state.raw for up to `budget` steps, or until the buffer is full. Leaves the RNG
// state it ended on in state.raw and the steps taken in state.steps (skipping a value can take
// one more than the budget).
function scan(state, budget, { battle, group }, encounters, firstGroup, base) {
  const candidates = state.candidates;
  let raw = state.raw;
  let steps = 0;
  for (; steps < budget; steps++) {
    if (battle[(raw >>> 16) & 0x7fff] === 1) {
      const next = (Math.imul(raw, MULTIPLIER) + INCREMENT) | 0;
      encounters.push(group[(next >>> 16) & 0x7fff], raw >>> 0);
      raw = next; // the group roll
      steps++;
      if (battle[(raw >>> 16) & 0x7fff] === 1) {
        const after = (Math.imul(raw, MULTIPLIER) + INCREMENT) | 0;
        if (group[(after >>> 16) & 0x7fff] === firstGroup) {
          candidates.push(raw >>> 0, encounters.index - 1, base + steps);
        }
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
// A match is an RNG value at which the first fight happens, followed by the rest of the
// sequence. The first fight can be any battle value: the player may have started right on it.
// The fights after it follow the game's rule that a battle spends the next RNG call on its
// group, so a battle value directly after a battle can't start another.
//
// It reports every match, up to maxMatches (a short sequence can match thousands of times);
// maxMatches: 1 stops at the first one.
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
// scan reached them. `progress` is called with the status as the search goes, including each
// match as it is found.
export const HALF_CYCLE = 0x80000000;

export function findRNG(
  area,
  encounters,
  rngSeed,
  progress,
  { maxMatches = 1000, maxSteps = HALF_CYCLE } = {},
) {
  if (encounters.length <= 1) {
    return [];
  }

  const status = new Status(progress);
  const tables = tablesFor(area);
  const generatedEncounters = new Encounters();
  const state = { raw: rngSeed | 0, steps: 0, candidates: [] };
  const firstGroup = encounters[0];

  // Matches, each with where it starts counted in battles from the start of the scan (a battle
  // that was skipped counts as half a battle after the one before it), so they can be put in
  // order and so a match can be placed relative to the end of the steps.
  const found = [];
  const matches = [];
  // bufferStart is the battle count at the buffer's first slot, and boundary the count when the
  // steps ran out (matches at or after it started too late to be reported).
  let bufferStart = 0;
  let boundary = Infinity;
  let done = 0; // steps taken

  // Whether a player standing on `raw` fights the whole sequence, the first fight being right
  // there. Plays out just that many battles from it.
  const startsSequence = (raw) => {
    const probe = new Encounters(encounters.length);
    scan({ raw: raw | 0, steps: 0, candidates: [] }, 0x7fffffff, tables, probe, -1, 0);
    return probe.search(encounters) === 0;
  };

  const record = (pos, foundEncounterRNG) =>
    found.push({
      pos,
      match: { foundEncounterRNG, ...findFirstPossible(area, foundEncounterRNG) },
    });

  // Looks through what has been scanned for the sequence and records what it finds. Returns true
  // once the search is over: maxMatches matches found.
  const search = () => {
    const before = found.length;

    // Skipped battle values that start the right group
    const candidates = state.candidates;
    for (let i = 0; i < candidates.length; i += 3) {
      const [raw, slot, step] = [candidates[i], candidates[i + 1], candidates[i + 2]];
      const pos = bufferStart + slot + 0.5;
      if (step < maxSteps && pos < boundary && startsSequence(raw)) record(pos, raw);
    }
    candidates.length = 0;

    // The buffer
    for (
      let at = generatedEncounters.search(encounters);
      at >= 0 && bufferStart + at < boundary;
      at = generatedEncounters.search(encounters, at + 1)
    ) {
      record(bufferStart + at, generatedEncounters.seedAt(at));
    }

    if (found.length === before) return false;
    found.sort((a, b) => a.pos - b.pos);
    const limitReached = found.length >= maxMatches;
    if (limitReached) found.length = maxMatches;
    matches.length = 0;
    for (const { match } of found) matches.push(match);
    status
      .update(limitReached ? { matches, done: true, progress: 100, limitReached } : { matches })
      .log();
    return limitReached;
  };

  // Called with a full buffer. Keeps the end so a match across the boundary is found: one short
  // of the pattern, so that a match entirely inside the kept part (already reported) can't be
  // found again.
  const searchFullBufferAndRotate = () => {
    if (search()) return true;
    bufferStart += generatedEncounters.size - (encounters.length - 1);
    generatedEncounters.rotateEndToStart(encounters.length - 1);
    return false;
  };

  const scanSome = (budget) => {
    scan(state, budget, tables, generatedEncounters, firstGroup, done);
    done += state.steps;
  };

  const CHUNK = Math.ceil(maxSteps / 100); // steps between progress updates (1% of the search)
  let nextProgress = CHUNK;

  while (done < maxSteps) {
    scanSome(Math.min(nextProgress, maxSteps) - done);
    if (done >= nextProgress) {
      // A whole percent: `done` overshoots the tick by a few steps, so the ratio never divides evenly
      status.update({ progress: Math.min(100, Math.round((done / maxSteps) * 100)) }).log();
      nextProgress += CHUNK;
    }
    if (generatedEncounters.isFull() && searchFullBufferAndRotate()) return matches;
  }

  // The steps are up. A match that began before the end may need a few more battles to finish.
  boundary = bufferStart + generatedEncounters.index;
  const needed = boundary + encounters.length - 1;
  while (bufferStart + generatedEncounters.index < needed) {
    scanSome(4096);
    if (generatedEncounters.isFull() && searchFullBufferAndRotate()) return matches;
  }

  // The last buffer is rarely full by now, and its battles still count
  if (search()) return matches;

  status.update({ progress: 100, done: true }).log();
  return matches;
}
