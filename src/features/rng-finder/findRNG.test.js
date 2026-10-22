import { beforeAll, describe, expect, test } from 'vitest';
import {
  LCG,
  RNG,
  encounterIndex,
  generateEncounters,
  isBattle,
} from 'suikoden-rng-lib/encounters';
import { ENCOUNTER_AREAS } from 'shared/lib/encounters';
import { findFirstPossible, findRNG, tablesFor } from './findRNG';
import { twinOf } from './rngPair';

const BUFFER = 0xffff; // fights findRNG collects before it searches them

// Every place `wanted` occurs in `ids` (matches may overlap), in order
const occurrences = (ids, wanted) =>
  ids.flatMap((_, start) =>
    wanted.every((id, offset) => ids[start + offset] === id) ? [start] : [],
  );
const firstOccurrence = (ids, wanted) => occurrences(ids, wanted)[0];

// Every battle value from the seed, whatever the mode: the first possible RNG for a match comes
// from the last of these before it
const battlesOf = (area) => generateEncounters(new RNG(0x12), area, { iterations: 5_000_000 });

// The call after the battle before `matchRaw`, and the values between them
const expectedFirstPossible = (battles, matchRaw) => {
  const at = battles.findIndex((battle) => battle.startRNG === matchRaw);
  const before = battles[at - 1];
  return {
    rng: new RNG(before.startRNG).next().raw,
    gap: battles[at].index - before.index - 1,
  };
};

let allBattles;

