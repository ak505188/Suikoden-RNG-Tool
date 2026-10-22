import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Form } from 'semantic-ui-react';
import { Characters } from 'suikoden-rng-lib';
import {
  FIGHT_AREAS,
  areaFormations,
  areaId,
  findAreaById,
  formationLevels,
  formationName,
} from 'shared/lib/encounters';
import ImportModal from 'shared/ui/ImportModal';

import ExperienceResult from './ExperienceResult';
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE, isValidPartySize, normalizeImport } from './lib';
import './Experience.scss';

const ExperienceForm = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [area, setArea] = useState('Cave of the Past');
  const [fights, setFights] = useState([]);
  const [enemyGroup, setEnemyGroup] = useState(0);
  const [partySize, setPartySize] = useState(6);
  const [disabledCharacters, setDisabledCharacters] = useState([]);

  const partySizeValid = isValidPartySize(partySize);
  const selected_character_names = characters.map((character) => character.name);

  const changeCharacters = (chars) => setCharacters(chars);

  const importData = (imported) => {
    const data = normalizeImport(imported);
    setCharacters(data.characters);
    setDisabledCharacters(data.disabled_characters);
    // Fights has to be set last, so you don't error calculating results.
    // Render updates on each setState, so these don't run concurrently.
    setFights(data.fights);
  };

  const addCharacters = () => {
    const new_characters = selectedCharacters.map((name) => ({ name, level: 1 }));
    setSelectedCharacters([]);
    setCharacters([...characters, ...new_characters]);
  };

  const addFight = () => {
    if (!partySizeValid) return;
    const { formation } = areaFormations(findAreaById(area))[enemyGroup];
    const enemy_group = {
      name: formationName(formation),
      levels: formationLevels(formation),
    };
    const fight = {
      enemy_group,
      party_size: Number(partySize),
      enabled: true,
    };
    setFights([...fights, fight]);

    const new_disabled_characters =
      disabledCharacters.length > 0 ? disabledCharacters[disabledCharacters.length - 1] : [];
    setDisabledCharacters([...disabledCharacters, new_disabled_characters]);
  };

  const toggleDisabledCharacter = (character_name, fight_index) => {
    const disabled_characters = disabledCharacters[fight_index];
    const disabled_character_index = disabled_characters.indexOf(character_name);
    if (disabled_character_index === -1) {
      setDisabledCharacters((prevDisabledCharacters) => [
        ...prevDisabledCharacters.slice(0, fight_index),
        [...disabled_characters, character_name],
        ...prevDisabledCharacters.slice(fight_index + 1),
      ]);
    } else {
      setDisabledCharacters((prevDisabledCharacters) => [
        ...prevDisabledCharacters.slice(0, fight_index),
        [
          ...disabled_characters.slice(0, disabled_character_index),
          ...disabled_characters.slice(disabled_character_index + 1),
        ],
        ...prevDisabledCharacters.slice(fight_index + 1),
      ]);
    }
  };

  const removeFight = (index) => {
    setFights((prevFights) => [...prevFights.slice(0, index), ...prevFights.slice(index + 1)]);
    setDisabledCharacters((prevDisabledCharacters) => [
      ...prevDisabledCharacters.slice(0, index),
      ...prevDisabledCharacters.slice(index + 1),
    ]);
  };

  const changeFight = (fight, index) => {
    setFights((prevFights) => [
      ...prevFights.slice(0, index),
      fight,
      ...prevFights.slice(index + 1),
    ]);
  };

  const toggleFight = (index) => {
    setFights((prevFights) => [
      ...prevFights.slice(0, index),
      { ...prevFights[index], enabled: !prevFights[index].enabled },
      ...prevFights.slice(index + 1),
    ]);
  };

  return (
    <Container textAlign="center">
      <Form size="large">
        <Form.Dropdown
          label="Characters"
          placeholder="Character"
          options={Object.keys(Characters)
            .sort()
            .filter((name) => !selected_character_names.includes(name))
            .map((name) => ({ key: name, value: name, text: name }))}
          value={selectedCharacters}
          onChange={(_e, data) => {
            setSelectedCharacters(data.value);
          }}
          multiple={true}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={FIGHT_AREAS.map((a) => ({
            key: areaId(a),
            value: areaId(a),
            text: a.name,
          }))}
          value={area}
          onChange={(_e, data) => {
            setArea(data.value);
            setEnemyGroup(0);
          }}
          multiple={false}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Enemy Group"
          placeholder="Enemy Group"
          options={areaFormations(findAreaById(area)).map(({ formation, scripted }, index) => ({
            key: index,
            value: index,
            text: formationName(formation) + (scripted ? ' (scripted)' : ''),
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
          min={MIN_PARTY_SIZE}
          max={MAX_PARTY_SIZE}
          step={1}
          error={
            !partySizeValid && {
              content: `Party size must be ${MIN_PARTY_SIZE}–${MAX_PARTY_SIZE}`,
              pointing: 'above',
            }
          }
          onChange={(e) => setPartySize(e.target.value)}
        />
        <Form.Group>
          <Form.Button
            type="submit"
            content="Generate EXP Table"
            disabled={!partySizeValid}
            onClick={() => {
              addCharacters();
              addFight();
            }}
            primary={true}
          />
          <Form.Button
            content="Add Fight"
            primary={true}
            disabled={!partySizeValid}
            onClick={addFight}
          />
          <Form.Button
            content="Add Characters"
            onClick={() => {
              addCharacters(selectedCharacters);
            }}
            primary={true}
          />
          <ImportModal
            local_storage_prefix="exp"
            importData={importData}
            trigger={<Button primary>Import</Button>}
          />
        </Form.Group>
      </Form>
      {characters.length > 0 && (
        <ExperienceResult
          characters={characters}
          changeCharacters={changeCharacters}
          changeFight={changeFight}
          changeFights={(fights) => setFights(fights)}
          changeDisabledCharacters={setDisabledCharacters}
          fights={fights}
          disabledCharacters={disabledCharacters}
          removeFight={removeFight}
          toggleDisabledCharacter={toggleDisabledCharacter}
          toggleFight={toggleFight}
        />
      )}
    </Container>
  );
};

export default withRouter(ExperienceForm);
