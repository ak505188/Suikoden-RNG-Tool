import { handleActions } from 'redux-actions';

export const initialState = {
  compactEnemyButtonsGroupSize: null
};

export default handleActions(
  {
    SET_ENEMY_BUTTON_GROUP_SIZE: (state, action) => (
      { ...state, compactEnemyButtonsGroupSize: action.size }
    ),
    FIND_FIGHT: (state, _action) => (
      { ...state, compactEnemyButtonsGroupSize: null }
    ),
    SWITCH_AREA: (state, _action) => (
      { ...state, compactEnemyButtonsGroupSize: null }
    ),
    RESET_TO_DEFAULT: (_state, _action) => initialState
  },
  initialState);