describe.each([false, true])('findRNG (realistic: %s)', (realistic) => {
  let area, fights, ids;
  beforeAll(() => {
    area = ENCOUNTER_AREAS.find((a) => a.name === 'Moravia Area');
    allBattles = allBattles ?? battlesOf(area);
    // The fights the game would produce from this seed. Enough for findRNG to fill its buffer
    // twice (about 3% of RNG steps start a battle here).
    fights = generateEncounters(new RNG(0x12), area, { iterations: 5_000_000, realistic });
    ids = fights.map((fight) => fight.encounterIndex);
    expect(fights.length).toBeGreaterThan(BUFFER * 2);
  });

  test('finds the RNG a run of fights started at', () => {
    const wanted = ids.slice(30000, 30010);
    const first = firstOccurrence(ids, wanted);
    expect(first).toBeLessThan(BUFFER);

    expect(findRNG(area, wanted, 0x12, () => {}, { realistic })[0].foundEncounterRNG).toBe(
      fights[first].startRNG,
    );
  });

  test('finds a run that straddles the end of a full buffer', () => {
    const wanted = ids.slice(BUFFER - 5, BUFFER + 6);
    const first = firstOccurrence(ids, wanted);
    expect(first).toBe(BUFFER - 5); // the first place it occurs is the one that straddles

    expect(findRNG(area, wanted, 0x12, () => {}, { realistic })[0].foundEncounterRNG).toBe(
      fights[first].startRNG,
    );
  });

  test('reports the first possible RNG and the gap before the match', () => {
    const wanted = ids.slice(30000, 30010);
    const first = firstOccurrence(ids, wanted);
    const updates = [];
    findRNG(area, wanted, 0x12, (status) => updates.push(status), { realistic });

    const { result } = updates.find((status) => status.result);
    expect(result.foundEncounterRNG).toBe(fights[first].startRNG);
    expect({ rng: result.firstPossibleRNG, gap: result.gap }).toEqual(
      expectedFirstPossible(allBattles, fights[first].startRNG),
    );
  });

  test('finding the first match returns just that one', () => {
    const wanted = ids.slice(30000, 30010);
    const matches = findRNG(area, wanted, 0x12, () => {}, { realistic });
    expect(matches).toHaveLength(1);
  });

  test('find all gives every match, in order, with the same details as a single search', () => {
    const wanted = ids.slice(30000, 30003); // short enough to occur many times
    const starts = occurrences(ids, wanted).filter((start) => start < BUFFER - wanted.length);
    expect(starts.length).toBeGreaterThan(5);

    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      findAll: true,
      maxMatches: 5,
    });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual(
      starts.slice(0, 5).map((start) => fights[start].startRNG),
    );
    // each match carries the same first possible RNG a search for just that one would give
    for (const match of matches) {
      expect(match).toEqual({
        foundEncounterRNG: match.foundEncounterRNG,
        ...findFirstPossible(area, match.foundEncounterRNG),
      });
    }
  });

  // The second buffer starts with the last wanted.length - 1 battles of the first, so it can see
  // up to this far
  const lastStartSeen = (length) => 2 * BUFFER - 2 * length + 1;

  test('find all finds a match across the buffer boundary', () => {
    const wanted = ids.slice(BUFFER - 3, BUFFER + 3);
    const starts = occurrences(ids, wanted).filter((start) => start <= lastStartSeen(6));
    expect(starts).toContain(BUFFER - 3);

    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      findAll: true,
      maxMatches: starts.length,
    });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual(
      starts.map((start) => fights[start].startRNG),
    );
  });

  test('find all reports a match that ends exactly at the end of a buffer only once', () => {
    // Found in the first buffer; if the second kept all of it, it would be found there again
    const wanted = ids.slice(BUFFER - 6, BUFFER);
    const starts = occurrences(ids, wanted).filter((start) => start <= lastStartSeen(6));
    expect(starts).toContain(BUFFER - 6);

    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      findAll: true,
      maxMatches: starts.length + 1, // room for a duplicate, if there were one
    });
    // it carries on until it finds one more, genuine, match (or reaches maxMatches)
    expect(matches.slice(0, starts.length).map((m) => m.foundEncounterRNG)).toEqual(
      starts.map((start) => fights[start].startRNG),
    );
    expect(new Set(matches.map((m) => m.foundEncounterRNG)).size).toBe(matches.length);
  });

  test('find all stops at maxMatches and says so', () => {
    const wanted = ids.slice(30000, 30003);
    const updates = [];
    findRNG(area, wanted, 0x12, (status) => updates.push(status), {
      realistic,
      findAll: true,
      maxMatches: 3,
    });
    const last = updates[updates.length - 1];
    expect(last.done).toBe(true);
    expect(last.matches).toHaveLength(3);
    expect(last.message).toMatch(/Stopped at 3 matches/);
  });

  test('searches the last, part-filled buffer too', () => {
    // Steps run out when the second buffer is only partly full. A run of fights at the very end
    // of those steps is only in that part-filled buffer.
    const maxSteps = 2_500_000;
    const seen = generateEncounters(new RNG(0x12), area, { iterations: maxSteps, realistic });
    const seenIds = seen.map((fight) => fight.encounterIndex);
    expect(seen.length).toBeGreaterThan(BUFFER + 100);
    expect(seen.length).toBeLessThan(BUFFER * 2 - 100);

    const wanted = seenIds.slice(-8);
    const first = firstOccurrence(seenIds, wanted);
    expect(first).toBeGreaterThan(BUFFER); // not in the first, full buffer

    const matches = findRNG(area, wanted, 0x12, () => {}, { realistic, maxSteps });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([seen[first].startRNG]);
  });

  // maxSteps ends the scan just after the battle at fights[i]
  const stepsThrough = (i) => fights[i].index + (realistic ? 2 : 1);

  test('a match that starts before the end of the steps is found even though it finishes after', () => {
    const k = 30000;
    const wanted = ids.slice(k, k + 6);
    const first = firstOccurrence(ids, wanted);
    expect(first).toBe(k); // unique, so the only place to look

    // the steps end after the third of its six battles
    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      maxSteps: stepsThrough(k + 2),
    });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([fights[k].startRNG]);
  });

  test('a match that starts after the end of the steps is not reported', () => {
    const k = 30000;
    const wanted = ids.slice(k + 3, k + 9);
    expect(firstOccurrence(ids, wanted)).toBe(k + 3);

    // the steps end after battle k + 2: the match starts with battle k + 3
    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      maxSteps: stepsThrough(k + 2),
    });
    expect(matches).toEqual([]);
  });

  test('a match that starts on the very last battle of the steps is found', () => {
    const k = 30000;
    const wanted = ids.slice(k, k + 6);
    expect(firstOccurrence(ids, wanted)).toBe(k);

    const matches = findRNG(area, wanted, 0x12, () => {}, { realistic, maxSteps: stepsThrough(k) });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([fights[k].startRNG]);
  });
});

describe('findFirstPossible', () => {
  const area = ENCOUNTER_AREAS.find((a) => a.name === 'Moravia Area');
  const battles = generateEncounters(new RNG(0x12), area, { iterations: 300_000 });

  test('is the call after the previous battle, with the values in between as the gap', () => {
    for (const k of [1, 2, 50, 400, 1000, 5000]) {
      const { firstPossibleRNG, gap } = findFirstPossible(area, battles[k].startRNG);
      expect({ rng: firstPossibleRNG, gap }).toEqual(
        expectedFirstPossible(battles, battles[k].startRNG),
      );
    }
  });

  test('a battle right after another has no gap and is its own first possible RNG', () => {
    const k = battles.findIndex((b, i) => i > 0 && b.index - battles[i - 1].index === 1);
    expect(k).toBeGreaterThan(0);
    const { firstPossibleRNG, gap } = findFirstPossible(area, battles[k].startRNG);
    expect(gap).toBe(0);
    expect(firstPossibleRNG).toBe(battles[k].startRNG);
  });

  test('can look back past where the search began', () => {
    // the first battle from the seed: the one before it is before the seed
    const match = battles[0].startRNG;
    const { firstPossibleRNG, gap } = findFirstPossible(area, match);

    // from there, `gap` quiet values lead to the match, and the value before is a battle
    const rng = new RNG(firstPossibleRNG);
    for (let i = 0; i < gap; i++) {
      expect(isBattle(rng, area)).toBe(false);
      rng.next();
    }
    expect(rng.raw).toBe(match);
    expect(isBattle(new RNG(firstPossibleRNG).prev(), area)).toBe(true);
  });
});

