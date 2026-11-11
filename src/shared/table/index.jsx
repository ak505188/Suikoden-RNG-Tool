import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { Button } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import Table from './Table';
import Filter from './Filter';
import ColumnDropdown from './ColumnDropdown';
import ExportModal from './export-modal';

const createDefaultRowsToRender = (data) => data.map((_row, index) => index);

const TableContainer = (props) => {
  const [rowsToRender, setRowsToRender] = React.useState(() =>
    createDefaultRowsToRender(props.data),
  );
  // Columns the user has shown or hidden here, by column key; the rest follow props.columns
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const columns = props.columns.map((column) => {
    const show = columnVisibility[column.key];
    return show === undefined ? column : { ...column, show };
  });
  const data = rowsToRender
    .map((rowIndex) => props.data[rowIndex])
    .filter((row) => row !== undefined);

  const dataForFilter = props.filterFromData
    ? props.data.map((row) => Helpers.filterPropertiesFromObject(row, props.filterFromData))
    : props.data;

  const toggleColumn = (columnIndex) => {
    const { key, show } = columns[columnIndex];
    setColumnVisibility((visibility) => ({ ...visibility, [key]: show === false }));
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'space-between', width, height: 38 }}>
            {props.filter !== false ? (
              <div style={{ marginRight: 'auto' }}>
                <Filter
                  data={props.filterFromData !== undefined ? dataForFilter : props.data}
                  setRowsToRender={setRowsToRender}
                />
              </div>
            ) : null}
            <ExportModal columns={columns} data={data} trigger={<Button primary>Export</Button>} />
            <ColumnDropdown columns={columns} toggleColumn={toggleColumn} />
          </div>
          <Table
            {...props}
            currentRow={props.currentRow}
            columns={columns}
            data={data}
            height={height - 38}
            width={width}
            headerHeight={props.headerHeight || 30}
            rowHeight={props.rowHeight || 30}
            rowStyle={props.rowStyle || {}}
          />
        </React.Fragment>
      )}
    </AutoSizer>
  );
};

export default TableContainer;
