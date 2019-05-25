import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { DoubleListSelectorDiv, ListSelector } from 'components/DoubleListSelector';
import ExperienceResult from './experience-result';

const ExperienceForm = ({ areas }) => {
  const [level, setLevel] = useState(24.165);
  const [selectedArea, setSelectedArea] = useState('Cave of the Past');
  const [selectedFights, setSelectedFights] = useState([]);

  return (
    <Container textAlign="center">
      <Form size="large">
        <Form.Input
          label="Character Level"
          type="number"
          value={level}
          min={1}
          max={99}
          step={.001}
          onChange={e => setLevel(e.target.value)}
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
            click={index => setSelectedFights([...selectedFights, areas[selectedArea].encounterTable[index]])}
            list={areas[selectedArea].encounterTable}
            optionNames={areas[selectedArea].encounterTable.map(group => group.name)}
          />
          <ListSelector
            click={index => setSelectedFights([
              ...selectedFights.slice(0, index),
              ...selectedFights.slice(index + 1)
            ])}
            list={selectedFights}
            optionNames={selectedFights.map(group => group.name)}
          />
        </DoubleListSelectorDiv>
      </Form>
      <ExperienceResult
        level={level}
        fights={selectedFights.map(fight =>
          fight.enemies.map(enemy => enemy.stats.lvl)
        )}
      />
    </Container>
  );
}

export default withRouter(ExperienceForm);
