import * as React from 'react';
import VirtTable from 'Table';

const Presenter = ({ data }) => {
  const columns = [
    { key: 'end_index', label: 'End Index', width: 50 },
    { key: 'kirkis_index', label: 'Kirkis Index', width: 50 },
    { key: 'index', label: 'Start Index', width: 50 },
    { key: 'rng', label: 'RNG', width: 150, show: false },
    { key: 'turn1_move', label: 'T1 Move', width: 50 },
    { key: 'turn1_damage', label: 'T1 DMG', width: 50 },
    { key: 'turn2_move', label: 'T2 Move', width: 50 },
    { key: 'turn2_damage', label: 'T2 DMG', width: 50 },
    { key: 'kirkis_hp', label: 'Kirkis HP', width: 50 },
    { key: 'end_rng', label: 'End RNG', width: 100, show: false },
    { key: 'advancement', label: 'RNG advancement', width: 100, show: false }
  ];
  return <VirtTable columns={columns} data={data}/>;
};

export default Presenter;
