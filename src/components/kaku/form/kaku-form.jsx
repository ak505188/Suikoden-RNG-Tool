import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG } from 'components/form/inputs';
import { withRouter } from 'react-router-dom';

const KakuForm = ({ history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [rngIndex, setRngIndex] = useState(0);
  const [framesToSimulate, setFramesToSimulate] = useState(600);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('start_index', rngIndex);
    params.append('frames', framesToSimulate);
    history.push(`/kaku/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG
          value={rng}
          onChange={event => setRNG(event.target.value)}
        />
        <Form.Input
          label="RNG Index entering Kaku"
          type="number"
          min={0}
          step={1}
          value={rngIndex}
          onChange={e => setRngIndex(e.target.value)}
        />
        <Form.Input
          label="Frames to Simulate"
          type="number"
          min={0}
          step={1}
          value={framesToSimulate}
          onChange={e => setFramesToSimulate(e.target.value)}
        />
        <Form.Button type="submit" content="Simulate Kaku NPCs" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(KakuForm);
