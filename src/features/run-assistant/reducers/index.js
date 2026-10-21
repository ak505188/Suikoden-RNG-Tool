import config from './config';
import RunAssistant from 'features/run-assistant';
import controls from './controls';
import { combineReducers } from 'redux';

export default combineReducers({
  RunAssistant,
  config,
  controls,
});
