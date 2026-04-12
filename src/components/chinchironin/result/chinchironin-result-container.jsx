import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import ChinchironinTable from './chinchironin-result-table';
import { RNG, simulateOpponentRollsFromGameStart } from 'suikoden-rng-lib';

const GenerateRollsResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const is_tai_ho = params.get('is_tai_ho');
  const frames_to_advance = params.get('frames_to_wait');
  const data = [];

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

  console.log(data);

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <ChinchironinTable data={data}/>
    </Container>
  );
}

export default withRouter(GenerateRollsResult);
