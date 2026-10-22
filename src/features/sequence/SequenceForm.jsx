import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { useHistory } from 'react-router-dom';

const SequenceForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);

  const handleSubmit = submitTo(history, '/sequence/result', { rng, iterations });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(event) => setRNG(event.target.value)} />
        <InputIterations
          value={iterations}
          onChange={(event) => setIterations(event.target.value)}
        />
        <Form.Button type="submit" content="Calculate Sequence" primary={true} />
      </Form>
    </Container>
  );
};

export default SequenceForm;
