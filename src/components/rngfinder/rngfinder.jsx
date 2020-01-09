import React, { useState } from 'react';
import DoubleListSelector from 'components/DoubleListSelector';
import { InputRNG } from 'components/form/inputs';
import RNGFinderStatus from './Status';
import { areaNamesWithRandomEncounters, numToHexString } from 'lib/lib';
import { Container, Form } from 'semantic-ui-react';

import findRNGWorker from 'workerize-loader!lib/findRNG.worker.js'; // eslint-disable-line import/no-webpack-loader-syntax

const initialStatus = {
  progress: 0,
  message: '',
  done: false,
};

const RNGFinder = ({ areas }) => {
  const [rng, setRNG] = useState(numToHexString(0x12));
  const [selectedArea, setSelectedArea] = useState(areaNamesWithRandomEncounters[0]);
  const [fightList, setFightList] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [worker, setWorker] = useState();

  const handleAreaChange = (_event, data) => {
    const area = data.value;
    setFightList(area === selectedArea ? fightList : []);
    setSelectedArea(area);
  }

  const handleStart = _event => {
    if (fightList.length < 2) {
      return;
    }

    if (worker !== undefined) {
      killWorker();
    }

    const webworker = new findRNGWorker();
    const area = areas[selectedArea];
    const workerParams = {
      areaType: area.areaType,
      tableLength: area.encounterTable.length,
      encounterRate: area.encounterRate
    };

    webworker.onmessage = m => {
      const { done, message, progress, result } = m.data;
      setStatus({ done, message, progress, result });
      setRunning(!done);
    };

    setWorker(webworker);
    setRunning(true);
    webworker.postMessage({ workerParams, encounters: fightList, rng: parseInt(rng) });
  }

  const killWorker = () => {
    worker.terminate();
    setWorker(undefined);
  }

  const handleStop = event => {
    event.preventDefault();
    setRunning(false);
    setStatus(initialStatus);
    killWorker();
  }

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={() => handleStart()}>
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
