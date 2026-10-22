import React, { useState } from 'react';
import DoubleListSelector from 'shared/ui/DoubleListSelector';
import { InputRNG } from 'shared/form/inputs';
import { ENCOUNTER_AREAS, areaId, findAreaById, formationName } from 'shared/lib/encounters';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import RNGFinderStatus from './Status';

import findRNGWorker from './findRNG.worker.js?worker';

const initialStatus = {
  progress: 0,
  done: false,
  matches: [],
};

const RNGFinder = () => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [selectedArea, setSelectedArea] = useState(areaId(ENCOUNTER_AREAS[0]));
  const [fightList, setFightList] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [worker, setWorker] = useState();

  const handleAreaChange = (_event, data) => {
    const area = data.value;
    setFightList(area === selectedArea ? fightList : []);
    setSelectedArea(area);
  };

  const handleStart = (_event) => {
    if (fightList.length < 2) {
      return;
    }

    if (worker !== undefined) {
      killWorker();
    }

    const webworker = new findRNGWorker();
    const area = findAreaById(selectedArea);

    webworker.onmessage = (m) => {
      const { done, progress, matches, limitReached } = m.data;
      setStatus({ done, progress, matches, limitReached });
      setRunning(!done);
    };

    setWorker(webworker);
    setRunning(true);
    webworker.postMessage({
      area,
      encounters: fightList,
      rng: parseInt(rng),
    });
  };

  const killWorker = () => {
    worker.terminate();
    setWorker(undefined);
  };

  const handleStop = (event) => {
    event.preventDefault();
    setRunning(false);
    // Matches already found are worth keeping when you stop
    setStatus(status.matches.length > 0 ? { ...status, done: true, stopped: true } : initialStatus);
    killWorker();
  };

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={() => handleStart()}>
        <InputRNG value={rng} onChange={(e) => setRNG(Helpers.numToHexString(e.target.value))} />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={ENCOUNTER_AREAS.map((area) => ({
            key: areaId(area),
            value: areaId(area),
            text: area.name,
          }))}
          value={selectedArea}
          onChange={handleAreaChange}
          search={true}
          selection={true}
        />
        <DoubleListSelector
          handleChange={(list) => setFightList(list)}
          list={fightList}
          options={findAreaById(selectedArea).encounters.map(formationName)}
        />
        <Form.Button
          style={{ marginBottom: '1em' }}
          type="submit"
          content="Find RNG Seed"
          primary={true}
        />
      </Form>
      {(running || status.done) && (
        <RNGFinderStatus running={running} cancel={handleStop} {...status} />
      )}
    </Container>
  );
};

export default RNGFinder;
