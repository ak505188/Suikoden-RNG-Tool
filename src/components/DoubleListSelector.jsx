import * as React from 'react';
import styled from 'styled-components';
// import { Label } from 'semantic-ui-react';

const ListSelectorButton = styled.button`
  &&& {
    width: 100%;
    border: 0;
    border-radius: .28571429rem;
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
    margin: 0 0 .28571429rem 0;
    color: rgba(0,0,0,.87);
    font-size: .92857143em;
    font-weight: 700;
    text-transform: none;
  }
`;

const listSelectorStyle = {
  border: '1px solid rgba(34,36,38,.15)',
  borderRadius: '.28571429rem',
  width: '100%',
  flex: 1
};

export const DoubleListSelectorDiv = styled.div`
  &&& {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1em;
  }
`;

export class ListSelector extends React.Component {
  handleClick = (index, event) => {
    event.preventDefault();
    this.props.click(index, event);
  }

  render() {
    return (
      <ListContainer>
        <Label>
          {this.props.label}
        </Label>
        <div style={listSelectorStyle}>
          {this.props.list.map((value, index) => {
            return (
              <ListSelectorButton
                onClick={this.handleClick.bind(this, index)}
                key={index}
                value={index}
              >
                  {
                    this.props.optionNames ?
                      this.props.optionNames[index] :
                      value
                  }
              </ListSelectorButton>
            );
          })}
        </div>
      </ListContainer>
    );
  }
}

export default class DoubleListSelector extends React.Component {
  addItem = (_index, event) => {
    this.props.handleChange([...this.props.list, parseInt(event.currentTarget.value)]);
  }

  removeItem = (index, _event) => {
    this.props.handleChange([...this.props.list.slice(0, index), ...this.props.list.slice(index + 1)]);
  }

  render() {
    return (
      <DoubleListSelectorDiv>
        <ListSelector list={this.props.options} label="Add Enemies" click={this.addItem}/>
        <ListSelector
          label="Remove Enemies"
          list={this.props.list.map((val, _index) => {
            return this.props.options[val];
          })}
          click={this.removeItem}
        />
      </DoubleListSelectorDiv>
    );
  }
}
