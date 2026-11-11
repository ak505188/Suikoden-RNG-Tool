import { describe, expect, test } from 'vitest';
import { UNDO_LIMIT } from './lib';
import { emptyPlan, planActions as act, planData, planReducer } from './plan';

const fight = (name, extra = {}) => ({
  enemy_group: { name, levels: [10] },
  party_size: 6,
  enabled: true,
  ...extra,
});
const run = (plan, ...actions) => actions.reduce(planReducer, plan);
const names = (plan) => plan.characters.map((c) => c.name);
const fightNames = (plan) => plan.fights.map((f) => f.enemy_group.name);

// Every test ends by checking the one rule that holds the plan together
const inStep = (plan) => expect(plan.disabledCharacters).toHaveLength(plan.fights.length);

const built = () =>
  run(
    emptyPlan,
    act.addCharacters(['Pahn', 'Cleo', 'Flik']),
    act.addFight(fight('A')),
    act.addFight(fight('B')),
    act.addFight(fight('C')),
  );

describe('adding', () => {
  test('characters start at level 1, after the ones already there', () => {
    const plan = run(emptyPlan, act.addCharacters(['Pahn']), act.addCharacters(['Cleo']));
    expect(plan.characters).toEqual([
      { name: 'Pahn', level: 1 },
      { name: 'Cleo', level: 1 },
    ]);
  });

  test('a fight starts with the characters sitting out of the one before it', () => {
    let plan = run(emptyPlan, act.addCharacters(['Pahn', 'Cleo']), act.addFight(fight('A')));
    expect(plan.disabledCharacters).toEqual([[]]);
    plan = run(plan, act.toggleDisabledCharacter('Cleo', 0), act.addFight(fight('B')));
    expect(plan.disabledCharacters).toEqual([['Cleo'], ['Cleo']]);
    plan = run(plan, act.toggleDisabledCharacter('Cleo', 1));
    expect(plan.disabledCharacters).toEqual([['Cleo'], []]); // not the same list shared by both
    inStep(plan);
  });
});

describe('removing', () => {
  test('a fight takes its sitting-out list with it', () => {
    let plan = built();
    plan = run(plan, act.toggleDisabledCharacter('Pahn', 1), act.removeFight(0));
    expect(fightNames(plan)).toEqual(['B', 'C']);
    expect(plan.disabledCharacters).toEqual([['Pahn'], []]);
    inStep(plan);
  });

  test('removing a character remembers the plan to undo', () => {
    const before = built();
    const plan = run(before, act.removeCharacter(1));
    expect(names(plan)).toEqual(['Pahn', 'Flik']);
    expect(plan.undoStack).toHaveLength(1);
    expect(plan.undoStack[0].label).toBe('removed Cleo');
    expect(names(run(plan, act.undo()))).toEqual(['Pahn', 'Cleo', 'Flik']);
  });

  test('undo brings back a removed fight with who was sitting it out', () => {
    let plan = run(built(), act.toggleDisabledCharacter('Flik', 2), act.removeFight(2));
    expect(plan.undoStack[0].label).toBe('removed C');
    plan = run(plan, act.undo());
    expect(fightNames(plan)).toEqual(['A', 'B', 'C']);
    expect(plan.disabledCharacters).toEqual([[], [], ['Flik']]);
    expect(plan.undoStack).toEqual([]);
    inStep(plan);
  });

  test('only the newest few removals can be undone', () => {
    let plan = built();
    for (let i = 0; i < UNDO_LIMIT + 3; i++) {
      plan = run(plan, act.addFight(fight(`F${i}`)), act.removeFight(plan.fights.length));
    }
    expect(plan.undoStack).toHaveLength(UNDO_LIMIT);
  });

  test('undo with nothing to undo changes nothing', () => {
    const plan = built();
    expect(run(plan, act.undo())).toBe(plan);
  });
});

