import config from './config';
import runAssistant from './runAssistant';
import controls from './controls';
import { combineReducers } from 'redux';

export default combineReducers({
  RunAssistant: runAssistant,
  config,
  controls,
});
