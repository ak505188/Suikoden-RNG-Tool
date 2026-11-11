import React from 'react';
import { Container } from 'semantic-ui-react';
import { RNG, Kaku } from 'suikoden-rng-lib';
import { int } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import KakuTable from './KakuTable';

const SCHEMA = { rng: int(), startIndex: int({ alias: 'start_index' }), frames: int() };

const KakuResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/kaku" />;

  const rng = new RNG(params.rng);
  const startIndex = params.startIndex;
  const framesToSimulate = params.frames;

  const kaku = new Kaku();
  rng.jump(startIndex);
  let events = [];

  for (let i = 1; i <= framesToSimulate; i++) {
    const frameEvents = kaku.simulateMovement(rng).map((event) => ({ frame: i, ...event }));
    events = [...events, ...frameEvents];
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
    <Container className="page-fill" textAlign="center">
      <KakuTable events={data} />
    </Container>
  );
};

export default KakuResult;
