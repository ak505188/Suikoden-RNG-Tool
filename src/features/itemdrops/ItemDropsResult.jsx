import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { RNG, EnemyParty } from 'suikoden-rng-lib/encounters';
import { areaFormations, findAreaById } from 'shared/lib/encounters';
import { itemName } from 'shared/lib/items';
import ItemdropsTable from './ItemDropsTable';

const ItemdropsContainer = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const area = findAreaById(params.get('area'));
  const group = area && areaFormations(area)[parseInt(params.get('enemyGroup'))];
  const drops = group
    ? EnemyParty.fromFormation(group.formation)
        .calculateDrops(rng, iterations)
        .map(({ drop, index, rng }) => ({
          drop: itemName(drop),
          index,
          rng: Helpers.numToHexString(rng),
        }))
    : [];

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <ItemdropsTable drops={drops} />
    </Container>
  );
};

export default withRouter(ItemdropsContainer);
