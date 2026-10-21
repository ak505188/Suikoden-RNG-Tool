import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import SequenceTable from './SequenceTable';
import { RNG, countWheelAttempts, isMarieDialogue, isCliveAppearance } from 'suikoden-rng-lib';

const SequenceResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const sequence = [];
  const wheelAttempts = [];
  const marieText = [];
  const cliveAppearance = [];
  for (let i = 0; i < iterations; i++) {
    sequence.push(rng.toString());
    wheelAttempts.push(countWheelAttempts(rng.clone().next()));
    marieText.push(isMarieDialogue(rng.rand) ? 'Antonio Dialogue' : 'No Dialogue');
    cliveAppearance.push(isCliveAppearance(rng.rand) ? 'Clive' : 'No Clive');
    rng.next();
  }

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <SequenceTable
        sequence={sequence.map((rng, index) => ({
          rng,
          index,
          wheelAttempts: wheelAttempts[index],
          marieText: marieText[index],
          cliveAppearance: cliveAppearance[index],
        }))}
      />
    </Container>
  );
};

export default withRouter(SequenceResult);
