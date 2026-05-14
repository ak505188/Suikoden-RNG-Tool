import * as React from 'react';
import VirtTable from 'Table';

const Presenter = ({ data, rng }) => {
  const columns = [
    { key: 'kirkis_index', label: 'Kirkis Index', width: 50 },
    { key: 'index', label: 'Start Index', width: 50 },
    { key: 'end_index', label: 'End Index', width: 50 },
    { key: 'rng', label: 'RNG', width: 150, show: false },
    { key: 'turn1_move', label: 'T1 Move', width: 50, show: false },
    { key: 'turn1_damage', label: 'T1 DMG', width: 50 },
    { key: 'turn2_move', label: 'T2 Move', width: 50, show: false },
    { key: 'turn2_damage', label: 'T2 DMG', width: 50 },
    { key: 'kirkis_hp', label: 'Kirkis HP', width: 50 },
    { key: 'kirkis_pwr', label: 'Kirkis PWR', width: 50, show: false },
    { key: 'kirkis_skl', label: 'Kirkis SKL', width: 50 },
    { key: 'kirkis_def', label: 'Kirkis DEF', width: 50, show: false },
    { key: 'kirkis_spd', label: 'Kirkis SPD', width: 50, show: false },
    { key: 'kirkis_mgc', label: 'Kirkis MGC', width: 50, show: false },
    { key: 'kirkis_luk', label: 'Kirkis LUK', width: 50, show: false },
    { key: 'end_rng', label: 'End RNG', width: 100, show: false },
    { key: 'advancement', label: 'RNG advancement', width: 100, show: false }
  ];

  const cellRenderer = (props) => {
    // Return if not a speed key
    if (!props.dataKey.includes('kirkis_index')) return props.cellData;
    return (
      <a href={`/#/kaku/result?rng=${rng}&start_index=${props.cellData}&frames=900`}>
        {props.cellData}</a>
    );
  };
  return <VirtTable columns={columns} cellRenderer={cellRenderer} data={data}/>;
};

export default Presenter;
