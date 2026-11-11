import * as React from 'react';
import styled from 'styled-components';

const ListButton = styled.button`
  &&& {
    width: 100%;
    border: 0;
    border-radius: 0.28571429rem;
    background-color: white;
    color: black;
  }
`;

const ListContainer = styled.div`
  &&& {
    width: 49.75%;
    display: flex;
    flex-direction: column;
  }
`;

const Label = styled.label`
  &&& {
    margin: 0 0 0.28571429rem 0;
    color: rgba(0, 0, 0, 0.87);
    font-size: 0.92857143em;
    font-weight: 700;
    text-transform: none;
  }
`;

const ListInnerContainer = styled.div`
  &&& {
    border: 1px solid rgba(34, 36, 38, 0.15);
    border-radius: 0.28571429rem;
    width: 100%;
    flex: 1;
  }
`;

const DoubleListSelectorDiv = styled.div`
  &&& {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1em;
  }
`;

// One column of buttons; clicking one calls onSelect with its position in `list`
const ListSelector = ({ label, list, onSelect }) => (
  <ListContainer>
    <Label>{label}</Label>
    <ListInnerContainer>
      {list.map((name, index) => (
        <ListButton type="button" key={index} onClick={() => onSelect(index)}>
          {name}
        </ListButton>
      ))}
    </ListInnerContainer>
  </ListContainer>
);

// Builds a list of positions in `options`: pick from the left list to add one at the end, from
// the right list (the picks so far, in order) to remove it. `list` and `handleChange` carry the
// picked positions.
const DoubleListSelector = ({ options, list, handleChange }) => (
  <DoubleListSelectorDiv>
    <ListSelector
      label="Add Enemies"
      list={options}
      onSelect={(index) => handleChange([...list, index])}
    />
    <ListSelector
      label="Remove Enemies"
      list={list.map((position) => options[position])}
      onSelect={(index) => handleChange(list.filter((_, i) => i !== index))}
    />
  </DoubleListSelectorDiv>
);

export default DoubleListSelector;
