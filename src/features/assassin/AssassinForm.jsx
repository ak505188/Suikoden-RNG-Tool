import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { useHistory } from 'react-router-dom';

const AssassinForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(1000);

  const handleSubmit = submitTo(history, '/assassin/result', {
    rng,
    rangeStart,
    rangeEnd,
  });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(event) => setRNG(event.target.value)} />
        <Form.Input
          label="Index Range Start"
          name="Index Range Start"
          type="number"
          value={rangeStart}
          onChange={(event) => setRangeStart(event.target.value)}
          min={0}
          max={rangeEnd}
        />
        <Form.Input
          label="Index Range End"
          name="Index Range End"
          type="number"
          value={rangeEnd}
          onChange={(event) => setRangeEnd(event.target.value)}
          min={0}
        />
        <Form.Button type="submit" content="Simulate Assassin Fights" primary={true} />
      </Form>
    </Container>
  );
};

export default AssassinForm;
