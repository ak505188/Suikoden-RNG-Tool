import * as React from 'react';
import {
  Container,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from 'semantic-ui-react';
import './Kaku.css';

const generateDescription = (npcEvent) => {
  const description =
    npcEvent.name === 'Mina' && npcEvent.event === 'Start Mina Timer' ? (
      <span>
        <b>Mina</b> Timer Start
      </span>
    ) : (
      <span>
        <b>{npcEvent.name}</b> {npcEvent.event.toLowerCase()} {npcEvent.direction}
      </span>
    );
  return description;
};

const RegularTable = ({ events }) => {
  return (
    <Container textAlign="center">
      <Table compact celled size="large">
        <TableHeader>
          <TableRow>
            <TableHeaderCell collapsing>Frame</TableHeaderCell>
            <TableHeaderCell collapsing>Event RNG Index</TableHeaderCell>
            <TableHeaderCell>Event Description</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((npcEvent, index) => (
            <TableRow key={index} className={npcEvent.name.toLowerCase().replace(' ', '_')}>
              <TableCell textAlign="right">{npcEvent.frame}</TableCell>
              <TableCell textAlign="right">{npcEvent.index}</TableCell>
              <TableCell>{generateDescription(npcEvent)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default RegularTable;
