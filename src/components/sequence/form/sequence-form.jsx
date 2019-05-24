import React, { useState } from 'react';
import { numToHexString } from 'lib/lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'components/form/inputs';
import { withRouter } from 'react-router-dom';

const SequenceForm = ({ history }) => {
  const [rng, setRNG] = useState(numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    history.push(`/sequence/result?${params.toString()}`);
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
        <Form.Button type="submit" content="Calculate Sequence" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(SequenceForm);
