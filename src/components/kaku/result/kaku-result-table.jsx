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
import VirtTable from 'Table';
import './kaku.css';

const Presenter = ({ events }) => {
  const columns = [
    { key: 'frame', label: 'Frame', width: 50 },
    { key: 'name', label: 'NPC', width: 50, show: false },
    { key: 'description', label: 'Desription', width: 200 },
    { key: 'index', label: 'Index', width: 50 },
    { key: 'direction', label: 'Direction', width: 100, show: false },
    { key: 'event', label: 'Event', width: 100, show: false },
  ];
  return <VirtTable columns={columns} data={events}/>;
};

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
      <Table>
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
