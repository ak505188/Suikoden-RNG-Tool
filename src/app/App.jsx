import * as React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import { Form as EncountersForm, Result as EncounterResult } from 'features/encounters';
import { Form as ItemDropsForm, Result as ItemDropsResult } from 'features/itemdrops';
import { Form as SequenceForm, Result as SequenceResult } from 'features/sequence';
import { Form as NPCForm, Result as NPCResult } from 'features/npc-movements';
import RNGFinder from 'features/rng-finder';
import Experience from 'features/experience';
import { Form as RunAssistantForm, Tool as RunAssistantTool } from 'features/run-assistant';
import {
  StatsInfo,
  StartingStatsForm,
  StartingStatsResult,
  LevelUpsForm,
  LevelUpsResult,
} from 'features/stats';
import { Form as ChinchironinForm, Result as ChinchironinResult } from 'features/chinchironin';
import { Form as AssassinForm, Result as AssassinResult } from 'features/assassin';
import { Form as KakuForm, Result as KakuResult } from 'features/kaku';
import { Areas } from 'suikoden-rng-lib';
import { Route } from 'react-router-dom';
import './index.css';

const App = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      <Navbar />
      <Route path="/" component={Home} exact={true} />
      <Route path="/encounters" exact={true} render={() => <EncountersForm />} />
      <Route path="/encounters/result" exact={true} render={() => <EncounterResult />} />
      <Route path="/stats" exact={true} render={() => <StatsInfo />} />
      <Route path="/stats/starting-stats" exact={true} render={() => <StartingStatsForm />} />
      <Route
        path="/stats/starting-stats/result"
        exact={true}
        render={() => <StartingStatsResult />}
      />
      <Route path="/stats/level-ups" exact={true} render={() => <LevelUpsForm />} />
      <Route path="/stats/level-ups/result" exact={true} render={() => <LevelUpsResult />} />
      <Route path="/sequence" exact={true} component={SequenceForm} />
      <Route path="/sequence/result" exact={true} component={SequenceResult} />
      <Route path="/npc" exact={true} component={NPCForm} />
      <Route path="/npc/result" exact={true} component={NPCResult} />
      <Route path="/drops" exact={true} render={() => <ItemDropsForm />} />
      <Route path="/drops/result" exact={true} render={() => <ItemDropsResult />} />
      <Route path="/rngfinder" render={() => <RNGFinder areas={Areas} />} />
      <Route path="/experience" exact={true} render={() => <Experience />} />
      <Route path="/runassist" exact={true} render={() => <RunAssistantForm areas={Areas} />} />
      <Route
        path="/runassist/result"
        exact={true}
        render={() => <RunAssistantTool areas={Areas} />}
      />
      <Route path="/chinchironin" exact={true} render={() => <ChinchironinForm />} />
      <Route path="/chinchironin/result" exact={true} render={() => <ChinchironinResult />} />
      <Route path="/assassin" exact={true} render={() => <AssassinForm />} />
      <Route path="/assassin/result" exact={true} render={() => <AssassinResult />} />
      <Route path="/kaku" exact={true} render={() => <KakuForm />} />
      <Route path="/kaku/result" exact={true} render={() => <KakuResult />} />
    </div>
  );
};

export default App;
