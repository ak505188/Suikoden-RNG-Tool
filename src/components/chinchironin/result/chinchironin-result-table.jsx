import * as React from 'react';
import VirtTable from 'Table';

const speed_columns = Array.from({ length: 17 }).map((_, index) => ({
  key: `speed_${index*4}`,
  label: `S${index*4}`,
  width: 50
}));

const Presenter = ({ data }) => {
  const columns = [
    { key: 'index', label: 'Index', width: 100 },
    { key: 'rng', label: 'RNG', width: 150 },
    { key: 'wait', label: 'Wait', width: 50 },
    ...speed_columns
  ];
  console.log(columns);
  return <VirtTable columns={columns} data={data}/>;
};

export default Presenter;
