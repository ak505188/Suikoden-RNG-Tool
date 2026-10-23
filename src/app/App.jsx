import * as React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import { Form as EncountersForm, Result as EncounterResult } from 'features/encounters';
import { Form as ItemDropsForm, Result as ItemDropsResult } from 'features/itemdrops';
import { Form as SequenceForm, Result as SequenceResult } from 'features/sequence';
import { Form as NPCForm, Result as NPCResult } from 'features/npc-movements';
import RNGFinder from 'features/rng-finder';
import Experience from 'features/experience';
import {
  StatsInfo,
  StartingStatsForm,
  StartingStatsResult,
  LevelUpsForm,
  LevelUpsResult,
} from 'features/stats';
import { Loader } from 'semantic-ui-react';
import { Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// The tools that pull in the battle engine or a lot of their own code load when first visited
const lazyExport = (load, name) =>
  React.lazy(() => load().then((feature) => ({ default: feature[name] })));
const loadRunAssistant = () => import('features/run-assistant');
const loadChinchironin = () => import('features/chinchironin');
const loadAssassin = () => import('features/assassin');
const loadKaku = () => import('features/kaku');
const RunAssistantForm = lazyExport(loadRunAssistant, 'Form');
const RunAssistantTool = lazyExport(loadRunAssistant, 'Tool');
const ChinchironinForm = lazyExport(loadChinchironin, 'Form');
const ChinchironinResult = lazyExport(loadChinchironin, 'Result');
const AssassinForm = lazyExport(loadAssassin, 'Form');
const AssassinResult = lazyExport(loadAssassin, 'Result');
const KakuForm = lazyExport(loadKaku, 'Form');
const KakuResult = lazyExport(loadKaku, 'Result');

const App = () => {
  const { pathname, search } = useLocation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      <Navbar />
      <ErrorBoundary resetKey={pathname + search}>
        <React.Suspense fallback={<Loader active inline="centered" />}>
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
          <Route path="/rngfinder" render={() => <RNGFinder />} />
          <Route path="/experience" exact={true} render={() => <Experience />} />
          <Route path="/runassist" exact={true} render={() => <RunAssistantForm />} />
          <Route path="/runassist/result" exact={true} render={() => <RunAssistantTool />} />
          <Route path="/chinchironin" exact={true} render={() => <ChinchironinForm />} />
          <Route path="/chinchironin/result" exact={true} render={() => <ChinchironinResult />} />
          <Route path="/assassin" exact={true} render={() => <AssassinForm />} />
          <Route path="/assassin/result" exact={true} render={() => <AssassinResult />} />
          <Route path="/kaku" exact={true} render={() => <KakuForm />} />
          <Route path="/kaku/result" exact={true} render={() => <KakuResult />} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default App;
