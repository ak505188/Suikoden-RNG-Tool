import * as React from 'react';
import Navbar from './Navbar';
import Home from './Home';
import { Loader } from 'semantic-ui-react';
import { Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Every tool loads when it is first visited, so the home page only needs the shell
const lazyExport = (load, name = 'default') =>
  React.lazy(() => load().then((feature) => ({ default: feature[name] })));
const loadEncounters = () => import('features/encounters');
const loadItemDrops = () => import('features/itemdrops');
const loadSequence = () => import('features/sequence');
const loadNpcMovements = () => import('features/npc-movements');
const loadStats = () => import('features/stats');
const loadRunAssistant = () => import('features/run-assistant');
const loadChinchironin = () => import('features/chinchironin');
const loadAssassin = () => import('features/assassin');
const loadKaku = () => import('features/kaku');
const EncountersForm = lazyExport(loadEncounters, 'Form');
const EncounterResult = lazyExport(loadEncounters, 'Result');
const ItemDropsForm = lazyExport(loadItemDrops, 'Form');
const ItemDropsResult = lazyExport(loadItemDrops, 'Result');
const SequenceForm = lazyExport(loadSequence, 'Form');
const SequenceResult = lazyExport(loadSequence, 'Result');
const NPCForm = lazyExport(loadNpcMovements, 'Form');
const NPCResult = lazyExport(loadNpcMovements, 'Result');
const StatsInfo = lazyExport(loadStats, 'StatsInfo');
const StartingStatsForm = lazyExport(loadStats, 'StartingStatsForm');
const StartingStatsResult = lazyExport(loadStats, 'StartingStatsResult');
const LevelUpsForm = lazyExport(loadStats, 'LevelUpsForm');
const LevelUpsResult = lazyExport(loadStats, 'LevelUpsResult');
const RNGFinder = lazyExport(() => import('features/rng-finder'));
const Experience = lazyExport(() => import('features/experience'));
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
    <div className="app">
      <Navbar />
      <ErrorBoundary resetKey={pathname + search}>
        <React.Suspense fallback={<Loader active inline="centered" />}>
          <Route path="/" render={() => <Home />} exact={true} />
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
          <Route path="/sequence" exact={true} render={() => <SequenceForm />} />
          <Route path="/sequence/result" exact={true} render={() => <SequenceResult />} />
          <Route path="/npc" exact={true} render={() => <NPCForm />} />
          <Route path="/npc/result" exact={true} render={() => <NPCResult />} />
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
