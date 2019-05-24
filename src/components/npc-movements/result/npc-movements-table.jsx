import * as React from 'react';
import VirtTable from 'Table';

const NPCMovementsTable = ({ NPCInfo }) => {
  const columns = [
    { key: 'index', label: 'Index', width: 100 },
    { key: 'npc', label: 'NPC #', width: 50 },
    { key: 'direction', label: 'Direction', width: 150 },
    { key: 'rng', label: 'RNG', width: 150 }

  ];
  return <VirtTable columns={columns} data={NPCInfo}/>;
};

export default NPCMovementsTable;
