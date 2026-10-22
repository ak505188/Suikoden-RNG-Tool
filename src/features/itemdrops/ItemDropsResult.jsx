import React from 'react';
import { Container } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { RNG, EnemyParty } from 'suikoden-rng-lib/encounters';
import { areaFormations, findAreaById } from 'shared/lib/encounters';
import { itemName } from 'shared/lib/items';
import { int, string } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import ItemdropsTable from './ItemDropsTable';

const SCHEMA = { rng: int(), iterations: int(), area: string(), enemyGroup: int({ default: 0 }) };

const ItemdropsContainer = () => {
  const { params, problems: parseProblems } = useQueryParams(SCHEMA);
  const problems = [...parseProblems];
  const area = params.area && findAreaById(params.area);
  const group = area && areaFormations(area)[params.enemyGroup];
  if (params.area && !area) problems.push(`unknown area: ${params.area}`);
  else if (area && !group) problems.push(`${area.name} has no enemy group ${params.enemyGroup}`);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/drops" />;

  const drops = EnemyParty.fromFormation(group.formation)
    .calculateDrops(new RNG(params.rng), params.iterations)
    .map(({ drop, index, rng }) => ({
      drop: itemName(drop),
      index,
      rng: Helpers.numToHexString(rng),
    }));

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <ItemdropsTable drops={drops} />
    </Container>
  );
};

export default ItemdropsContainer;
