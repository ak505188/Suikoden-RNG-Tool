import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Characters } from 'suikoden-rng-lib/stats/characters';

import ExperienceResult from './experience-result';
import './experience.scss';

const CharactersForm = ({ addCharacters, characters }) => {
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  const selected_character_names = characters.map(character => character.name);

  const handleSubmit = () => {
    const characters_data = selectedCharacters.map(name => ({ name, level: 1 }));
    addCharacters(characters_data);
    setSelectedCharacters([]);
  }

  return (
    <Form onSubmit={handleSubmit} size="large">
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
        onChange={(_e, data) => setSelectedCharacters(data.value)}
        multiple={true}
        search={true}
        selection={true}
      />
      <Form.Button type="submit" content="Add Character" primary={true}/>
    </Form>
  );
}

const FightsForm = ({ addFight, areas }) => {
  const [area, setArea] = useState('Cave of the Past');
  const [enemyGroup, setEnemyGroup] = useState(0);
  const [partySize, setPartySize] = useState(6);

  const handleSubmit = () => {
    const group = areas[area].encounterTable[enemyGroup];
    const enemy_group = {
      name: group.name,
      levels: group.enemies.map(enemy => enemy.stats.lvl)
    };
    addFight({
      enemy_group,
      party_size:partySize,
      enabled: true,
      disabled_characters: []
    });
  }

  return (
    <Form onSubmit={handleSubmit} size="large">
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
      <Form.Button type="submit" content="Add Fight" primary={true}/>
    </Form>
  );
};

const ExperienceForm = ({ areas }) => {
  const [characters, setCharacters] = useState([]);
  const [fights, setFights] = useState([]);
  const [disabledCharacters, setDisabledCharacters] = useState([]);

  const changeCharacters = chars => setCharacters(chars);

  const addCharacters = new_characters => {
    setCharacters([...characters, ...new_characters]);
  }

  const addFight = fight => {
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
  }

  return (
    <div>
      <Container textAlign="center">
        <CharactersForm addCharacters={addCharacters} characters={characters}/>
        <FightsForm areas={areas} addFight={addFight}/>
      </Container>
      <ExperienceResult
        characters={characters}
        changeCharacters={changeCharacters}
        changeFight={changeFight}
        fights={fights}
        disabledCharacters={disabledCharacters}
        removeFight={removeFight}
        toggleDisabledCharacter={toggleDisabledCharacter}
      />
    </div>
  );
}

export default withRouter(ExperienceForm);
