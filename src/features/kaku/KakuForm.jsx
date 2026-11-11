import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { useHistory } from 'react-router-dom';

const KakuForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [rngIndex, setRngIndex] = useState(0);
  const [framesToSimulate, setFramesToSimulate] = useState(600);

  const handleSubmit = submitTo(history, '/kaku/result', {
    rng,
    startIndex: rngIndex,
    frames: framesToSimulate,
  });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(event) => setRNG(event.target.value)} />
        <Form.Input
          label="RNG Index entering Kaku"
          type="number"
          min={0}
          step={1}
          value={rngIndex}
          onChange={(e) => setRngIndex(e.target.value)}
        />
        <Form.Input
          label="Frames to Simulate"
          type="number"
          min={0}
          step={1}
          value={framesToSimulate}
          onChange={(e) => setFramesToSimulate(e.target.value)}
        />
        <Form.Button type="submit" content="Simulate Kaku NPCs" primary={true} />
      </Form>
    </Container>
  );
};

export default KakuForm;
