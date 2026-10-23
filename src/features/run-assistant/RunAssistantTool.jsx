import * as React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Divider } from 'semantic-ui-react';
import InvalidLink from 'shared/ui/InvalidLink';
import { ConnectedTable as Table } from './Table';
import ConnectedControls from './controls';
import reducer from './reducers';
import { buildRunAssistantState } from './buildState';
import { initialState as configDefault } from './reducers/config';
import { initialState as controlsDefault } from './reducers/controls';

// Logs every action to the console while developing; the production build leaves it out
const middleware = import.meta.env.DEV
  ? applyMiddleware((await import('redux-logger')).createLogger({}))
  : undefined;

class RunAssistantTool extends React.Component {
  constructor(props) {
    super(props);
    const { state, problems } = buildRunAssistantState(this.props.location.search);
    if (problems.length > 0) {
      this.state = { problems };
      return;
    }

    let config = window.localStorage.getItem('config');
    config =
      config === null
        ? configDefault
        : {
            ...configDefault,
            ...JSON.parse(config),
            table: {
              ...configDefault.table,
              ...JSON.parse(config).table,
              rowStyle: {
                ...configDefault.table.rowStyle,
                ...JSON.parse(config).table.rowStyle,
              },
            },
            hotkeys: {
              ...configDefault.hotkeys,
              ...JSON.parse(config).hotkeys,
            },
          };

    const initialState = {
      RunAssistant: state,
      config: config,
      controls: controlsDefault,
    };

    this.state = { store: createStore(reducer, initialState, middleware) };
  }

  render() {
    if (this.state.problems) {
      return <InvalidLink problems={this.state.problems} formPath="/runassist" />;
    }
    return (
      <Provider store={this.state.store}>
        <React.Fragment>
          <ConnectedControls />
          <Divider hidden={true} />
          <Table />
        </React.Fragment>
      </Provider>
    );
  }
}

export default withRouter(RunAssistantTool);
