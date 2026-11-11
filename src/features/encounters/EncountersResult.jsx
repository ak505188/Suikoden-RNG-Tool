import React from 'react';
import { Container } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { RNG, formationName, generateEncounters } from 'suikoden-rng-lib/encounters';
import { findAreaById } from 'shared/lib/encounters';
import { bool, int, list } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import EncountersTable from './EncountersTable';

const SCHEMA = {
  rng: int(),
  iterations: int(),
  offset: int({ default: 0 }),
  partyLevel: int({ default: 0, alias: 'partylevel' }),
  realistic: bool({ default: false }),
  areas: list(),
};

const EncountersContainer = () => {
  const { params, problems: parseProblems } = useQueryParams(SCHEMA);
  const problems = [...parseProblems];
  const selectedAreas = (params.areas ?? []).map(findAreaById);
  const unknown = (params.areas ?? []).filter((_id, i) => !selectedAreas[i]);
  if (unknown.length > 0) problems.push(`unknown area: ${unknown.join(', ')}`);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/encounters" />;

  const rng = new RNG(params.rng);
  const { iterations, offset, partyLevel, realistic } = params;

  const encounters = selectedAreas
    .map((area) =>
      generateEncounters(rng.clone().jump(offset), area, { iterations, partyLevel, realistic }),
    )
    .reduce((fights, areaFights) => fights.concat(areaFights), [])
    .map((fight) => ({
      area: fight.area,
      enemy: formationName(fight.enemyGroup.formation),
      index: fight.index,
      run: fight.run ? 'Run' : 'Fail',
      startRNG: Helpers.numToHexString(fight.startRNG),
      battleRNG: Helpers.numToHexString(fight.battleRNG),
      wheel: fight.wheel,
      champVal: fight.enemyGroup.champVal,
      isBattleValue: fight.isBattleValue,
    }))
    .sort((a, b) => {
      if (a.index !== b.index) {
        return a.index - b.index;
      }
      return a.area < b.area ? -1 : 1;
    });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <EncountersTable encounters={encounters} />
    </Container>
  );
};

export default EncountersContainer;
