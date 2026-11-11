import React from 'react';
import { Container } from 'semantic-ui-react';
import { Characters, RNG, characterLevelUps } from 'suikoden-rng-lib';
import { int, list } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import StartingStatsTable from './StartingStatsTable';

const SCHEMA = {
  characters: list(),
  rng: int(),
  iterations: int(),
  startingLevel: int(),
  levelsGained: int(),
};

const StartingStatsContainer = () => {
  const { params, problems: parseProblems } = useQueryParams(SCHEMA);
  const problems = [...parseProblems];
  const unknown = params.characters?.filter((name) => !(name in Characters)) ?? [];
  if (unknown.length > 0) problems.push(`unknown character: ${unknown.join(', ')}`);
  if (problems.length > 0) {
    return <InvalidLink problems={problems} formPath="/stats/starting-stats" />;
  }

  const { characters, rng, iterations, startingLevel, levelsGained } = params;
  const startingStats = [];
  characters.forEach((character) => {
    const currentRNG = new RNG(rng);
    for (let i = 0; i < iterations; i++) {
      startingStats.push({
        character,
        index: i,
        ...characterLevelUps(character, startingLevel, levelsGained, currentRNG.clone()),
        rng: currentRNG.toString(),
      });
      currentRNG.next();
    }
  });

  return (
    <Container className="page-fill" textAlign="center">
      <StartingStatsTable startingStats={startingStats} />
    </Container>
  );
};

export default StartingStatsContainer;
