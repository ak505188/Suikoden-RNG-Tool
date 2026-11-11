import * as React from 'react';
import './DoubleListSelector.css';

// One column of buttons; clicking one calls onSelect with its position in `list`
const ListSelector = ({ label, list, onSelect }) => (
  <div className="list-selector">
    <label className="list-selector-label">{label}</label>
    <div className="list-selector-box">
      {list.map((name, index) => (
        <button
          className="list-selector-button"
          type="button"
          key={index}
          onClick={() => onSelect(index)}
        >
          {name}
        </button>
      ))}
    </div>
  </div>
);

// Builds a list of positions in `options`: pick from the left list to add one at the end, from
// the right list (the picks so far, in order) to remove it. `list` and `handleChange` carry the
// picked positions.
const DoubleListSelector = ({ options, list, handleChange }) => (
  <div className="double-list-selector">
    <ListSelector
      label="Add Fight"
      list={options}
      onSelect={(index) => handleChange([...list, index])}
    />
    <ListSelector
      label="Fights Seen"
      list={list.map((position) => options[position])}
      onSelect={(index) => handleChange(list.filter((_, i) => i !== index))}
    />
  </div>
);

export default DoubleListSelector;
