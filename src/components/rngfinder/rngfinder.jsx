import React, { useState, useEffect } from 'react';
import DoubleListSelector from 'components/DoubleListSelector';
import { InputRNG } from 'components/form/inputs';
import RNGFinderStatus from './Status';
import { areaNamesWithRandomEncounters, numToHexString } from 'lib/lib';
import { Container, Form } from 'semantic-ui-react';
import WebWorker from 'lib/WebWorker';
import findRNGWorker from 'lib/findRNG.worker.js';

const RNGFinder = ({ areas }) => {
  const [rng, setRNG] = useState(numToHexString(0x12));
  const [selectedArea, setSelectedArea] = useState(areaNamesWithRandomEncounters[0]);
  const [fightList, setFightList] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState({
    progress: 0,
    message: '',
    done: false,
  });
  const [worker, setWorker] = useState(new WebWorker(findRNGWorker));

  useEffect(() => {
    if (!running && worker) {
      worker.terminate();
      setWorker(undefined);
    } else if (running && fightList) {
      const worker = new WebWorker(findRNGWorker);
      const area = areas[selectedArea];
      const workerParams = {
        dungeon: area.areaType === 'Dungeon',
        tableLength: area.encounterTable.length,
        encounterRate: area.encounterRate
      };
      worker.onmessage = m => {
        const result = m.data.result ? m.data.result.rng : null;
        const done = m.data.done ? m.data.done : false;
        const prevBattleRNG = m.data.prevBattleRNG ? m.data.prevBattleRNG.rng : null;
        setStatus({...m.data, result, prevBattleRNG });
        setRunning(!done);
      };
      worker.postMessage({ area: workerParams, encounters: fightList, rng: parseInt(rng) });
      setWorker(worker);
    }
  }, [running]);

  const handleAreaChange = (_event, data) => {
    const area = data.value;
    setFightList(area === selectedArea ? fightList : []);
    setSelectedArea(area);
  }

  const handleStop = event => {
    event.preventDefault();
    setRunning(false);
    worker.terminate();
    setWorker(undefined);
  }

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={() => setRunning(true)}>
        <InputRNG
          value={rng}
          onChange={e => setRNG(numToHexString(e.target.value))}
        />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={areaNamesWithRandomEncounters.map(name =>
            ({ key: name, value: name, text: areas[name].name })
          )}
          value={selectedArea}
          onChange={handleAreaChange}
          search={true}
          selection={true}
        />
        <DoubleListSelector
          handleChange={list => setFightList(list)}
          list={fightList}
          options={areas[selectedArea].encounterTable.map(group => group.name)}
        />
        <Form.Button style={{ marginBottom: '1em' }} type="submit" content="Find RNG Seed" primary={true}/>
      </Form>
        {status.message !== '' &&
          <RNGFinderStatus
            running={running}
            cancel={handleStop}
            {...status}
          />
        }
    </Container>
  );
}

export default RNGFinder;
