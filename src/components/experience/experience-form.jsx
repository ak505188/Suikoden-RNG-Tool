import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Form } from 'semantic-ui-react';
import { Characters } from 'suikoden-rng-lib/stats/characters';
import ImportModal from '../ImportModal';

import ExperienceResult from './experience-result-vibe';
import './experience.scss';

const ExperienceForm = ({ areas }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [area, setArea] = useState('Cave of the Past');
  const [fights, setFights] = useState([]);
  const [enemyGroup, setEnemyGroup] = useState(0);
  const [partySize, setPartySize] = useState(6);
  const [disabledCharacters, setDisabledCharacters] = useState([]);

  const selected_character_names = characters.map(character => character.name);

  const changeCharacters = chars => setCharacters(chars);

  const importData = data => {
    setCharacters(data.characters);
    setDisabledCharacters(data.disabled_characters);
    // Fights has to be set last, so you don't error calculating results.
    // Render updates on each setState, so these don't run concurrently.
    setFights(data.fights);
  }

  const addCharacters = () => {
    const new_characters = selectedCharacters.map(name => ({ name, level: 1 }));
    setSelectedCharacters([]);
    setCharacters([...characters, ...new_characters]);
  }

  const addFight = () => {
    console.log('Test');
    const group = areas[area].encounterTable[enemyGroup];
    const enemy_group = {
      name: group.name,
      levels: group.enemies.map(enemy => enemy.stats.lvl)
    };
    const fight = ({
      enemy_group,
      party_size: partySize,
      enabled: true,
    });
    console.log(fight);
    setFights([...fights, fight]);

    const new_disabled_characters = disabledCharacters.length > 0 ? disabledCharacters[disabledCharacters.length-1] : [];
    setDisabledCharacters([...disabledCharacters, new_disabled_characters]);
  }

  const toggleDisabledCharacter = (character_name, fight_index) => {
    const disabled_characters = disabledCharacters[fight_index];
    const disabled_character_index = disabled_characters.indexOf(character_name);
    if (disabled_character_index === -1) {
      setDisabledCharacters(prevDisabledCharacters => [
        ...prevDisabledCharacters.slice(0, fight_index),
        [...disabled_characters, character_name],
        ...prevDisabledCharacters.slice(fight_index + 1)
      ]);
    } else {
      setDisabledCharacters(prevDisabledCharacters => [
        ...prevDisabledCharacters.slice(0, fight_index),
        [
          ...disabled_characters.slice(0, disabled_character_index),
          ...disabled_characters.slice(disabled_character_index + 1),
        ],
        ...prevDisabledCharacters.slice(fight_index + 1)
      ]);
    }
  }

  const removeFight = index => {
    setFights(prevFights => [
      ...prevFights.slice(0, index),
      ...prevFights.slice(index + 1)
    ]);
    setDisabledCharacters(prevDisabledCharacters => [
      ...prevDisabledCharacters.slice(0, index),
      ...prevDisabledCharacters.slice(index + 1)
    ]);
  };

  const changeFight = (fight, index) => {
    setFights(prevFights => [
      ...prevFights.slice(0, index),
      fight,
      ...prevFights.slice(index + 1)
    ]);
  };

  const toggleFight = (index) => {
    setFights(prevFights => [
      ...prevFights.slice(0, index),
      { ...prevFights[index], enabled: !prevFights[index].enabled },
      ...prevFights.slice(index + 1)
    ]);
  };

  return (
    <Container textAlign='center'>
      <Form size="large">
        <Form.Dropdown
          label="Characters"
          placeholder="Character"
          options={
            Object.keys(Characters)
              .sort()
              .filter(name => !selected_character_names.includes(name))
              .map(name => ({ key: name, value: name, text: name }))
          }
          value={selectedCharacters}
          onChange={(_e, data) => {
            setSelectedCharacters(data.value)
          }}
          multiple={true}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={Object.keys(areas).map(name =>
            ({ key: name, value: name, text: areas[name].name })
          )}
          value={area}
          onChange={(_e, data) => setArea(data.value)}
          multiple={false}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Enemy Group"
          placeholder="Enemy Group"
          options={areas[area].encounterTable.map((group, index) => ({
            key: `${group.name}-${index}`, value: index, text: group.name
          }))}
          value={enemyGroup}
          onChange={(_e, data) => setEnemyGroup(data.value)}
          search={true}
          selection={true}
        />
        <Form.Input
          label="Party Size"
          type="number"
          value={partySize}
          min={1}
          max={6}
          step={1}
          onChange={e => setPartySize(e.target.value)}
        />
        <Form.Group>
          <Form.Button
            type="submit"
            content="Generate EXP Table"
            onClick={() => {
              addCharacters();
              addFight();
            }}
            primary={true}
          />
          <Form.Button content="Add Fight" primary={true} onClick={addFight}/>
          <Form.Button content="Add Characters" onClick={() => {
              addCharacters(selectedCharacters);
            }}
            primary={true}
          />
          <ImportModal
            local_storage_prefix='exp'
            importData={importData}
            trigger={<Button primary>Import</Button>}
          />
        </Form.Group>
      </Form>
      {characters.length > 0 &&
        <ExperienceResult
          characters={characters}
          changeCharacters={changeCharacters}
          changeFight={changeFight}
          changeFights={fights => setFights(fights)}
          fights={fights}
          disabledCharacters={disabledCharacters}
          removeFight={removeFight}
          toggleDisabledCharacter={toggleDisabledCharacter}
          toggleFight={toggleFight}
        />
      }
    </Container>
  );
}

export default withRouter(ExperienceForm);
