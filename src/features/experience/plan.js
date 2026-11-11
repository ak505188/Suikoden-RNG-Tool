import { moveItem, pushUndo } from './lib';

// The EXP plan: the characters (in column order), the fights (in row order) and, for each fight,
// the names of the characters sitting it out. `disabledCharacters` always has one entry per
// fight, so everything that adds, removes or moves a fight does the same to it, here.
//
// `undoStack` holds the whole plan as it was before a removal or an import, so undoing restores
// exactly what was there.
export const emptyPlan = { characters: [], fights: [], disabledCharacters: [], undoStack: [] };

// The three lists that make up a saved plan
export const planData = ({ characters, fights, disabledCharacters }) => ({
  characters,
  fights,
  disabled_characters: disabledCharacters,
});

export const planActions = {
  addCharacters: (names) => ({ type: 'addCharacters', names }),
  addFight: (fight) => ({ type: 'addFight', fight }),
  removeCharacter: (index) => ({ type: 'removeCharacter', index }),
  removeFight: (index) => ({ type: 'removeFight', index }),
  changeFight: (index, fight) => ({ type: 'changeFight', index, fight }),
  toggleFight: (index) => ({ type: 'toggleFight', index }),
  toggleDisabledCharacter: (name, fightIndex) => ({ type: 'toggleDisabled', name, fightIndex }),
  setCharacterLevel: (index, level) => ({ type: 'setLevel', index, level }),
  moveCharacter: (from, to) => ({ type: 'moveCharacter', from, to }),
  moveFight: (from, to) => ({ type: 'moveFight', from, to }),
  clear: () => ({ type: 'clear' }),
  // `data` is what normalizeImport returns
  importPlan: (data) => ({ type: 'import', data }),
  undo: () => ({ type: 'undo' }),
};

const remember = (plan, label) => ({
  ...plan,
  undoStack: pushUndo(plan.undoStack, {
    label,
    characters: plan.characters,
    fights: plan.fights,
    disabledCharacters: plan.disabledCharacters,
  }),
});

const without = (list, index) => [...list.slice(0, index), ...list.slice(index + 1)];
const replaceAt = (list, index, item) => [...list.slice(0, index), item, ...list.slice(index + 1)];

export const planReducer = (plan, action) => {
  switch (action.type) {
    case 'addCharacters':
      return {
        ...plan,
        characters: [...plan.characters, ...action.names.map((name) => ({ name, level: 1 }))],
      };

    case 'addFight': {
      // A new fight starts with the same characters sitting out as the one before it
      const last = plan.disabledCharacters[plan.disabledCharacters.length - 1] ?? [];
      return {
        ...plan,
        fights: [...plan.fights, action.fight],
        disabledCharacters: [...plan.disabledCharacters, [...last]],
      };
    }

    case 'removeCharacter':
      return {
        ...remember(plan, `removed ${plan.characters[action.index].name}`),
        characters: without(plan.characters, action.index),
      };

    case 'removeFight':
      return {
        ...remember(plan, `removed ${plan.fights[action.index].enemy_group.name}`),
        fights: without(plan.fights, action.index),
        disabledCharacters: without(plan.disabledCharacters, action.index),
      };

    case 'changeFight':
      return { ...plan, fights: replaceAt(plan.fights, action.index, action.fight) };

    case 'toggleFight': {
      const fight = plan.fights[action.index];
      return {
        ...plan,
        fights: replaceAt(plan.fights, action.index, { ...fight, enabled: !fight.enabled }),
      };
    }

    case 'toggleDisabled': {
      const sitting = plan.disabledCharacters[action.fightIndex];
      const next = sitting.includes(action.name)
        ? sitting.filter((name) => name !== action.name)
        : [...sitting, action.name];
      return {
        ...plan,
        disabledCharacters: replaceAt(plan.disabledCharacters, action.fightIndex, next),
      };
    }

    case 'setLevel':
      return {
        ...plan,
        characters: replaceAt(plan.characters, action.index, {
          ...plan.characters[action.index],
          level: action.level,
        }),
      };

    case 'moveCharacter':
      return { ...plan, characters: moveItem(plan.characters, action.from, action.to) };

    case 'moveFight':
      return {
        ...plan,
        fights: moveItem(plan.fights, action.from, action.to),
        disabledCharacters: moveItem(plan.disabledCharacters, action.from, action.to),
      };

    case 'clear':
      if (plan.characters.length === 0 && plan.fights.length === 0) return plan;
      return {
        ...remember(plan, 'cleared the plan'),
        characters: [],
        fights: [],
        disabledCharacters: [],
      };

    case 'import': {
      const start =
        plan.characters.length > 0 || plan.fights.length > 0 ? remember(plan, 'import') : plan;
      return {
        ...start,
        characters: action.data.characters,
        fights: action.data.fights,
        disabledCharacters: action.data.disabled_characters,
      };
    }

    case 'undo': {
      const entry = plan.undoStack[plan.undoStack.length - 1];
      if (!entry) return plan;
      return {
        characters: entry.characters,
        fights: entry.fights,
        disabledCharacters: entry.disabledCharacters,
        undoStack: plan.undoStack.slice(0, -1),
      };
    }

    default:
      return plan;
  }
};
