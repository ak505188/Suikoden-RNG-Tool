import * as React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { Divider } from 'semantic-ui-react';
import { ConnectedTable as Table } from './Table';
import ConnectedControls from './controls';
import reducer from './reducers';
import { buildRunAssistantState } from './buildState';
import { initialState as configDefault } from './reducers/config';
import { initialState as controlsDefault } from './reducers/controls';

const logger = createLogger({});

class RunAssistantTool extends React.Component {
  constructor(props) {
    super(props);
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
      RunAssistant: buildRunAssistantState(this.props.location.search),
      config: config,
      controls: controlsDefault,
    };

    this.state = { store: createStore(reducer, initialState, applyMiddleware(logger)) };
  }

  render() {
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
