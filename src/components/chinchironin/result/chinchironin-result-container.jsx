import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Input } from 'semantic-ui-react';
import ChinchironinTable from './chinchironin-result-table';
import { RNG, simulateOpponentRollsFromGameStart } from 'suikoden-rng-lib';
import { Cursor, simulateRoll } from 'suikoden-rng-lib/lib/chinchironin';
import { PLAYERS } from '../lib';

const GenerateRollsResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const player_param = params.get('player');
  const player = PLAYERS.includes(player_param) ? player_param : PLAYERS[PLAYERS.length];
  const is_tai_ho = player === PLAYERS[0];
  const frames_to_advance = parseInt(params.get('frames_to_wait'));
  const data = [];

  const [startIndex, setStartIndex] = useState(0);

  if (player !== PLAYERS[2]) {
    for (let i = 0; i < iterations; i++) {
      const roll_data = simulateOpponentRollsFromGameStart(rng.cloneKeepIndex(), is_tai_ho, frames_to_advance, 0);
      const rolls = roll_data.rolls.reduce((accumulator, current, index) => {
        accumulator[`speed_${index*4}`] = current;
        return accumulator;
      }, {})
      const result = {
        index: rng.count,
        rng: `0x${rng.getRNG().toString(16)}`,
        wait: roll_data.wait,
        ...rolls
      };

      data.push(result);
      rng.next();
    }
  } else {
    // Algorithm
    // There are CURSOR_POSITION.length sets of results
    // Let's keep this simple at first, and just generate for current RNG Index
    const cursor = new Cursor().goToInitialPos().next(2);
    rng.next(startIndex + 1);
    for(let i = 0; i < iterations; i++) {
      const rolls = Array.from({ length: 17 })
        .map((_, index) => simulateRoll(cursor, rng.cloneKeepIndex(), index * 4))
        .reduce((accumulator, current, index) => {
          accumulator[`speed_${index*4}`] = current;
          return accumulator;
        }, {})
      data.push({
        index: rng.count,
        rng: `0x${rng.getRNG().toString(16)}`,
        cursor: cursor.getPos(),
        ...rolls
      });
      cursor.next();
      rng.next();
    }
  }

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      {player === PLAYERS[2] &&
        <Input
          type="number"
          value={startIndex}
          label="RNG Index at Start"
          onChange={e => setStartIndex(parseInt(e.target.value))}
          max={iterations}
          min={0}
          step={1}
        />
      }
      <ChinchironinTable data={data} player={player}/>
    </Container>
  );
}

export default withRouter(GenerateRollsResult);
