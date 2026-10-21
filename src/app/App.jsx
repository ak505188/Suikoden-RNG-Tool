import * as React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import EncountersForm from 'features/encounters/form';
import EncounterResult from 'features/encounters/result';
import ItemDropsForm from 'features/itemdrops/form';
import ItemDropsResult from 'features/itemdrops/result';
import SequenceForm from 'features/sequence/form';
import SequenceResult from 'features/sequence/result';
import NPCForm from 'features/npc-movements/form/';
import NPCResult from 'features/npc-movements/result/';
import RNGFinder from 'features/rng-finder';
import Experience from 'features/experience';
import RunAssistantForm from 'features/run-assistant';
import RunAssistantResult from 'features/run-assistant/RunAssistantTool';
import StatsInfo from 'features/stats/';
import StartingStatsForm from 'features/stats/starting-stats/form';
import StartingStatsResult from 'features/stats/starting-stats/result';
import LevelUpsForm from 'features/stats/level-ups/form';
import LevelUpsResult from 'features/stats/level-ups/result';
import ChinchironinForm from 'features/chinchironin/form/chinchironin-form';
import ChinchironinResult from 'features/chinchironin/result';
import AssassinForm from 'features/assassin/form';
import AssassinResult from 'features/assassin/result';
import KakuForm from 'features/kaku/form';
import KakuResult from 'features/kaku/result';
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
      <Route
        path="/chinchironin"
        exact={true}
        render={() => (
          <ChinchironinForm/>
        )}
      />
      <Route
        path="/chinchironin/result"
        exact={true}
        render={() => (
          <ChinchironinResult/>
        )}
      />
      <Route
        path="/assassin"
        exact={true}
        render={() => (
          <AssassinForm/>
        )}
      />
      <Route
        path="/assassin/result"
        exact={true}
        render={() => (
          <AssassinResult/>
        )}
      />
      <Route
        path="/kaku"
        exact={true}
        render={() => (
          <KakuForm/>
        )}
      />
      <Route
        path="/kaku/result"
        exact={true}
        render={() => (
          <KakuResult/>
        )}
      />
    </div>
  );
}

export default App;
