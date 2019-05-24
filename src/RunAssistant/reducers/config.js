import { handleActions } from 'redux-actions';

const columns = [
  { label: 'Area', key: 'area', width: 200, show: false },
  { label: 'Enemy Group', key: 'enemyGroup', width: 300, show: true },
  { label: 'Enemy Group Image', key: 'enemyGroupImage', width: 300, show: false },
  { label: 'Index', key: 'index', width: 100, show: true },
  { label: 'Run', key: 'run', width: 100, show: true },
  { label: 'Encounter RNG', key: 'startRNG', width: 150, show: false },
  { label: 'Battle RNG', key: 'battleRNG', width: 150, show: true },
  { label: 'Wheel Attempts', key: 'wheel', width: 150, show: true },
  { label: 'Champion Value', key: 'champVal', width: 150, show: false }
];

export const initialState = {
  useImages: false,
  compactMode: false,
  columns,
  table: {
    rowHeight: 30,
    headerHeight: 30,
    rowStyle: {
      fontSize: 16
    }
  },
  hotkeys: {
    nextFight: 'n',
    prevFight: 'b',
    compactModeEnemyButtons: ['1', '2', '3', '4', '5', '6']
  }
};

export default handleActions(
  {
    CHANGE_USE_IMAGES: (state, action) => (
      { ...state, useImages: action.useImages }
    ),
    CHANGE_COMPACT_MODE: (state, action) => (
      { ...state, compactMode: action.compactMode }
    ),
    CHANGE_COLUMN_VISIBILITY: (state, action) => (
      {
        ...state,
        columns: state.columns.map((column, index) => {
          if (index !== action.index) {
            return column;
          }
          return { ...column, show: action.show };
        })
      }
    ),
    CHANGE_TABLE_ROW_HEIGHT: (state, action) => (
      { ...state, table: { ...state.table, rowHeight: action.height } }
    ),
    CHANGE_TABLE_HEADER_HEIGHT: (state, action) => (
      { ...state, table: { ...state.table, headerHeight: action.height } }
    ),
    CHANGE_ROW_FONT_SIZE: (state, action) => (
      { ...state,
        table: {
          ...state.table,
          rowStyle: {
            ...state.table.rowStyle,
            fontSize: action.size
          }
        }
      }
    ),
    CHANGE_HOTKEY: (state, action) => ({
      ...state,
      hotkeys: {
        ...state.hotkeys,
        [action.action]: action.key
      }
    }),
    CHANGE_COMPACT_MODE_ENEMY_BUTTONS_HOTKEY: (state, action) => ({
      ...state,
      hotkeys: {
        ...state.hotkeys,
        compactModeEnemyButtons: [
          ...state.hotkeys.compactModeEnemyButtons.slice(0, action.index),
          action.key,
          ...state.hotkeys.compactModeEnemyButtons.slice(action.index + 1)
        ]
      }
    }),
    RESET_TO_DEFAULT: (_state, _action) => initialState
  },
  initialState);
