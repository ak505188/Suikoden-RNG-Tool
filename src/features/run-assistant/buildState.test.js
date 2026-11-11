import { describe, expect, test } from 'vitest';
import { RNG, generateEncounters } from 'suikoden-rng-lib/encounters';
import { ENCOUNTER_AREAS } from 'shared/lib/encounters';
import { buildRunAssistantState } from './buildState';
import reducer, { findFight, getCurrentFight, getCurrentFights } from './reducers/runAssistant';
import { findFight as findFightAction, nextFight, switchArea } from './actions/runAssistant';

const query = (extra = {}) =>
  new URLSearchParams({
    rng: '18',
    iterations: '20000',
    partyLevel: '0',
    realistic: 'true',
    areas: 'Cave of the Past,Dragons Den',
    ...extra,
  }).toString();

describe('buildRunAssistantState', () => {
  const { state } = buildRunAssistantState(query());

  test('has one area per id in the URL, found by the same ids as before (no apostrophes)', () => {
    expect(state.areas.map((area) => area.name)).toEqual(['Cave of the Past', "Dragon's Den"]);
    expect(state.fightsList).toHaveLength(2);
  });

  test('the fights are the ones the lib generates from that RNG', () => {
    const cave = ENCOUNTER_AREAS.find((a) => a.name === 'Cave of the Past');
    const expected = generateEncounters(new RNG(18), cave, { iterations: 20000, realistic: true });
    expect(
      state.fightsList[0].map((f) => [f.index, f.startRNG, f.battleRNG, f.run, f.wheel]),
    ).toEqual(expected.map((f) => [f.index, f.startRNG, f.battleRNG, f.run, f.wheel]));
  });

  test('each fight carries the group the Run Assistant shows: name, enemies, champion value', () => {
    for (const fight of state.fightsList[0]) {
      expect(fight.enemyGroup).toBe(state.areas[0].enemies[fight.encounterIndex]);
      expect(fight.enemyGroup.name).toEqual(expect.any(String));
      expect(fight.enemyGroup.enemies.length).toBeGreaterThan(0);
      expect(fight.enemyGroup.champVal).toBeGreaterThan(0);
    }
  });

  test('starts on the first fight of the first area, or at the index in the URL', () => {
    expect(state.currentArea).toBe(0);
    expect(state.index).toBe(0);
    expect(buildRunAssistantState(query({ index: '5' })).state.index).toBe(5);
    expect(buildRunAssistantState(query({ index: '999999' })).state.index).toBe(0); // past the end
  });

  test('a missing party level counts as 0', () => {
    const params = new URLSearchParams(query());
    params.delete('partyLevel');
    const withoutLevel = buildRunAssistantState(params.toString()).state;
    expect(withoutLevel.fightsList[0].length).toBe(state.fightsList[0].length);
  });
});

// The reducers find groups by name and fights by index; check they cope with the new groups
describe('the reducers with the new groups', () => {
  const { state } = buildRunAssistantState(query());

  test('findFight finds the next fight with the same group, by name', () => {
    const name = getCurrentFight(state).enemyGroup.name;
    const next = findFight(state, name);
    expect(next).toBeGreaterThan(0);
    expect(getCurrentFights(state)[next].enemyGroup.name).toBe(name);
  });

  test('FIND_FIGHT moves to that fight, and NEXT_FIGHT moves on from there', () => {
    const name = getCurrentFights(state)[3].enemyGroup.name;
    const found = reducer(state, findFightAction(name));
    expect(getCurrentFight(found).enemyGroup.name).toBe(name);
    expect(reducer(found, nextFight()).index).toBe(found.index + 1);
  });

  test('switching area keeps the position by RNG index', () => {
    const switched = reducer(reducer(state, nextFight()), switchArea("Dragon's Den"));
    expect(switched.currentArea).toBe(1);
    expect(getCurrentFight(switched).index).toBeGreaterThanOrEqual(0);
  });

  test('pattern mode matches a run of groups, also in an area that lists a group twice', () => {
    const { state: island } = buildRunAssistantState(query({ areas: 'Magicians Island' }));
    const withPattern = { ...island, patternMode: true };
    const fights = getCurrentFights(withPattern);
    // enter the names of fights 40 to 42 one by one
    let current = withPattern;
    for (const fight of fights.slice(40, 43))
      current = reducer(current, findFightAction(fight.enemyGroup.name));
    expect(current.pattern).toHaveLength(3);
    // it lands on the last fight of a place where those three groups come in a row
    const names = fights.map((f) => f.enemyGroup.name);
    const wanted = names.slice(40, 43).join('|');
    const at = current.index;
    expect(names.slice(at - 2, at + 1).join('|')).toBe(wanted);
  });
});
