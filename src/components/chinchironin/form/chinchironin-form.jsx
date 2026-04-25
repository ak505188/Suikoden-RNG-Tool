import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'components/form/inputs';
import { withRouter } from 'react-router-dom';
import { PLAYERS } from '../lib';

const ChinchironinForm = ({ history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [framesToWait, setFramesToAdvance] = useState(203);
  const [player, setPlayer] = useState(PLAYERS[0]);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('frames_to_wait', framesToWait);
    params.append('player', player);
    history.push(`/chinchironin/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG
          value={rng}
          onChange={event => setRNG(event.target.value)}
        />
        <InputIterations
          value={iterations}
          onChange={event => setIterations(event.target.value)}
        />
        <Form.Input
          label="Frames to Advance"
          value={framesToWait}
          min={0}
          onChange={event => setFramesToAdvance(event.target.value)}
        />
        <Form.Dropdown
          label="Player"
          options={PLAYERS.map(player => ({
            key: player,
            value: player,
            text: player
          }))}
          value={player}
          onChange={(_e, data) => setPlayer(data.value)}
          selection={true}
        />
        <Form.Button type="submit" content="Calculate Rolls" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(ChinchironinForm);
