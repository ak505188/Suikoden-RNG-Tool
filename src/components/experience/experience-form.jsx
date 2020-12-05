import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { DoubleListSelectorDiv, ListSelector } from 'components/DoubleListSelector';
import SortableContainer from 'components/ListSelector';
import ExperienceResult from './experience-result';
import './experience.scss';

const ExperienceForm = ({ areas }) => {
  const [levels, setLevels] = useState('24.165');
  const [selectedArea, setSelectedArea] = useState('Cave of the Past');
  const [selectedFights, setSelectedFights] = useState([]);
  const onPartySizeChange = (partySize, index) => {
    setSelectedFights(prevSelectedFights => [
      ...prevSelectedFights.slice(0, index),
      { partySize, enemyGroup: prevSelectedFights[index].enemyGroup },
      ...prevSelectedFights.slice(index + 1)
    ])
  };

  const onSelectedFightDelete = index => setSelectedFights(prevSelectedFights => [
    ...prevSelectedFights.slice(0, index),
    ...prevSelectedFights.slice(index + 1)
  ])

  return (
    <Container textAlign="center">
      <Form size="large">
        <Form.Input
          label="Character Level"
          type="text"
          value={levels}
          min={1}
          max={99}
          step={.001}
          onChange={e => setLevels(e.target.value)}
        />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={Object.keys(areas).map(name =>
            ({ key: name, value: name, text: areas[name].name })
          )}
          value={selectedArea}
          onChange={(_e, data) => setSelectedArea(data.value)}
          multiple={false}
          search={true}
          selection={true}
        />
        <DoubleListSelectorDiv>
          <ListSelector
            label="Add Fight"
            click={index => setSelectedFights([...selectedFights, { partySize: 6, enemyGroup: areas[selectedArea].encounterTable[index]} ])}
            list={areas[selectedArea].encounterTable}
            optionNames={areas[selectedArea].encounterTable.map(group => group.name)}
          />
          <SortableContainer
            label="Selected Fights"
            onClick={index => setSelectedFights([
              ...selectedFights.slice(0, index),
              ...selectedFights.slice(index + 1)
            ])}
            handleDrag={fights => setSelectedFights(fights)}
            listItemHandlers={{ onPartySizeChange, onSelectedFightDelete }}
            list={selectedFights}
          />
        </DoubleListSelectorDiv>
      </Form>
      <ExperienceResult
        levels={levels.split(',')}
        fights={selectedFights.map(selectedFight => ({
          partySize: selectedFight.partySize,
          levels: selectedFight.enemyGroup.enemies.map(enemy => enemy.stats.lvl)
        }))}
      />
    </Container>
  );
}

export default withRouter(ExperienceForm);
