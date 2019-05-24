import * as React from 'react';
import VirtTable from 'Table';

const ItemdropsTable = ({ drops })=> {
  const columns = [
    { label: 'Index', key: 'index', width: 100 },
    { label: 'Drop', key: 'drop', width: 300 },
    { label: 'RNG', key: 'rng', width: 150 }
  ];
  return <VirtTable data={drops} columns={columns}/>;
};

export default ItemdropsTable;
