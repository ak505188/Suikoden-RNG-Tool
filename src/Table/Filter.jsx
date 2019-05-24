import * as React from 'react';
import { Input } from 'semantic-ui-react';
import SearchApi from 'js-worker-search';
import { arraysEqual } from '../lib/lib';

export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchApi: new SearchApi({ tokenizePattern: /,/ }),
      filter: '',
      filtering: false,
    };
  }

  componentDidMount() {
    this.indexData(this.props.data);
  }

  componentDidUpdate(prevProps) {
    if (!arraysEqual(this.props.data, prevProps.data)) {
      this.state.searchApi._search._worker.terminate();
      this.setState({ searchApi: new SearchApi({ tokenizePattern: /,/ }) }, () => {
        this.indexData(this.props.data);
        this.filter();
      });
    }
  }

  indexData(data) {
    for (let i = 0; i < data.length; i++) {
      const row: string = JSON.stringify(data[i])
        .replace(/{|}/g, '')
        .replace(/"[^,]*?":/g, '')
        .replace(/"/g, '')
        .trim();
      this.state.searchApi.indexDocument(i, row);
    }
  }

  filter = () => {
    this.setState({ filtering: true }, () => {
      this.state.searchApi.search(this.state.filter)
        .then((result) => {
          this.props.setRowsToRender(result);
          this.setState({ filtering: false });
        })
        .catch((error) => console.error(error));
    });
  }

  render() {
    return (
      <Input
        placeholder="Filter"
        loading={this.state.filtering}
        type="text"
        onChange={e =>
          this.setState({ filter: e.currentTarget.value }, () => this.filter())
        }
        value={this.state.filter}
      />
    );
  }
}
