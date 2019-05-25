import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import RNG from 'lib/rng';
import EncountersTable from './encounters-result-table';
import { numToHexString } from 'lib/lib';

const EncountersContainer = ({ areas, location }) => {
  const [encounters, setEncounters] = useState([]);

  useEffect(() => {
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
        startRNG: numToHexString(fight.startRNG),
        battleRNG: numToHexString(fight.battleRNG),
        wheel: fight.wheel,
        champVal: fight.enemyGroup.champVal
      }))
      .sort((a, b) => {
        if (a.index !== b.index) {
          return a.index - b.index;
        }
        return a.area < b.area ? -1 : 1;
      });
    setEncounters(encounters);
  }, []);



  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <EncountersTable encounters={encounters}/>
    </Container>
  );
}

export default withRouter(EncountersContainer);