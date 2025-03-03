import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { Button } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import Table from './Table';
import Filter from './Filter';
import ColumnDropdown from './ColumnDropdown';
import ExportModal from './export-modal';

const createDefaultRowsToRender = (data => data.map((_row, index) => index));

export default class TableContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const rowsToRender = createDefaultRowsToRender(this.props.data);
    const data = rowsToRender.map(rowIndex => this.props.data[rowIndex]);

    const dataForFilter = this.props.filterFromData ?
      this.props.data.map(row =>
        Helpers.filterPropertiesFromObject(row, this.props.filterFromData)) :
      this.props.data;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <React.Fragment>
            <div style={{ display: 'flex', 'justifyContent': 'space-between', width, height: 38 }}>
              { this.props.filter !== false ?
                <div style={{ marginRight: 'auto' }}>
                  <Filter
                    data={
                      this.props.filterFromData !== undefined ?
                      dataForFilter :
                      this.props.data
                    }
                    setRowsToRender={(rows) => this.setState({ rowsToRender: rows })}
                  />
                </div> : null }
              <ExportModal columns={this.props.columns} data={data} trigger={<Button primary>Export</Button>}/>
              <ColumnDropdown
                columns={this.props.columns}
                toggleColumn={(columnIndex => {
                  const columns = this.props.columns;
                  columns[columnIndex].show = columns[columnIndex].show === false ? true : false;
                  this.setState({ columns });
                })}
              />
            </div>
            <Table
              {...this.props}
              currentRow={this.props.currentRow}
              columns={this.props.columns}
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
