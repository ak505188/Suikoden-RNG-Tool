import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { InputRNG, InputIterations } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';

const NPCalcForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [npcs, setNpcs] = useState(1);

  const handleSubmit = submitTo(history, '/npc/result', { rng, iterations, npcs });

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(event) => setRNG(event.target.value)} />
        <InputIterations
          value={iterations}
          onChange={(event) => setIterations(event.target.value)}
        />
        <Form.Input
          label="Number of NPCs"
          name="npcs"
          step="1"
          type="number"
          value={npcs}
          onChange={(event) => setNpcs(event.target.value)}
        />
        <Form.Button type="submit" content="Calculate NPC Movements" primary={true} />
      </Form>
    </Container>
  );
};

export default NPCalcForm;
