import * as React from 'react';
import VirtTable from 'Table';

const Presenter = props => {
  const columns = [
    { label: 'Index', key: 'index', width: 50 },
    { label: 'Character', key: 'character', width: 200 },
    { label: 'PWR', key: 'PWR', width: 50 },
    { label: 'SKL', key: 'SKL', width: 50 },
    { label: 'DEF', key: 'DEF', width: 50 },
    { label: 'SPD', key: 'SPD', width: 50 },
    { label: 'MGC', key: 'MGC', width: 50 },
    { label: 'LUK', key: 'LUK', width: 50 },
  ];
  return <VirtTable columns={columns} data={props.levelUps}/>;
};

export default Presenter;
