import React from 'react';
import { Container } from 'semantic-ui-react';
import { RNG, countWheelAttempts, isMarieDialogue, isCliveAppearance } from 'suikoden-rng-lib';
import { int } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import SequenceTable from './SequenceTable';

const SCHEMA = { rng: int(), iterations: int() };

const SequenceResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/sequence" />;

  const rng = new RNG(params.rng);
  const sequence = [];
  const wheelAttempts = [];
  const marieText = [];
  const cliveAppearance = [];
  for (let i = 0; i < params.iterations; i++) {
    sequence.push(rng.toString());
    wheelAttempts.push(countWheelAttempts(rng.clone().next()));
    marieText.push(isMarieDialogue(rng.rand) ? 'Antonio Dialogue' : 'No Dialogue');
    cliveAppearance.push(isCliveAppearance(rng.rand) ? 'Clive' : 'No Clive');
    rng.next();
  }

  return (
    <Container className="page-fill" textAlign="center">
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

export default SequenceResult;
