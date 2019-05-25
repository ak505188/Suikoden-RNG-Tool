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
import { enemies } from './lib/enemies';
import { initAreas } from './lib/lib';
import { Route } from 'react-router-dom';
import './index.css';

const App = () => {
  const areas = initAreas(enemies);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      <Navbar/>
      <Route path="/" component={Home} exact={true}/>
      <Route
        path="/encounters"
        exact={true}
        render={() => (
          <EncountersForm areas={areas}/>
        )}
      />
      <Route
        path="/encounters/result"
        exact={true}
        render={() => (
          <EncounterResult areas={areas}/>
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
          <ItemDropsForm areas={areas}/>
        )}
      />
      <Route
        path="/drops/result"
        exact={true}
        render={() => (
          <ItemDropsResult areas={areas}/>
        )}
      />
      <Route
        path="/rngfinder"
        render={() => (
          <RNGFinder areas={areas}/>
        )}
      />
      <Route
        path="/experience"
        exact={true}
        render={() => (
          <Experience areas={areas}/>
        )}
      />
      <Route
        path="/runassist"
        exact={true}
        render={() => (
          <RunAssistantForm areas={areas}/>
        )}
      />
      <Route
        path="/runassist/result"
        exact={true}
        render={() => (
          <RunAssistantResult areas={areas}/>
        )}
      />
    </div>
  );
}

export default App;
