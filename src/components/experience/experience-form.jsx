import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Characters } from 'suikoden-rng-lib/stats/characters';

import ExperienceResult from './experience-result';
import './experience.scss';

const CharactersForm = ({ addCharacters }) => {
  const [characters, setCharacters] = useState([]);
  const [startingLevels, setStartingLevels] = useState([]);

  const handleSubmit = () => {
    const levels = startingLevels.split(',').map(level => parseFloat(parseFloat(level).toFixed(3)));
    if (levels.length === characters.length) {
      const characters_data = characters.map((name, index) => ({ name: name, level: levels[index] }));
      addCharacters(characters_data);
    }
  }

  return (
    <Form onSubmit={handleSubmit} size="large">
      <Form.Dropdown
        label="Characters"
        placeholder="Character"
        options={Object.keys(Characters).sort().map(name =>
          ({ key: name, value: name, text: name }))}
        value={characters}
        onChange={(_e, data) => setCharacters(data.value)}
        multiple={true}
        search={true}
        selection={true}
      />
      <Form.Input
        label="Starting Levels"
        type="text"
        value={startingLevels}
        onChange={e => setStartingLevels(e.target.value)}
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

  const addCharacters = new_characters => {
    // TODO: Check for and remove duplicates
    setCharacters([...characters, ...new_characters]);
  }

  const addFight = fight => {
    setFights([...fights, fight]);
    setDisabledCharacters([...disabledCharacters, []]);
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

  return (
    <Container textAlign="center">
      <CharactersForm addCharacters={addCharacters}/>
      <FightsForm areas={areas} addFight={addFight}/>
      <ExperienceResult
        characters={characters}
        fights={fights}
        disabledCharacters={disabledCharacters}
        removeFight={removeFight}
        toggleDisabledCharacter={toggleDisabledCharacter}
      />
    </Container>
  );
}

export default withRouter(ExperienceForm);
