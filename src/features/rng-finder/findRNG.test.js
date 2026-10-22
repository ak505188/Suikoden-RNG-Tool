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
const STEPS = 5_000_000; // enough for two buffers (about 3% of RNG steps start a battle here)

// Every place `wanted` occurs in `ids` (matches may overlap), in order
const occurrences = (ids, wanted) =>
  ids.flatMap((_, start) =>
    wanted.every((id, offset) => ids[start + offset] === id) ? [start] : [],
  );
const firstOccurrence = (ids, wanted) => occurrences(ids, wanted)[0];

// The first `count` fights a player gets standing on `raw`, worked out step by step with the
// lib's own checks: the first battle value, its group, the call the group uses, and on
const sequenceFrom = (area, raw, count) => {
  const rng = new RNG(raw);
  const groups = [];
  while (groups.length < count) {
    if (isBattle(rng, area)) {
      groups.push(encounterIndex(rng, area));
      rng.next(); // spent on the group
    }
    rng.next();
  }
  return groups;
};

// Every RNG value in `battles` (all the battle values, in order) where a player gets `wanted`
// as their first fights. The first fight can be any battle value: the player may start on it.
const trueStarts = (area, wanted, battles) =>
  battles
    .filter((battle) => battle.encounterIndex === wanted[0]) // cheap first look
    .filter((battle) => sequenceFrom(area, battle.startRNG, wanted.length).join() === wanted.join())
    .map((battle) => battle.startRNG);

// The call after the battle before `matchRaw`, and the values between them
const expectedFirstPossible = (battles, matchRaw) => {
  const at = battles.findIndex((battle) => battle.startRNG === matchRaw);
  const before = battles[at - 1];
  return {
    rng: new RNG(before.startRNG).next().raw,
    gap: battles[at].index - before.index - 1,
  };
};

