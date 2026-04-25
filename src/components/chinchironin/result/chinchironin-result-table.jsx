import * as React from 'react';
import VirtTable from 'Table';
import './chinchironin.css';

const speed_columns = Array.from({ length: 17 }).map((_, index) => ({
  key: `speed_${index*4}`,
  label: `S${index*4}`,
  width: 50
}));

const getRollClass = roll => {
  if (roll === 'OUT') return 'roll_piss';
  if (roll === '123') return 'roll_double_lose'
  if (roll === '456') return 'roll_double_win'

  const rolls = roll.split('');
  if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) {
    return rolls[0] === '1' ? 'roll_triple_lose' : 'roll_triple_win';
  }

  if (rolls[0] === rolls[1]) return `roll_${rolls[2]}`;
  if (rolls[1] === rolls[2]) return `roll_${rolls[0]}`;

  return 'roll_miss';
}

const generateColumns = (player) => {
  const columns = [
    { key: 'index', label: 'Index', width: 100 },
    { key: 'rng', label: 'RNG', width: 150 },
  ];
  player !== 'Player' ?
    columns.push({ key: 'wait', label: 'Wait', width: 50 }) :
    columns.push({ key: 'cursor', label: 'Cur', width: 50 });
  columns.push(...speed_columns);
  return columns;
}

const Presenter = ({ player, data }) => {
  const columns = generateColumns(player);

  const cellRenderer = (props) => {
    // Return if not a speed key
    if (!props.dataKey.includes('speed')) return props.cellData;

    const roll = props.rowData[props.dataKey];

    return (
      <span
        className={`roll ${player.replace(' ', '_').toLowerCase()} ${getRollClass(roll.roll)}`}
        title={`Index: ${roll.index}`}
      >
        {roll.roll}
      </span>
    )
  };

  return <VirtTable columns={columns} data={data} cellRenderer={cellRenderer}/>;
};

export default Presenter;
