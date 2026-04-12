import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { calculateLevels } from './lib';

const ExperienceContainer = ({ characters, disabledCharacters, fights, removeFight, toggleDisabledCharacter }) => {
  const results = calculateLevels(characters, fights, disabledCharacters);
  console.log(results);

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <table>
        <thead>
          <tr>
            <th></th>
            {characters.map(character =>
              <th key={character.name}>{character.name}-{character.level}</th>
            )}
          </tr>
        </thead>
        <tbody>
        {results.map((result, index) => (
          <tr key={index}>
            <td key={result.enemy_group.name}>
              <span>{result.enemy_group.name}</span>
              <button onClick={() => removeFight(index)}>X</button>
            </td>
            {result.characters.map(character =>
              <td key={character.name}>
                <span>{character.level.toFixed(3)}</span>
                <button onClick={() => toggleDisabledCharacter(character.name, index)}>{disabledCharacters[index].includes(character.name) ? "○" : "●"}</button>
              </td>
            )}
          </tr>
        ))}
        </tbody>
      </table>
    </Container>
  );
}

export default withRouter(ExperienceContainer);
