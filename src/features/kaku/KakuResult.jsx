import React from 'react';
import { Container } from 'semantic-ui-react';
import { RNG, Kaku } from 'suikoden-rng-lib';
import { int } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import KakuTable from './KakuTable';

const SCHEMA = { rng: int(), start_index: int(), frames: int() };

const KakuResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/kaku" />;

  const rng = new RNG(params.rng);
  const start_index = params.start_index;
  const frames_to_simulate = params.frames;

  const kaku = new Kaku();
  rng.jump(start_index);
  let events = [];

  for (let i = 1; i <= frames_to_simulate; i++) {
    const frame_events = kaku.simulateMovement(rng).map((event) => ({ frame: i, ...event }));
    events = [...events, ...frame_events];
  }

  const data = events.map((event) => {
    const description =
      event.name === 'Mina' && event.event === 'Start Mina Timer'
        ? 'Mina Timer Start'
        : `${event.name} ${event.event} ${event.direction}`;
    return {
      ...event,
      description,
    };
  });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <KakuTable events={data} />
    </Container>
  );
};

export default KakuResult;
