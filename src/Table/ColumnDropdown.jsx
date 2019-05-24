import * as React from 'react';
import { Checkbox, Dropdown } from 'semantic-ui-react';

const ColumnToggle = props => {
  return (
    <Dropdown
      selection={true}
      text="Columns"
      options={props.columns.map((column, index) => {
        return (
          <Checkbox
            as={Dropdown.Item}
            key={column.key}
            label={column.label}
            onMouseDown={e => {
              e.preventDefault();
              props.toggleColumn(index);
            }}
            checked={props.columns[index].show !== false}
          />
        );
      })}
    />
  );
};

export default ColumnToggle;
