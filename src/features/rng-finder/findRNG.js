import { RNG, encounterIndex, isBattle } from 'suikoden-rng-lib/encounters';
import Status from './SearchStatus';
import Encounters from './Encounters';

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
// By default the search stops at the first match. With findAll it scans the whole RNG cycle and
// reports every match, up to maxMatches (a short sequence can match thousands of times).
//
// Returns the matches found, each { foundEncounterRNG, firstPossibleRNG, gap }, in the order the
// scan reached them; the same matches also go out through `progress` as they are found.
export function findRNG(
  area,
  encounters,
  rngSeed,
  progress,
  { realistic = false, findAll = false, maxMatches = 1000 } = {},
) {
  if (encounters.length <= 1) {
    return [];
  }

  const status = new Status(progress, { findAll });
  const startTime = new Date().getTime();
  const runtime = () => `Runtime: ${(new Date().getTime() - startTime) / 1000} seconds.`;

  const generatedEncounters = new Encounters();
  const matches = [];
  const rng = new RNG(rngSeed);

  for (let i = 0; i < 0xffffffff; i++) {
    if (isBattle(rng, area)) {
      const encounterID = encounterIndex(rng, area);
      generatedEncounters.push(encounterID, rng.raw);
      if (realistic) {
        rng.next();
        i++;
      }
      if (generatedEncounters.isFull()) {
        status.update({ message: `Checking group of ${generatedEncounters.size} fights` }).log();

        const before = matches.length;
        for (
          let at = generatedEncounters.search(encounters);
          at >= 0 && matches.length < maxMatches;
          at = generatedEncounters.search(encounters, at + 1)
        ) {
          const foundEncounterRNG = generatedEncounters.seedAt(at);
          matches.push({ foundEncounterRNG, ...findFirstPossible(area, foundEncounterRNG) });
          if (!findAll) break;
        }

        if (matches.length > before) status.update({ matches });
        if (matches.length > 0 && !findAll) {
          status.update({ done: true, message: runtime() }).log();
          return matches;
        }
        if (matches.length >= maxMatches) {
          status
            .update({
              done: true,
              progress: 100,
              message: `Stopped at ${maxMatches} matches; a longer sequence gives fewer. ${runtime()}`,
            })
            .log();
          return matches;
        }

        // Keep the end so a match across the boundary is found. One short of the pattern, so
        // that a match entirely inside the kept part (already reported) can't be found again.
        generatedEncounters.rotateEndToStart(encounters.length - 1);
        status.update({ message: 'Generating fights to search' }).log();
      }
    }

    if (i % 42949672 === 0) {
      status.update({ progress: i / 42949672 }).log();
    }

    rng.next();
  }

  status
    .update({
      progress: 100,
      message: matches.length > 0 ? `${matches.length} matches. ${runtime()}` : 'No match found.',
      done: true,
    })
    .log();
  return matches;
}
