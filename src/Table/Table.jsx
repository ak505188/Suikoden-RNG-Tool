import * as React from 'react';
import { Column, Table as VirtTable } from 'react-virtualized';

const defaultRowStyle = {
  lineHeight: 1
};

const Table = props => {
  const columns = props.columns.reduce(
    (accumulator, column) => {
      // Undefined show should still show columns.
      // Only explicitly hidden columns will not be shown.
      if (column.show !== false) {
        accumulator.push(column);
      }
      return accumulator;
    },
    []);
  const columnsWidthRatio: number = props.width /
    columns.reduce((total, column) => (total += column.width), 0);
  const rowStyle = props.rowStyle ? { ...defaultRowStyle, ...props.rowStyle } : defaultRowStyle;
  return (
    <VirtTable
      headerHeight={props.headerHeight}
      height={props.height}
      onRowClick={({ index }) => {
        if (props.onRowClick) {
          props.onRowClick(index);
        }
      }}
      rowCount={props.data.length}
      rowGetter={({ index }) => props.data[index]}
      rowHeight={props.rowHeight}
      rowStyle={({ index }) => (props.currentRow !== undefined && props.currentRow === index
        ? { ...rowStyle, backgroundColor: 'yellow' }
        : rowStyle)}
      scrollToIndex={props.currentRow}
      scrollToAlignment="start"
      width={props.width}
    >
      {columns.map(column => {
        return (
          <Column
            cellRenderer={({ cellData }) => {
              if (cellData === null) {
                return '';
              }

              if (React.isValidElement(cellData)) {
                return cellData;
              }

              return String(cellData);
            }}
            key={column.key}
            label={column.label}
            dataKey={column.key}
            width={columnsWidthRatio * column.width}
          />
        );
      })}
    </VirtTable>
  );
};

export default Table;
