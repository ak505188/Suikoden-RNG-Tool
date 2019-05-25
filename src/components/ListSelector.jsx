import React from 'react';
import { Label, ListContainer, ListInnerContainer, ListButton } from './DoubleListSelector';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import { Icon } from 'semantic-ui-react';

const Handle = SortableHandle(() => <Icon name="exchange" rotated="clockwise" />);

const SortableItem = SortableElement(({ value, onClick, sortIndex }) => {
  return (
    <ListButton onClick={() => onClick(sortIndex)}>
      <Handle/>
      {value.name}
    </ListButton>
  );
});

const SortableList = SortableContainer(({ list, onClick }) => {
  return (
    <ListInnerContainer>
      { list.map((value, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          sortIndex={index}
          value={value}
          onClick={onClick}
        />
      ))}
    </ListInnerContainer>
  );
});

const SortableComponent = props => {
  const onSortEnd = ({oldIndex, newIndex}) => {
    props.handleDrag(arrayMove(props.list, oldIndex, newIndex));
  };

  return (
    <ListContainer>
      <Label>
        {props.label}
      </Label>
      <SortableList
        list={props.list}
        onSortEnd={onSortEnd}
        onClick={props.onClick}
        lockAxis="y"
      />
    </ListContainer>
  );
}

export default SortableComponent;
