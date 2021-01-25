import * as React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import EncountersForm from 'components/encounters/form';
import EncounterResult from 'components/encounters/result';
import ItemDropsForm from 'components/itemdrops/form';
import ItemDropsResult from 'components/itemdrops/result';
import SequenceForm from 'components/sequence/form';
import SequenceResult from 'components/sequence/result';
import NPCForm from 'components/npc-movements/form/';
import NPCResult from 'components/npc-movements/result/';
import RNGFinder from 'components/rngfinder';
import Experience from './components/experience';
import RunAssistantForm from './RunAssistant';
import RunAssistantResult from './RunAssistant/RunAssistantTool';
import StatsInfo from 'components/stats/';
import StartingStatsForm from 'components/stats/starting-stats/form';
import StartingStatsResult from 'components/stats/starting-stats/result';
import LevelUpsForm from 'components/stats/level-ups/form';
import LevelUpsResult from 'components/stats/level-ups/result';
import { Areas } from 'suikoden-rng-lib';
import { Route } from 'react-router-dom';
import './index.css';

const App = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      <Navbar/>
      <Route path="/" component={Home} exact={true}/>
      <Route
        path="/encounters"
        exact={true}
        render={() => (
          <EncountersForm areas={Areas}/>
        )}
      />
      <Route
        path="/encounters/result"
        exact={true}
        render={() => (
          <EncounterResult areas={Areas}/>
        )}
      />
      <Route
        path="/stats"
        exact={true}
        render={() => (
          <StatsInfo/>
        )}
      />
      <Route
        path="/stats/starting-stats"
        exact={true}
        render={() => (
          <StartingStatsForm/>
        )}
      />
      <Route
        path="/stats/starting-stats/result"
        exact={true}
        render={() => (
          <StartingStatsResult/>
        )}
      />
      <Route
        path="/stats/level-ups"
        exact={true}
        render={() => (
          <LevelUpsForm/>
        )}
      />
      <Route
        path="/stats/level-ups/result"
        exact={true}
        render={() => (
          <LevelUpsResult/>
        )}
      />
      <Route
        path="/sequence"
        exact={true}
        component={SequenceForm}
      />
      <Route
        path="/sequence/result"
        exact={true}
        component={SequenceResult}
      />
      <Route
        path="/npc"
        exact={true}
        component={NPCForm}
      />
      <Route
        path="/npc/result"
        exact={true}
        component={NPCResult}
      />
      <Route
        path="/drops"
        exact={true}
        render={() => (
          <ItemDropsForm areas={Areas}/>
        )}
      />
      <Route
        path="/drops/result"
        exact={true}
        render={() => (
          <ItemDropsResult areas={Areas}/>
        )}
      />
      <Route
        path="/rngfinder"
        render={() => (
          <RNGFinder areas={Areas}/>
        )}
      />
      <Route
        path="/experience"
        exact={true}
        render={() => (
          <Experience areas={Areas}/>
        )}
      />
      <Route
        path="/runassist"
        exact={true}
        render={() => (
          <RunAssistantForm areas={Areas}/>
        )}
      />
      <Route
        path="/runassist/result"
        exact={true}
        render={() => (
          <RunAssistantResult areas={Areas}/>
        )}
      />
    </div>
  );
}

export default App;
