import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { numToHexString } from 'lib/lib';
import { InputRNG, InputIterations } from 'components/form/inputs';

const NPCalcForm = ({ history }) => {
  const [rng, setRNG] = useState(numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [npcs, setNpcs] = useState(1);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('npcs', npcs);
    history.push(`/npc/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit}>
        <InputRNG
          value={rng}
          onChange={event => setRNG(event.target.value)}
        />
        <InputIterations
          value={iterations}
          onChange={event => setIterations(event.target.value)}
        />
        <Form.Input
          label="Number of NPCs"
          name="npcs"
          step="1"
          type="number"
          value={npcs}
          onChange={event => setNpcs(event.target.value)}
        />
        <Form.Button type="submit" content="Calculate NPC Movements" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(NPCalcForm);
