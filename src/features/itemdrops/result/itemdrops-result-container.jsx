import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { Helpers, RNG } from 'suikoden-rng-lib';
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
      rng: Helpers.numToHexString(drop.rng)
    })
  );

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <ItemdropsTable drops={drops}/>
    </Container>
  );
};

export default withRouter(ItemdropsContainer);
