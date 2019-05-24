import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import RNG from 'lib/rng';
import { numToHexString } from 'lib/lib';
import ItemdropsTable from './itemdrops-result-table';

const ItemdropsContainer = ({ areas, location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const area = areas[params.get('area')];
  const group = area.encounterTable[params.get('enemyGroup')];
  const drops =
    group.calculateDrops(rng, iterations).map((drop, index) => ({
      drop: drop.drop,
      index,
      rng: numToHexString(drop.rng)
    })
  );

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <ItemdropsTable drops={drops}/>
    </Container>
  );
};

export default withRouter(ItemdropsContainer);
