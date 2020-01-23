import * as React from 'react';
import VirtTable from 'Table';

const Presenter = ({ sequence }) => {
  const columns = [
    { key: 'index', label: 'Index', width: 100 },
    { key: 'rng', label: 'RNG', width: 150 },
    { key: 'wheelAttempts', label: 'Wheel Attempts', width: 200, show: false }
  ];
  return <VirtTable columns={columns} data={sequence}/>;
};

export default Presenter;
