import * as React from 'react';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Divider } from 'semantic-ui-react';
import InvalidLink from 'shared/ui/InvalidLink';
import { ConnectedTable as Table } from './Table';
import ConnectedControls from './controls';
import reducer from './reducers';
import { buildRunAssistantState } from './buildState';
import { loadConfig } from './loadConfig';
import { initialState as controlsDefault } from './reducers/controls';

// Logs every action to the console while developing; the production build leaves it out
const middleware = import.meta.env.DEV
  ? applyMiddleware((await import('redux-logger')).createLogger({}))
  : undefined;

const RunAssistantTool = () => {
  const { search } = useLocation();
  // Built once, when the page opens: the store holds the run's progress, so it must survive
  // re-renders
  const [{ store, problems }] = React.useState(() => {
    const { state, problems } = buildRunAssistantState(search);
    if (problems.length > 0) return { problems };

    const initialState = {
      RunAssistant: state,
      config: loadConfig(window.localStorage.getItem('config')),
      controls: controlsDefault,
    };
    return { store: createStore(reducer, initialState, middleware) };
  });

  if (problems) return <InvalidLink problems={problems} formPath="/runassist" />;

  return (
    <Provider store={store}>
      <React.Fragment>
        <ConnectedControls />
        <Divider hidden={true} />
        <Table />
      </React.Fragment>
    </Provider>
  );
};

export default RunAssistantTool;
