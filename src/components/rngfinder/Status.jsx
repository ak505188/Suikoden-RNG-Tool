import * as React from 'react';
import { Button, Container, Progress, Segment } from 'semantic-ui-react';
import { numToHexString } from 'lib/lib';

const RNGFinderStatus = ({ cancel, message, progress, done, prevBattleRNG, result, running }) => (
  <Container textAlign="center">
    {result &&
      <Segment>
        <p>
          First Battle RNG: {numToHexString(result)}
        </p>
        <p>
          Previous Battle RNG: {numToHexString(prevBattleRNG)}
        </p>
      </Segment>
    }
    <Progress
      percent={done ? 100 : progress}
      progress={true}
      indicating={true}
      label={message}
    />
    <Button
      type="button"
      onClick={cancel}
      content="Terminate"
      negative={true}
      disabled={!running}
    />
  </Container>
);

export default RNGFinderStatus;
