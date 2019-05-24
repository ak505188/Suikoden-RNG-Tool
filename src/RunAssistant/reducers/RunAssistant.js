import { handleActions } from 'redux-actions';
import { boyerMoore } from  '../../lib/findRNG';

const initialState = {
  currentArea: 0,
  areas: [],
  fightsList: [],
  index: 0,
  pattern: [],
  patternMode: false
};

function calcFightIndexAfterRNGChange(fights, index) {
  for (let i = 0; i < fights.length; i++) {
    if (fights[i].index > index) {
      return i;
    }
  }
  return fights.length - 1;
}

export default handleActions(
  {
    SWITCH_AREA: (state, action) => {
      const currentArea = state.areas.map(area => area.name).findIndex(name => action.area === name);
      const rngIndex = getCurrentFight(state).index;
      if (currentArea === -1) {
        return state;
      }

      let index = state.index;
      if (state.fightsList[currentArea].length <= index) {
        index = state.fightsList[currentArea].length - 1;
      }

      // Decrement index until rng is lower than current
      while (state.fightsList[currentArea][index].index > rngIndex && index > 0) {
        index--;
      }

      // Then increment index until rng is 1 higher than current
      while (state.fightsList[currentArea][index].index < rngIndex
        && index < state.fightsList[currentArea].length - 1) {
        index++;
      }

      return {
        ...state,
        currentArea,
        pattern: [],
        index
      };
    },
    PREVIOUS_FIGHT: (state, _action) => {
      if (state.index !== 0) {
        return {
          ...state,
          pattern: [],
          index: state.index - 1
        };
      }
      return state;
    },
    NEXT_FIGHT: (state, _action) => {
      if (state.index < getCurrentFights(state).length - 1) {
        return {
          ...state,
          pattern: [],
          index: state.index + 1
        };
      }
      return state;
    },
    SELECT_FIGHT: (state, action) => {
      if (action.index < getCurrentFights(state).length - 1) {
        return {
          ...state,
          pattern: [],
          index: action.index
        };
      }
      return state;
    },
    FIND_FIGHT: (state, action) => {
      if (!state.patternMode) {
        let index = findFight(state, action.name);
        index = index !== -1 ? index : state.index;
        return {
          ...state,
          pattern: [],
          index
        };
      }
      const currentArea = getCurrentArea(state);
      const encounterTableIndex = getEnemyGroupEncounterIndex(action.name, currentArea.enemies);
      const pattern = state.pattern.concat([encounterTableIndex]);
      const searchStartIndex = Math.max(0, state.index - pattern.length + 2);
      const fights = getCurrentFights(state)
        .map(fight => (getEnemyGroupEncounterIndex(fight.enemyGroup.name, currentArea.enemies)))
        .slice(searchStartIndex);
      if (pattern.length > 1) {
        const i = boyerMoore(fights, pattern, currentArea.enemies.length);
        if (i !== null) {
          return {
            ...state,
            pattern,
            index: searchStartIndex + i + pattern.length - 1
          };
        } else {
          return state;
        }
      }
      const index = findFight({...state, index: searchStartIndex }, action.name);
      return {
        ...state,
        pattern,
        index: index !== -1 ? index : searchStartIndex
      };
    },
    JUMP_RNG: (state, action) => {
      const fights = getCurrentFights(state);
      const index = calcFightIndexAfterRNGChange(fights, getCurrentFight(state).index + action.jump);
      return {
        ...state,
        pattern: [],
        index
      };
    },
    TOGGLE_PATTERN_MODE: (state, _action) => ({
      ...state, patternMode: !state.patternMode
    })
  },
  initialState);

// Returns { name: string, enemies: EnemyGroupData[] }
export function getCurrentArea(state) {
  return state.areas[state.currentArea];
}

// Returns EnemyGroupData[]
export function getCurrentEnemies(state) {
  return getCurrentArea(state).enemies;
}

// Returns Fight
export function getCurrentFight(state) {
  return state.fightsList[state.currentArea][state.index];
}

// Returns Fight[]
export function getCurrentFights(state) {
  return state.fightsList[state.currentArea];
}

// Returns Fight
export function getFight(state, index) {
  return getCurrentFights(state)[index];
}

// Returns index of next fight of an enemy group
export function findFight(state, enemyGroup) {
  return getCurrentFights(state).findIndex((fight, index) => {
    return (fight.enemyGroup.name === enemyGroup && index > state.index);
  });
}

// Returns index of next fight with current enemyGroup
export function findNextFight(state) {
  const name = getCurrentFight(state).enemyGroup.name;
  return findFight(state, name);
}

function getEnemyGroupEncounterIndex(name, enemies) {
  return enemies.findIndex(group => {
    return (group.name === name);
  });
}
