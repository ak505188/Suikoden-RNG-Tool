import * as React from 'react';
import { Button, Container, Progress, Segment, Table } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';

const hex = Helpers.numToHexString;

const Matches = ({ matches, done }) => (
  <Segment>
    <p>
      {matches.length} {matches.length === 1 ? 'match' : 'matches'}
      {done ? '' : ' so far'}
    </p>
    {matches.length > 0 && (
      <div style={{ maxHeight: '22rem', overflowY: 'auto' }}>
        <Table compact basic="very" textAlign="center">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>First Battle RNG</Table.HeaderCell>
              <Table.HeaderCell>First Possible RNG</Table.HeaderCell>
              <Table.HeaderCell>Gap</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {matches.map((match, index) => (
              <Table.Row key={match.foundEncounterRNG}>
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{hex(match.foundEncounterRNG)}</Table.Cell>
                <Table.Cell>{hex(match.firstPossibleRNG)}</Table.Cell>
                <Table.Cell>{match.gap}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    )}
  </Segment>
);

const RNGFinderStatus = ({
  cancel,
  message,
  progress,
  done,
  result,
  matches,
  findAll,
  running,
}) => (
  <Container textAlign="center">
    {findAll ? (
      <Matches matches={matches ?? []} done={done} />
    ) : (
      result && (
        <Segment>
          <p>First Battle RNG: {hex(result.foundEncounterRNG)}</p>
          <p>
            First Possible RNG: {hex(result.firstPossibleRNG)} (gap of {result.gap})
          </p>
        </Segment>
      )
    )}
    <Progress percent={done ? 100 : progress} progress={true} indicating={true} label={message} />
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