describe('findRNG', () => {
  let area, allBattles, fights, ids;
  beforeAll(() => {
    area = ENCOUNTER_AREAS.find((a) => a.name === 'Moravia Area');
    // Every battle value from the seed
    allBattles = generateEncounters(new RNG(0x12), area, { iterations: STEPS });
    // The fights a player walking from the seed would get, one after another
    fights = generateEncounters(new RNG(0x12), area, { iterations: STEPS, realistic: true });
    ids = fights.map((fight) => fight.encounterIndex);
    expect(fights.length).toBeGreaterThan(BUFFER * 2);
  });

  const first = { maxMatches: 1 };

  test('finds the RNG a run of fights started at', () => {
    const wanted = ids.slice(30000, 30010);
    const at = firstOccurrence(ids, wanted);
    expect(at).toBeLessThan(BUFFER);

    expect(findRNG(area, wanted, 0x12, () => {}, first)[0].foundEncounterRNG).toBe(
      fights[at].startRNG,
    );
  });

  test('finds a run that straddles the end of a full buffer', () => {
    const wanted = ids.slice(BUFFER - 5, BUFFER + 6);
    const at = firstOccurrence(ids, wanted);
    expect(at).toBe(BUFFER - 5); // the first place it occurs is the one that straddles

    expect(findRNG(area, wanted, 0x12, () => {}, first)[0].foundEncounterRNG).toBe(
      fights[at].startRNG,
    );
  });

  test('reports the first possible RNG and the gap before the match', () => {
    const wanted = ids.slice(30000, 30010);
    const at = firstOccurrence(ids, wanted);
    const updates = [];
    findRNG(area, wanted, 0x12, (status) => updates.push(status), first);

    const [match] = updates[updates.length - 1].matches;
    expect(match.foundEncounterRNG).toBe(fights[at].startRNG);
    expect({ rng: match.firstPossibleRNG, gap: match.gap }).toEqual(
      expectedFirstPossible(allBattles, fights[at].startRNG),
    );
  });

  test('with maxMatches of 1 it stops at the first match', () => {
    const wanted = ids.slice(30000, 30010);
    expect(findRNG(area, wanted, 0x12, () => {}, first)).toHaveLength(1);
  });

  test('matches go out through the progress callback as they are found', () => {
    const wanted = ids.slice(30000, 30003); // occurs many times over two buffers
    const updates = [];
    const matches = findRNG(area, wanted, 0x12, (status) => updates.push(status), {
      maxSteps: 4_500_000,
    });
    const counts = updates.map((status) => status.matches.length);
    expect(matches.length).toBeGreaterThan(10);
    expect(counts[counts.length - 1]).toBe(matches.length);
    expect(counts).toEqual([...counts].sort((a, b) => a - b)); // never goes down
    expect(counts.some((count) => count > 0 && count < matches.length)).toBe(true); // in stages
    // each update has its own copy of the list
    expect(updates[0].matches).not.toBe(updates[updates.length - 1].matches);
  });

  test('progress is a whole percent that only goes up, and ends at 100', () => {
    const wanted = ids.slice(30000, 30003);
    const updates = [];
    findRNG(area, wanted, 0x12, (status) => updates.push(status), { maxSteps: 4_500_000 });

    const progress = updates.map((status) => status.progress);
    expect(progress.every((p) => Number.isInteger(p) && p >= 0 && p <= 100)).toBe(true);
    expect(progress).toEqual([...progress].sort((a, b) => a - b));
    expect(progress[progress.length - 1]).toBe(100);
    expect(new Set(progress).size).toBeGreaterThan(50); // it really does move in small steps
  });

  test('stops at maxMatches and flags that the limit was reached', () => {
    const wanted = ids.slice(30000, 30003);
    const updates = [];
    findRNG(area, wanted, 0x12, (status) => updates.push(status), { maxMatches: 3 });
    const last = updates[updates.length - 1];
    expect(last.done).toBe(true);
    expect(last.matches).toHaveLength(3);
    expect(last.limitReached).toBe(true);
  });

  describe('against a step-by-step search from every battle value', () => {
    // The search must find exactly the places a player gets the fights, in order, however the
    // buffers and the skipped battle values fall
    const searchAll = (wanted) =>
      findRNG(area, wanted, 0x12, () => {}, { maxSteps: STEPS, maxMatches: 1e9 });

    test('a sequence that comes up many times', () => {
      const wanted = ids.slice(30000, 30003);
      const expected = trueStarts(area, wanted, allBattles);
      expect(expected.length).toBeGreaterThan(20);
      expect(searchAll(wanted).map((m) => m.foundEncounterRNG)).toEqual(expected);
    });

    test('a sequence that starts on a battle value the game would have spent on a group', () => {
      // a battle value right after a battle that does count: the first fight can still be there
      const chain = new Set(fights.map((fight) => fight.startRNG));
      const skipped = allBattles.find((battle, i) => i > 1000 && !chain.has(battle.startRNG));
      const wanted = sequenceFrom(area, skipped.startRNG, 4);
      const expected = trueStarts(area, wanted, allBattles);
      expect(expected).toContain(skipped.startRNG);

      const matches = searchAll(wanted);
      expect(matches.map((m) => m.foundEncounterRNG)).toEqual(expected);

      // standing right on it, with the battle before it already behind you
      const match = matches.find((m) => m.foundEncounterRNG === skipped.startRNG);
      expect(match.gap).toBe(0);
      expect(match.firstPossibleRNG).toBe(skipped.startRNG);
    });
  });

  // maxSteps ends the scan just after the battle at fights[i]
  const stepsThrough = (i) => fights[i].index + 2;

  test('a match that starts before the end of the steps is found even though it finishes after', () => {
    const k = 30000;
    const wanted = ids.slice(k, k + 6);
    expect(firstOccurrence(ids, wanted)).toBe(k); // unique, so the only place to look

    // the steps end after the third of its six battles
    const matches = findRNG(area, wanted, 0x12, () => {}, { maxSteps: stepsThrough(k + 2) });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([fights[k].startRNG]);
  });

  test('a match that starts after the end of the steps is not reported', () => {
    const k = 30000;
    const wanted = ids.slice(k + 3, k + 9);
    expect(firstOccurrence(ids, wanted)).toBe(k + 3);

    // the steps end after battle k + 2: the match starts with battle k + 3
    const matches = findRNG(area, wanted, 0x12, () => {}, { maxSteps: stepsThrough(k + 2) });
    expect(matches).toEqual([]);
  });

  test('a match that starts on the very last battle of the steps is found', () => {
    const k = 30000;
    const wanted = ids.slice(k, k + 6);
    expect(firstOccurrence(ids, wanted)).toBe(k);

    const matches = findRNG(area, wanted, 0x12, () => {}, { maxSteps: stepsThrough(k) });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([fights[k].startRNG]);
  });

  test('searches the last, part-filled buffer too', () => {
    // Steps run out when the second buffer is only partly full. A run of fights at the very end
    // of those steps is only in that part-filled buffer.
    const maxSteps = 2_500_000;
    const seen = generateEncounters(new RNG(0x12), area, { iterations: maxSteps, realistic: true });
    const seenIds = seen.map((fight) => fight.encounterIndex);
    expect(seen.length).toBeGreaterThan(BUFFER + 100);
    expect(seen.length).toBeLessThan(BUFFER * 2 - 100);

    const wanted = seenIds.slice(-8);
    const at = firstOccurrence(seenIds, wanted);
    expect(at).toBeGreaterThan(BUFFER); // not in the first, full buffer

    const matches = findRNG(area, wanted, 0x12, () => {}, { maxSteps });
    expect(matches.map((m) => m.foundEncounterRNG)).toEqual([seen[at].startRNG]);
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
    const seen = generateEncounters(new RNG(0x12), area, {
      iterations: 5_000_000,
      realistic: true,
    });
    const wanted = seen.slice(1500, 1506).map((fight) => fight.encounterIndex);

    const matches = findRNG(area, wanted, 0x12, () => {}, { maxMatches: 1e9 });
    expect(matches.length).toBeGreaterThan(1);
    expect(new Set(matches.map((m) => m.foundEncounterRNG)).size).toBe(matches.length);
    // no match is the twin of another: each pair is reported once
    const found = new Set(matches.map((m) => m.foundEncounterRNG));
    for (const m of matches) expect(found.has(twinOf(m.foundEncounterRNG))).toBe(false);

    for (const m of matches) {
      for (const raw of [m.foundEncounterRNG, twinOf(m.foundEncounterRNG)]) {
        const fights = generateEncounters(new RNG(raw), area, {
          iterations: 200_000,
          realistic: true,
        });
        expect(fights[0].startRNG).toBe(raw);
        expect(fights.slice(0, wanted.length).map((f) => f.encounterIndex)).toEqual(wanted);
      }
    }
  });
});
