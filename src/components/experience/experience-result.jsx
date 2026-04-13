import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Container,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from 'semantic-ui-react';
import { calculateLevels } from './lib';

const ExperienceContainer = ({ characters, changeCharacters, changeFight, disabledCharacters, fights, removeFight, toggleDisabledCharacter }) => {
  const results = calculateLevels(characters, fights, disabledCharacters);

  const changeCharacterLevel = (level, index) => {
    if (level.isNaN || level < 1) level = 1;
    if (level > 99) level = 99;
    const new_characters = [
      ...characters.slice(0, index),
      { ...characters[index], level },
      ...characters.slice(index + 1)
    ];
    changeCharacters(new_characters);
  }

  const removeCharacter = index => {
    changeCharacters([
      ...characters.slice(0, index),
      ...characters.slice(index + 1)
    ]);
  }

  const changeFightPartySize = (party_size, index) => {
    if (party_size < 1 || party_size > 6) return;
    const new_fight = { ...fights[index], party_size: parseInt(party_size) };
    changeFight(new_fight, index);
  }

  if (results.length <= 0) return null;

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Table striped>
        <TableHeader>
          <TableRow>
            <TableHeaderCell/>
            {characters.map((character, index) =>
              <HeaderCell key={character.name} character={character} index={index} changeCharacterLevel={changeCharacterLevel} removeCharacter={removeCharacter}/>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell key={`${result.enemy_group.name}-${index}`}>
              <div>
                {result.enemy_group.name}
              </div>
              <div className="cell_controls">
                <input type="number" size={2} min={1} max={99.999} step={1} value={result.party_size} onChange={(e) => changeFightPartySize(e.target.value, index)}/>
                <button className="remove" onClick={() => removeFight(index)}>⊖</button>
              </div>
            </TableCell>
            {result.characters.map(character =>
              <RowCell
                key={character.name}
                character={character}
                index={index}
                enabled={!disabledCharacters[index].includes(character.name)}
                toggleDisabledCharacter={toggleDisabledCharacter}
              />
            )}
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </Container>
  );
}

const RowCell = ({ character, index, enabled, toggleDisabledCharacter }) => {
  // I don't know why I need to parseFloat character.level,
  // but it crashes in some cases if I don't.
  return (
    <TableCell
      className={`toggle ${enabled ? 'char_enabled' : 'char_disabled'}`}
      key={character.name}
      role="button"
      onClick={() => toggleDisabledCharacter(character.name, index)}
    >
      {parseFloat(character.level).toFixed(3)} <span className="indicator">●</span>
    </TableCell>
  );
};

const HeaderCell = ({ character, index, changeCharacterLevel, removeCharacter }) => {
  return (
    <TableHeaderCell>
      <div className="character_name">
        {character.name}
      </div>
      <div className="cell_controls">
        <input type="number" size={5} min={1} max={99.999} step={1} value={character.level} onChange={(e) => changeCharacterLevel(e.target.value, index)}/>
        <button className="remove" onClick={() => removeCharacter(index)}>⊖</button>
      </div>
    </TableHeaderCell>
  )
};

export default withRouter(ExperienceContainer);
