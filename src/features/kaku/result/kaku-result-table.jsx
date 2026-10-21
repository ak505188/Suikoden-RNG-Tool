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
import './kaku.css';

const generateDescription = npc_event => {
  const description =
    npc_event.name === 'Mina' && npc_event.event === 'Start Mina Timer' ?
    <span><b>Mina</b> Timer Start</span> :
    <span><b>{npc_event.name}</b> {npc_event.event.toLowerCase()} {npc_event.direction}</span>;
  return description;
}

const RegularTable = ({ events }) => {
  return (
    <Container textAlign="center">
      <Table compact celled size="large">
        <TableHeader>
          <TableRow>
            <TableHeaderCell collapsing>
              Frame
            </TableHeaderCell>
            <TableHeaderCell collapsing>
              Event RNG Index
            </TableHeaderCell>
            <TableHeaderCell>
              Event Description
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((npc_event, index) => (
            <TableRow
              key={index}
              className={npc_event.name.toLowerCase().replace(' ', '_')}
            >
              <TableCell style={{ textAlign: 'right' }}>
                {npc_event.frame}
              </TableCell>
              <TableCell style={{ textAlign: 'right' }}>
                {npc_event.index}
              </TableCell>
              <TableCell>
                {generateDescription(npc_event)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default RegularTable;
