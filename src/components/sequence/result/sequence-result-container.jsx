import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import SequenceTable from './sequence-result-table';
import RNG from 'lib/rng';
import { numToHexString } from 'lib/lib';
import { wheelSuccess } from 'lib/Fight';

const SequenceResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const sequence = [];
  const wheelAttempts = [];
  for (let i = 0; i < iterations; i++) {
    sequence.push(numToHexString(rng.getRNG()));
    wheelAttempts.push(wheelSuccess(rng.clone().next()));
    rng.next();
  }

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <SequenceTable sequence={sequence.map((rng, index) => ({rng, index, wheelAttempts: wheelAttempts[index] }))}/>
    </Container>
  );
}

export default withRouter(SequenceResult);
