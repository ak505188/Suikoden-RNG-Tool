import React from 'react';
import { Container } from 'semantic-ui-react';
import { Characters, RNG, generateCharacterMultipleLevelup } from 'suikoden-rng-lib';
import { int, list } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import LevelUpsTable from './LevelUpsTable';

const SCHEMA = { characters: list(), rng: int(), iterations: int(), startingLevel: int() };

const LevelUpsContainer = () => {
  const { params, problems: parseProblems } = useQueryParams(SCHEMA);
  const problems = [...parseProblems];
  const unknown = params.characters?.filter((name) => !(name in Characters)) ?? [];
  if (unknown.length > 0) problems.push(`unknown character: ${unknown.join(', ')}`);
  if (problems.length > 0) {
    return <InvalidLink problems={problems} formPath="/stats/level-ups" />;
  }

  const { characters, rng, iterations, startingLevel } = params;
  let levelUps = [];
  characters.forEach((character) => {
    const charLevelUps = generateCharacterMultipleLevelup(
      new RNG(rng),
      character,
      startingLevel,
      iterations,
    ).map((levelUp, index) => ({ character, index, ...levelUp }));
    levelUps = levelUps.concat(charLevelUps);
  });

  return (
    <Container className="page-fill" textAlign="center">
      <LevelUpsTable levelUps={levelUps} />
    </Container>
  );
};

export default LevelUpsContainer;
