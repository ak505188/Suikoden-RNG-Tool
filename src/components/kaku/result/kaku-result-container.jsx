import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import KakuTable from './kaku-result-table';
import { RNG } from 'suikoden-rng-lib';
import Kaku from 'suikoden-rng-lib/lib/Kaku/Kaku';

const KakuResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const start_index = parseInt(params.get('start_index'));
  const frames_to_simulate = parseInt(params.get('frames'));

  const kaku = new Kaku();
  rng.next(start_index);
  let events = [];

  for (let i = 1; i <= frames_to_simulate; i++) {
    const frame_events = kaku.simulateMovement(rng).map(event => ({ frame: i, ...event }));
    events = [...events, ...frame_events];
  }

  const data = events.map(event => {
    const description =
      event.name === 'Mina' && event.event === 'Start Mina Timer' ?
      'Mina Timer Start' :
      `${event.name} ${event.event} ${event.direction}`;
    return {
      ...event,
      description
    }
  });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <KakuTable events={data}/>
    </Container>
  );
}

export default withRouter(KakuResult);
