import * as React from 'react';
import { Button, Container, Progress, Segment } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';

const RNGFinderStatus = ({ cancel, message, progress, done, result, running }) => (
  <Container textAlign="center">
    {result &&
      <Segment>
        <p>
          First Battle RNG: {Helpers.numToHexString(result.foundEncounterRNG)}
        </p>
        <p>
          Previous Battle RNG: {Helpers.numToHexString(result.foundEncounterRNGPrevious)}
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
