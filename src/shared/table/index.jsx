import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { Button } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import Table from './Table';
import Filter from './Filter';
import ColumnDropdown from './ColumnDropdown';
import ExportModal from './export-modal';

const createDefaultRowsToRender = (data) => data.map((_row, index) => index);

export default class TableContainer extends React.Component {
  constructor(props) {
    super();
    this.state = {
      rowsToRender: createDefaultRowsToRender(props.data),
      // Columns the user has shown or hidden here, by column key; the rest follow props.columns
      columnVisibility: {},
    };
  }

  render() {
    const columns = this.props.columns.map((column) => {
      const show = this.state.columnVisibility[column.key];
      return show === undefined ? column : { ...column, show };
    });
    const data = this.state.rowsToRender
      .map((rowIndex) => this.props.data[rowIndex])
      .filter((row) => row !== undefined);

    const dataForFilter = this.props.filterFromData
      ? this.props.data.map((row) =>
          Helpers.filterPropertiesFromObject(row, this.props.filterFromData),
        )
      : this.props.data;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <React.Fragment>
            <div style={{ display: 'flex', justifyContent: 'space-between', width, height: 38 }}>
              {this.props.filter !== false ? (
                <div style={{ marginRight: 'auto' }}>
                  <Filter
                    data={this.props.filterFromData !== undefined ? dataForFilter : this.props.data}
                    setRowsToRender={(rows) => this.setState({ rowsToRender: rows })}
                  />
                </div>
              ) : null}
              <ExportModal
                columns={columns}
                data={data}
                trigger={<Button primary>Export</Button>}
              />
              <ColumnDropdown
                columns={columns}
                toggleColumn={(columnIndex) => {
                  const { key, show } = columns[columnIndex];
                  this.setState((state) => ({
                    columnVisibility: { ...state.columnVisibility, [key]: show === false },
                  }));
                }}
              />
            </div>
            <Table
              {...this.props}
              currentRow={this.props.currentRow}
              columns={columns}
              data={data}
              height={height - 38}
              width={width}
              headerHeight={this.props.headerHeight || 30}
              rowHeight={this.props.rowHeight || 30}
              rowStyle={this.props.rowStyle || {}}
            />
          </React.Fragment>
        )}
      </AutoSizer>
    );
  }
}
