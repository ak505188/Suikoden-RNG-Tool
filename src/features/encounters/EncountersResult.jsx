import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { RNG, generateEncounters } from 'suikoden-rng-lib/encounters';
import { findAreaById, formationName } from 'shared/lib/encounters';
import EncountersTable from './EncountersTable';

const EncountersContainer = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const offset = parseInt(params.get('offset')) || 0;
  const partyLevel = parseInt(params.get('partylevel')) || 0;
  const selectedAreas = (params.get('areas') ?? '').split(',').map(findAreaById).filter(Boolean);
  const realistic = params.get('realistic') === 'true';

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

export default withRouter(EncountersContainer);
