import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { useHistory } from 'react-router-dom';
import { PLAYERS } from './lib';

const ChinchironinForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [framesToWait, setFramesToAdvance] = useState(203);
  const [player, setPlayer] = useState(PLAYERS[0]);

  const handleSubmit = submitTo(history, '/chinchironin/result', {
    rng,
    iterations,
    frames_to_wait: framesToWait,
    player,
  });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(event) => setRNG(event.target.value)} />
        <InputIterations
          value={iterations}
          onChange={(event) => setIterations(event.target.value)}
        />
        <Form.Input
          label="Frames to Advance"
          type="number"
          value={framesToWait}
          min={0}
          onChange={(event) => setFramesToAdvance(event.target.value)}
        />
        <Form.Dropdown
          label="Player"
          options={PLAYERS.map((player) => ({
            key: player,
            value: player,
            text: player,
          }))}
          value={player}
          onChange={(_e, data) => setPlayer(data.value)}
          selection={true}
        />
        <Form.Button type="submit" content="Calculate Rolls" primary={true} />
      </Form>
    </Container>
  );
};

export default ChinchironinForm;
