import * as React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { Divider } from 'semantic-ui-react';
import { RNG } from 'suikoden-rng-lib';
import { ConnectedTable as Table } from './Table';
import ConnectedControls from './controls';
import reducer from './reducers';
import { initialState as configDefault } from './reducers/config';
import { initialState as controlsDefault } from './reducers/controls';

const logger = createLogger({});

class RunAssistantTool extends React.Component {
  constructor(props) {
    super(props);
    const params = new URLSearchParams(this.props.location.search);
    const rng = parseInt(params.get('rng'));
    const iterations = parseInt(params.get('iterations'));
    const partylevel = parseInt(params.get('partylevel'));
    const areas = params.get('areas').split(',').map((name) => {
      return this.props.areas[name];
    });
    const realistic = params.get('realistic') !== 'false';
    const fightsList = areas.map(
      area => area.generateEncounters(new RNG(rng), iterations, partylevel, realistic)
    );
    const index = params.get('index') !== null
      ? parseInt(params.get('index'))
      : 0;

    let config = window.localStorage.getItem('config');
    config = config === null ? configDefault : {
      ...configDefault,
      ...JSON.parse(config),
      table: {
        ...configDefault.table,
        ...JSON.parse(config).table,
        rowStyle: {
          ...configDefault.table.rowStyle,
          ...JSON.parse(config).table.rowStyle
        }
      },
      hotkeys: {
        ...configDefault.hotkeys,
        ...JSON.parse(config).hotkeys
      }
    };

    const initialState = {
      RunAssistant: {
        currentArea: 0,
        areas: areas.map(area => ({
          name: area.name,
          enemies: area.encounterTable.map(group => {
            const { name, enemies, champVal } = group;
            return { name, enemies, champVal };
          })
        })),
        fightsList,
        index: index < fightsList[0].length ? index : 0,
        pattern: [],
        patternMode: false
      },
      config: config,
      controls: controlsDefault
    };

    this.state = { store: createStore(reducer, initialState, applyMiddleware(logger)) };
  }

  render() {
    return (
      <Provider store={this.state.store}>
        <React.Fragment>
          <ConnectedControls/>
          <Divider hidden={true}/>
          <Table/>
        </React.Fragment>
      </Provider>
    );
  }
}

export default withRouter(RunAssistantTool);
