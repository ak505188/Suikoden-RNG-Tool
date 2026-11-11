import * as React from 'react';
import Home from './Home';

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

// Every page of the app: its path and what to show there. Add a tool's pages here, and the tool
// itself to tools.js so the navbar and home page list it.
export const PAGES = [
  { path: '/', Page: Home },
  { path: '/encounters', Page: EncountersForm },
  { path: '/encounters/result', Page: EncounterResult },
  { path: '/stats', Page: StatsInfo },
  { path: '/stats/starting-stats', Page: StartingStatsForm },
  { path: '/stats/starting-stats/result', Page: StartingStatsResult },
  { path: '/stats/level-ups', Page: LevelUpsForm },
  { path: '/stats/level-ups/result', Page: LevelUpsResult },
  { path: '/sequence', Page: SequenceForm },
  { path: '/sequence/result', Page: SequenceResult },
  { path: '/npc', Page: NPCForm },
  { path: '/npc/result', Page: NPCResult },
  { path: '/drops', Page: ItemDropsForm },
  { path: '/drops/result', Page: ItemDropsResult },
  { path: '/rngfinder', Page: RNGFinder },
  { path: '/experience', Page: Experience },
  { path: '/runassist', Page: RunAssistantForm },
  { path: '/runassist/result', Page: RunAssistantTool },
  { path: '/chinchironin', Page: ChinchironinForm },
  { path: '/chinchironin/result', Page: ChinchironinResult },
  { path: '/assassin', Page: AssassinForm },
  { path: '/assassin/result', Page: AssassinResult },
  { path: '/kaku', Page: KakuForm },
  { path: '/kaku/result', Page: KakuResult },
];
