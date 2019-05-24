import config from './config';
import RunAssistant from './RunAssistant';
import controls from './controls';
import { combineReducers } from 'redux';

export default combineReducers({
  RunAssistant,
  config,
  controls
});
