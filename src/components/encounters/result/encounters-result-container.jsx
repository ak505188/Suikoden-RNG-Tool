import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { Helpers, RNG } from 'suikoden-rng-lib';
import EncountersTable from './encounters-result-table';

const EncountersContainer = ({ areas, location }) => {
  const params = new URLSearchParams(location.search);
  const rng = parseInt(params.get('rng'));
  const iterations = parseInt(params.get('iterations'));
  const partylevel = parseInt(params.get('partylevel'));
  const selectedAreas = params.get('areas').split(',').map((name) => areas[name]);
  const realistic = params.get('realistic') === 'true';
  const encounters = selectedAreas
    .map(area => area.generateEncounters(new RNG(rng), iterations, partylevel, realistic))
    .reduce((fights, areaFights) => fights.concat(areaFights), [])
    .map(fight => ({
        area: fight.area,
        enemy: fight.enemyGroup.name,
        index: fight.index,
        run: fight.run ? 'Run' : 'Fail',
        startRNG: Helpers.numToHexString(fight.startRNG),
        battleRNG: Helpers.numToHexString(fight.battleRNG),
        wheel: fight.wheel,
        champVal: fight.enemyGroup.champVal,
        isBattleValue: fight.isBattleValue
    }))
    .sort((a, b) => {
      if (a.index !== b.index) {
        return a.index - b.index;
      }
      return a.area < b.area ? -1 : 1;
    });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <EncountersTable encounters={encounters}/>
    </Container>
  );
}

export default withRouter(EncountersContainer);
