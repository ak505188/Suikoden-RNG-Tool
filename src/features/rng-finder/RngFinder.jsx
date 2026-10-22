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
  message: '',
  done: false,
};

const RNGFinder = () => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [selectedArea, setSelectedArea] = useState(areaId(ENCOUNTER_AREAS[0]));
  const [fightList, setFightList] = useState([]);
  const [realistic, setRealistic] = useState(true);
  const [findAll, setFindAll] = useState(false);
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
      const { done, message, progress, result, matches, findAll } = m.data;
      setStatus({ done, message, progress, result, matches, findAll });
      setRunning(!done);
    };

    setWorker(webworker);
    setRunning(true);
    webworker.postMessage({
      area,
      encounters: fightList,
      rng: parseInt(rng),
      realistic,
      findAll,
    });
  };

  const killWorker = () => {
    worker.terminate();
    setWorker(undefined);
  };

  const handleStop = (event) => {
    event.preventDefault();
    setRunning(false);
    // Matches already found are worth keeping when you stop a find-all
    const found = status.matches?.length > 0;
    setStatus(
      found
        ? { ...status, done: true, message: `Stopped. ${status.matches.length} found so far.` }
        : initialStatus,
    );
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
        <Form.Checkbox
          label="Realistic mode"
          title="After a battle the game uses the next RNG call to pick the enemy group, so that value can't start a battle. Realistic mode skips it."
          checked={realistic}
          onChange={(_e, data) => setRealistic(data.checked)}
        />
        <Form.Checkbox
          label="Find all matches"
          title="Scan the whole RNG cycle and list every match, instead of stopping at the first. Takes a few seconds."
          checked={findAll}
          onChange={(_e, data) => setFindAll(data.checked)}
        />
        <Form.Button
          style={{ marginBottom: '1em' }}
          type="submit"
          content="Find RNG Seed"
          primary={true}
        />
      </Form>
      {status.message !== '' && (
        <RNGFinderStatus running={running} cancel={handleStop} {...status} />
      )}
    </Container>
  );
};

export default RNGFinder;
