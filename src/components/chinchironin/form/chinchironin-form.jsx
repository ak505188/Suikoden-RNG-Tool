import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form, Radio } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'components/form/inputs';
import { withRouter } from 'react-router-dom';

const ChinchironinForm = ({ history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [isTaiHo, setIsTaiHo] = useState(true);
  const [framesToWait, setFramesToAdvance] = useState(203);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('frames_to_wait', framesToWait);
    params.append('is_tai_ho', isTaiHo);
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
        <Form.Group inline={true}>
          <Radio
            label="Is Tai Ho?"
            checked={isTaiHo}
            onChange={_ => setIsTaiHo(!isTaiHo)}
            toggle
          />
        </Form.Group>
        <Form.Button type="submit" content="Calculate Rolls" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(ChinchironinForm);
