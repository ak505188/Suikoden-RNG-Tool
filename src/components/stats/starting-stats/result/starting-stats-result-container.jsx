import React from 'react';
import { characterLevelUps } from 'suikoden-rng-lib/stats/growths';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { RNG } from 'suikoden-rng-lib';
import StartingStatsTable from './starting-stats-result-table';

const StartingStatsContainer = ({ areas, location }) => {
  const params = new URLSearchParams(location.search);
  const characters = params.get('characters').split(',');
  const rng = parseInt(params.get('rng'));
  const iterations = parseInt(params.get('iterations'));
  const startingLevel = parseInt(params.get('startingLevel'));
  const levelsGained = parseInt(params.get('levelsGained'));
  const startingStats = [];
  characters.forEach(character => {
    const currentRNG = new RNG(rng);
    for (let i = 0; i < iterations; i++) {
      startingStats.push({
        character,
        index: i,
        ...characterLevelUps(character, startingLevel, levelsGained, currentRNG.clone()),
        rng: currentRNG.toString()
      });
      currentRNG.next();
    }
  });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <StartingStatsTable startingStats={startingStats}/>
    </Container>
  );
}

export default withRouter(StartingStatsContainer);
