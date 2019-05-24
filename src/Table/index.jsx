import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { Container } from 'semantic-ui-react';
import Table from './Table';
import Filter from './Filter';
import ColumnDropdown from './ColumnDropdown';
import { arraysEqual, filterPropertiesFromObject } from '../lib/lib';

const createDefaultRowsToRender = (data => data.map((row, index) => index));

export default class TableContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowsToRender: createDefaultRowsToRender(props.data),
      columns: props.columns
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data.length !== nextProps.data.length) {
      this.setState({ rowsToRender: createDefaultRowsToRender(nextProps.data)});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevData = this.props.filterFromData
      ? prevProps.data.map(row => filterPropertiesFromObject(row, this.props.filterFromData))
      : prevProps.data;
    const curData = this.props.filterFromData
      ? this.props.data.map(row => filterPropertiesFromObject(row, this.props.filterFromData))
      : this.props.data;
    if (!arraysEqual(prevData, curData)) {
      this.setState({ rowsToRender: createDefaultRowsToRender(this.props.data) });
    }
  }

  render() {
    const data = this.state.rowsToRender.map(rowIndex => this.props.data[rowIndex]);

    const dataForFilter = this.props.filterFromData ?
      this.props.data.map(row =>
        filterPropertiesFromObject(row, this.props.filterFromData)) :
      this.props.data;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Container>
            <div style={{ display: 'flex', 'justifyContent': 'space-between', width, height: 38 }}>
              { this.props.filter !== false ?
                <Filter
                  data={
                    this.props.filterFromData !== undefined ?
                    dataForFilter :
                    this.props.data
                  }
                  setRowsToRender={(rows: number[]) => this.setState({ rowsToRender: rows })}
                /> : null }
              <ColumnDropdown
                columns={this.state.columns}
                toggleColumn={(columnIndex => {
                  const columns = this.state.columns;
                  columns[columnIndex].show = columns[columnIndex].show === false ? true : false;
                  this.setState({ columns });
                })}
              />
            </div>
            <Table
              {...this.props}
              currentRow={this.props.currentRow}
              columns={this.state.columns}
              data={data}
              height={height - 38}
              width={width}
              headerHeight={this.props.headerHeight || 30}
              rowHeight={this.props.rowHeight || 30}
              rowStyle={this.props.rowStyle || {}}
            />
          </Container>
        )}
      </AutoSizer>
    );
  }
}
