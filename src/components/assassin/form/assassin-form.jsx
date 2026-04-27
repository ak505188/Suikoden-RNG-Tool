import React, { useState } from 'react';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations } from 'components/form/inputs';
import { withRouter } from 'react-router-dom';

const AssassinForm = ({ history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [heroArmor, setHeroArmor] = useState(80);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(iterations);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('armor', heroArmor);
    params.append('range_start', rangeStart);
    params.append('range_end', rangeEnd);
    history.push(`/assassin/result?${params.toString()}`);
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
          label="McDohl ARM"
          name="McDohl ARM"
          type="number"
          value={heroArmor}
          onChange={event => setHeroArmor(event.target.value)}
          min={18}
        />
        <Form.Input
          label="Index Range Start"
          name="Index Range Start"
          type="number"
          value={rangeStart}
          onChange={event => setRangeStart(event.target.value)}
          min={0}
          max={iterations}
        />
        <Form.Input
          label="Index Range End"
          name="Index Range End"
          type="number"
          value={rangeEnd}
          onChange={event => setRangeEnd(event.target.value)}
          min={0}
          max={iterations}
        />
        <Form.Button type="submit" content="Simulate Assassin Fights" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(AssassinForm);
