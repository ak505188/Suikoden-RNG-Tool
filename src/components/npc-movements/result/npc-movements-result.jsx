import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import Table from './npc-movements-table';
import RNG from 'lib/rng';
import { div32ulo, numToHexString } from 'lib/lib';

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

const NPCMovementsResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const npcCount = parseInt(params.get('npcs'));
  const result = [];
  let currentNPC = 0;
  for (let i = 0; i < iterations; i++) {
    const move = rng.getRNG2() < 0xcb;
    let direction = '';
    const index = i;
    if (move) {
      rng.next();
      i++;
      direction = 'Previous Movement';
      if (div32ulo(rng.getRNG2(), 0x1fff) > 0) {
        rng.next();
        i++;
        direction = directionToString(div32ulo(rng.getRNG2(), 0x1999));
      }
      result.push({ index, rng: numToHexString(rng.getRNG()), direction, npc: currentNPC + 1 });
    } else {
      currentNPC = (currentNPC + 1) % npcCount;
    }
    rng.next();
  }

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Table NPCInfo={result}/>
    </Container>
  );
}

export default withRouter(NPCMovementsResult);
