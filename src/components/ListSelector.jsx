import React from 'react';
import { Label, ListContainer, ListInnerContainer, ListButton } from './DoubleListSelector';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

const SelectedFight = ({ enemyGroupName, index, partySize, onPartySizeChange, onSelectedFightDelete }) => (
  <span className="experience-selected-fight-container">
    <span
      className="experience-remove-fight"
      onClick={onSelectedFightDelete}
    >
      X
    </span>
    <input className="experience-party-size" type="number" min="0" max="6" value={partySize} onChange={e => onPartySizeChange(e.target.value, index)}/>
    <span className="experience-fight-name">{enemyGroupName}</span>
  </span>
);


const SortableItem = SortableElement(({ value, listItemHandlers, sortIndex }) => {
  return (
    <ListButton style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SelectedFight
        enemyGroupName={value.enemyGroup.name}
        partySize={value.partySize}
        onPartySizeChange={listItemHandlers.onPartySizeChange}
        index={sortIndex}
        onSelectedFightDelete={() => listItemHandlers.onSelectedFightDelete(sortIndex)}/>
    </ListButton>
  );
});

const SortableList = SortableContainer(({ list, listItemHandlers }) => {
  return (
    <ListInnerContainer>
      { list.map((value, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          sortIndex={index}
          value={value}
          listItemHandlers={listItemHandlers}
          render={value}
        />
      ))}
    </ListInnerContainer>
  );
});

const SortableComponent = props => {
  const onSortEnd = ({oldIndex, newIndex}) => {
    const newArr = arrayMove(props.list, oldIndex, newIndex);
    props.handleDrag(newArr);
  };

  return (
    <ListContainer>
      <Label>
        {props.label} (Hold to drag)
      </Label>
      <SortableList
        list={props.list}
        listItemHandlers={props.listItemHandlers}
        pressDelay={100}
        onSortEnd={onSortEnd}
        onClick={props.onClick}
        lockAxis="y"
      />
    </ListContainer>
  );
}

export default SortableComponent;