describe('findRNG', () => {
  test('realistic mode skips the battle value right after a battle', () => {
    const area = ENCOUNTER_AREAS.find((a) => a.name === 'Moravia Area');
    const options = { iterations: 2_000_000 };
    const plain = generateEncounters(new RNG(0x12), area, options);
    const realistic = generateEncounters(new RNG(0x12), area, { ...options, realistic: true });
    expect(realistic.length).toBeLessThan(plain.length);
    // no two battles in the realistic list are one RNG call apart
    for (let i = 1; i < realistic.length; i++) {
      expect(realistic[i].index - realistic[i - 1].index).toBeGreaterThan(1);
    }
  });

  test('needs at least two fights to go on', () => {
    expect(findRNG(ENCOUNTER_AREAS[0], [3], 0x12, () => {})).toEqual([]);
  });
});

describe("the scan's inlined RNG step", () => {
  test("steps exactly as the lib's RNG does", () => {
    for (const seed of [0, 0x12, 0x7fffffff, 0x80000000, 0xdeadbeef, 0xffffffff]) {
      const rng = new RNG(seed);
      let raw = seed | 0;
      for (let i = 0; i < 100_000; i++) {
        rng.next();
        raw = (Math.imul(raw, LCG.MULTIPLIER) + LCG.INCREMENT) | 0;
        if (rng.raw !== raw >>> 0) throw new Error(`diverged from the lib at step ${i + 1}`);
      }
    }
  });
});

describe('tablesFor', () => {
  // one world map area and one dungeon, since the battle check differs between them
  const areas = ['Moravia Area', "Lepant's Mansion", 'Cave of the Past'].map((name) =>
    ENCOUNTER_AREAS.find((a) => a.name === name),
  );

  test.each(areas.map((area) => [area.name, area]))(
    "%s: agrees with the lib's own checks on real RNG states",
    (_name, area) => {
      expect(new Set(areas.map((a) => a.areaType)).size).toBe(2);
      const { battle, group } = tablesFor(area);
      const rng = new RNG(0x12);
      for (let i = 0; i < 300_000; i++) {
        const rand = (rng.raw >>> 16) & 0x7fff;
        if (battle[rand] !== (isBattle(rng, area) ? 1 : 0)) throw new Error(`battle, step ${i}`);
        if (battle[rand] === 1 && group[rng.peek().rand] !== encounterIndex(rng, area)) {
          throw new Error(`group, step ${i}`);
        }
        rng.next();
      }
    },
  );

  test('every group in a table is a real group of the area', () => {
    for (const area of areas) {
      const { group } = tablesFor(area);
      expect(Math.max(...group)).toBeLessThan(area.encounters.length);
    }
  });
});

describe('a half search', () => {
  test('finds each match once, and the twin of each match plays out the same fights', () => {
    const area = ENCOUNTER_AREAS.find((a) => a.name === 'Cave of the Past');
    const realistic = true;
    const seen = generateEncounters(new RNG(0x12), area, { iterations: 5_000_000, realistic });
    const wanted = seen.slice(1500, 1506).map((fight) => fight.encounterIndex);

    const matches = findRNG(area, wanted, 0x12, () => {}, {
      realistic,
      findAll: true,
      maxMatches: 1e9,
    });
    expect(matches.length).toBeGreaterThan(1);
    expect(new Set(matches.map((m) => m.foundEncounterRNG)).size).toBe(matches.length);
    // no match is the twin of another: each pair is reported once
    const found = new Set(matches.map((m) => m.foundEncounterRNG));
    for (const m of matches) expect(found.has(twinOf(m.foundEncounterRNG))).toBe(false);

    for (const m of matches) {
      for (const raw of [m.foundEncounterRNG, twinOf(m.foundEncounterRNG)]) {
        const fights = generateEncounters(new RNG(raw), area, { iterations: 200_000, realistic });
        expect(fights[0].startRNG).toBe(raw);
        expect(fights.slice(0, wanted.length).map((f) => f.encounterIndex)).toEqual(wanted);
      }
    }
  });
});
