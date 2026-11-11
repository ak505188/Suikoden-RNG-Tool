import * as React from 'react';
import { Input } from 'semantic-ui-react';
import SearchApi from './SearchIndex';
import { Helpers } from 'suikoden-rng-lib';

// The text each row is searched by: its values, joined by commas
const rowText = (row) =>
  JSON.stringify(row)
    .replace(/{|}/g, '')
    .replace(/"[^,]*?":/g, '')
    .replace(/"/g, '')
    .trim();

const buildIndex = (data) => {
  const index = new SearchApi({ tokenizePattern: /,/ });
  data.forEach((row, i) => index.indexDocument(i, rowText(row)));
  return index;
};

// Tables hand in a new array on every render, so keep the previous one until the content changes
const useStableData = (data) => {
  const stable = React.useRef(data);
  if (!Helpers.arraysEqual(data, stable.current)) stable.current = data;
  return stable.current;
};

const Filter = ({ data, setRowsToRender }) => {
  const [filter, setFilter] = React.useState('');
  const [filtering, setFiltering] = React.useState(false);
  const stableData = useStableData(data);
  const index = React.useMemo(() => buildIndex(stableData), [stableData]);
  // The parent may pass a new function every render; searching again for that would never end
  const setRows = React.useRef(setRowsToRender);
  setRows.current = setRowsToRender;

  React.useEffect(() => () => index.terminate(), [index]);

  // Search again when the text or the data changes. A search that finishes after a newer one
  // started is ignored.
  React.useEffect(() => {
    let current = true;
    setFiltering(true);
    index
      .search(filter)
      .then((result) => {
        if (!current) return;
        setRows.current(result);
        setFiltering(false);
      })
      .catch((error) => console.error(error));
    return () => {
      current = false;
    };
  }, [index, filter]);

  return (
    <Input
      placeholder="Filter"
      loading={filtering}
      type="text"
      onChange={(_e, input) => setFilter(input.value)}
      value={filter}
    />
  );
};

export default Filter;
