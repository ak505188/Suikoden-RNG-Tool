import * as React from 'react';
import { Button, Container, Progress, Segment, Table } from 'semantic-ui-react';
import { formatPair } from './rngPair';

const heading = ({ count, done, stopped, limitReached }) => {
  const matches = `${count} ${count === 1 ? 'match' : 'matches'}`;
  if (stopped) return `${matches} found before stopping`;
  if (!done) return `${matches} so far`;
  if (limitReached) return `${matches} (limit reached; a longer sequence gives fewer)`;
  return matches;
};

const Matches = ({ matches, done, stopped, limitReached }) => (
  <Segment>
    <p>
      {heading({ count: matches.length, done, stopped, limitReached })}
      {matches.length > 0 && (
        <span style={{ color: 'rgba(0, 0, 0, 0.55)' }}>
          {' · '}Each result is two equivalent RNG values: the game ignores the top bit.
        </span>
      )}
    </p>
    {matches.length > 0 && (
      <div style={{ maxHeight: '22rem', overflowY: 'auto' }}>
      <Table compact basic="very" textAlign="center">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>First Battle RNG</Table.HeaderCell>
              <Table.HeaderCell>First Possible RNG</Table.HeaderCell>
              <Table.HeaderCell>Gap Between Battles</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {matches.map((match, index) => (
              <Table.Row key={match.foundEncounterRNG}>
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{formatPair(match.foundEncounterRNG)}</Table.Cell>
                <Table.Cell>{formatPair(match.firstPossibleRNG)}</Table.Cell>
                <Table.Cell>{match.gap}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    )}
  </Segment>
);

const RNGFinderStatus = ({ cancel, progress, done, stopped, limitReached, matches, running }) => (
  <Container textAlign="center">
    <Matches matches={matches ?? []} done={done} stopped={stopped} limitReached={limitReached} />
    <Progress percent={done && !stopped ? 100 : progress} progress={true} indicating={true} />
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
