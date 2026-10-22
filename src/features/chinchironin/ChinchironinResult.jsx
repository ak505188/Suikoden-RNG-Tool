import React, { useState } from 'react';
import { Container, Input, Label } from 'semantic-ui-react';
import { RNG, Cursor, simulateRoll, simulateOpponentRollsFromGameStart } from 'suikoden-rng-lib';
import DraftNumberInput from 'shared/form/DraftNumberInput';
import { int, oneOf } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import ChinchironinTable from './ChinchironinTable';
import { PLAYERS } from './lib';

const SCHEMA = {
  rng: int(),
  iterations: int(),
  frames_to_wait: int({ default: 203 }),
  player: oneOf(PLAYERS),
};

const GenerateRollsResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  const [startIndex, setStartIndex] = useState(0);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/chinchironin" />;

  const rng = new RNG(params.rng);
  const { iterations, player } = params;
  const is_tai_ho = player === PLAYERS[0];
  const frames_to_advance = params.frames_to_wait;
  const data = [];

  if (player !== PLAYERS[2]) {
    for (let i = 0; i < iterations; i++) {
      const roll_data = simulateOpponentRollsFromGameStart(
        rng.clone(),
        is_tai_ho,
        frames_to_advance,
        0,
      );
      const rolls = roll_data.rolls.reduce((accumulator, current, index) => {
        accumulator[`speed_${index * 4}`] = current;
        return accumulator;
      }, {});
      const result = {
        index: rng.count,
        rng: `0x${rng.raw.toString(16)}`,
        wait: roll_data.wait,
        ...rolls,
      };

      data.push(result);
      rng.next();
    }
  } else {
    // Algorithm
    // There are CURSOR_POSITION.length sets of results
    // Let's keep this simple at first, and just generate for current RNG Index
    const cursor = new Cursor().goToInitialPos().next(2);
    rng.jump(startIndex + 1);
    for (let i = 0; i < iterations; i++) {
      const rolls = Array.from({ length: 17 })
        .map((_, index) => simulateRoll(cursor, rng.clone(), index * 4))
        .reduce((accumulator, current, index) => {
          accumulator[`speed_${index * 4}`] = current;
          return accumulator;
        }, {});
      data.push({
        index: rng.count,
        rng: `0x${rng.raw.toString(16)}`,
        cursor: cursor.getPos(),
        ...rolls,
      });
      cursor.next();
      rng.next();
    }
  }

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      {player === PLAYERS[2] && (
        <Input labelPosition="left">
          <Label>RNG Index at Start</Label>
          <DraftNumberInput
            value={startIndex}
            min={0}
            max={iterations}
            step={1}
            accepts={(text) => parseInt(text) >= 0}
            onCommit={(text) => setStartIndex(parseInt(text))}
          />
        </Input>
      )}
      <ChinchironinTable data={data} player={player} />
    </Container>
  );
};

export default GenerateRollsResult;
