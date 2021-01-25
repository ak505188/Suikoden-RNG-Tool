import React from 'react';
import { generateCharacterMultipleLevelup } from 'suikoden-rng-lib/stats/growths';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { RNG } from 'suikoden-rng-lib';
import LevelUpsTable from './level-ups-result-table';

const LevelUpsContainer = ({ areas, location }) => {
  const params = new URLSearchParams(location.search);
  const characters = params.get('characters').split(',');
  const rng = parseInt(params.get('rng'));
  const iterations = parseInt(params.get('iterations'));
  const startingLevel = parseInt(params.get('startingLevel'));
  let levelUps = [];
  characters.forEach(character => {
    const charLevelUps = generateCharacterMultipleLevelup(new RNG(rng), character, startingLevel, iterations)
      .map((levelUp, index) => ({ character, index, ...levelUp }));
    levelUps = levelUps.concat(charLevelUps);
  });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <LevelUpsTable levelUps={levelUps}/>
    </Container>
  );
}

export default withRouter(LevelUpsContainer);
