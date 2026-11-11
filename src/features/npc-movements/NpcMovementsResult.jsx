import * as React from 'react';
import { Container } from 'semantic-ui-react';
import { Helpers, RNG } from 'suikoden-rng-lib';
import { int } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import Table from './NpcMovementsTable';

function directionToString(num) {
  const dir = num % 4;
  switch (dir) {
    case 0:
      return 'Down';
    case 1:
      return 'Up';
    case 2:
      return 'Left';
    case 3:
      return 'Right';
    default:
      return '?';
  }
}

const SCHEMA = { rng: int(), iterations: int(), npcs: int({ default: 1 }) };

const NPCMovementsResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/npc" />;

  const rng = new RNG(params.rng);
  const { iterations, npcs: npcCount } = params;
  const result = [];
  let currentNPC = 0;
  for (let i = 0; i < iterations; i++) {
    const move = rng.rand < 0xcb;
    let direction = '';
    const index = i;
    if (move) {
      rng.next();
      i++;
      direction = 'Previous Movement';
      if (Helpers.div32ulo(rng.rand, 0x1fff) > 0) {
        rng.next();
        i++;
        direction = directionToString(Helpers.div32ulo(rng.rand, 0x1999));
      }
      result.push({ index, rng: Helpers.numToHexString(rng.raw), direction, npc: currentNPC + 1 });
    } else {
      currentNPC = (currentNPC + 1) % npcCount;
    }
    rng.next();
  }

  return (
    <Container className="page-fill" textAlign="center">
      <Table NPCInfo={result} />
    </Container>
  );
};

export default NPCMovementsResult;