describe('changing', () => {
  test('toggling a fight, changing its party size, and setting a level', () => {
    let plan = built();
    plan = run(plan, act.toggleFight(1));
    expect(plan.fights.map((f) => f.enabled)).toEqual([true, false, true]);
    plan = run(plan, act.toggleFight(1));
    expect(plan.fights[1].enabled).toBe(true);
    plan = run(plan, act.changeFight(2, { ...plan.fights[2], party_size: 3 }));
    expect(plan.fights.map((f) => f.party_size)).toEqual([6, 6, 3]);
    plan = run(plan, act.setCharacterLevel(1, 12.5));
    expect(plan.characters.map((c) => c.level)).toEqual([1, 12.5, 1]);
  });

  test('sitting a character out of one fight leaves the others alone, and can be undone', () => {
    let plan = built();
    plan = run(plan, act.toggleDisabledCharacter('Cleo', 1));
    expect(plan.disabledCharacters).toEqual([[], ['Cleo'], []]);
    plan = run(plan, act.toggleDisabledCharacter('Cleo', 1));
    expect(plan.disabledCharacters).toEqual([[], [], []]);
  });

  test('none of this touches the undo history', () => {
    const plan = run(
      built(),
      act.toggleFight(0),
      act.setCharacterLevel(0, 5),
      act.moveFight(0, 2),
      act.moveCharacter(0, 1),
    );
    expect(plan.undoStack).toEqual([]);
  });
});

describe('moving', () => {
  test('a fight moves with the characters who are sitting it out', () => {
    let plan = run(built(), act.toggleDisabledCharacter('Pahn', 0));
    plan = run(plan, act.moveFight(0, 2));
    expect(fightNames(plan)).toEqual(['B', 'C', 'A']);
    expect(plan.disabledCharacters).toEqual([[], [], ['Pahn']]);
    inStep(plan);
  });

  test('a character moves to a new column', () => {
    expect(names(run(built(), act.moveCharacter(2, 0)))).toEqual(['Flik', 'Pahn', 'Cleo']);
  });
});

describe('importing', () => {
  const data = {
    characters: [{ name: 'Viktor', level: 20 }],
    fights: [fight('Z')],
    disabled_characters: [['Viktor']],
  };

  test('into an empty plan replaces it and has nothing to undo', () => {
    const plan = run(emptyPlan, act.importPlan(data));
    expect(names(plan)).toEqual(['Viktor']);
    expect(plan.disabledCharacters).toEqual([['Viktor']]);
    expect(plan.undoStack).toEqual([]);
  });

  test('over a plan that has something in it can be undone', () => {
    const before = built();
    let plan = run(before, act.importPlan(data));
    expect(plan.undoStack.map((e) => e.label)).toEqual(['import']);
    plan = run(plan, act.undo());
    expect(names(plan)).toEqual(names(before));
    expect(fightNames(plan)).toEqual(fightNames(before));
    inStep(plan);
  });

  test('a plan can be exported and imported again unchanged', () => {
    const plan = run(built(), act.toggleDisabledCharacter('Cleo', 1));
    const again = run(emptyPlan, act.importPlan(planData(plan)));
    expect(planData(again)).toEqual(planData(plan));
  });
});

describe('clearing', () => {
  test('empties the plan, and Undo brings all of it back', () => {
    const before = run(built(), act.toggleDisabledCharacter('Cleo', 1));
    let plan = run(before, act.clear());
    expect(plan.characters).toEqual([]);
    expect(plan.fights).toEqual([]);
    expect(plan.disabledCharacters).toEqual([]);
    expect(plan.undoStack.map((e) => e.label)).toEqual(['cleared the plan']);
    plan = run(plan, act.undo());
    expect(planData(plan)).toEqual(planData(before));
    expect(plan.undoStack).toEqual([]);
  });

  test('new characters and fights can be added straight after', () => {
    const plan = run(built(), act.clear(), act.addCharacters(['Viktor']), act.addFight(fight('Z')));
    expect(names(plan)).toEqual(['Viktor']);
    expect(plan.disabledCharacters).toEqual([[]]);
  });

  test('clearing an empty plan changes nothing and leaves nothing to undo', () => {
    expect(run(emptyPlan, act.clear())).toBe(emptyPlan);
  });
});
