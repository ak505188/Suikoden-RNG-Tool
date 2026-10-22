import React, { useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Container,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from 'semantic-ui-react';
import ExportModal from 'shared/table/export-modal';
import DraftNumberInput from './DraftNumberInput';
import {
  MAX_LEVEL,
  MAX_PARTY_SIZE,
  MIN_LEVEL,
  MIN_PARTY_SIZE,
  calculateLevels,
  isValidPartySize,
  parseLevel,
} from './lib';

const ExperienceContainer = ({
  characters,
  changeCharacters,
  changeFight,
  changeFights,
  changeDisabledCharacters,
  disabledCharacters,
  fights,
  removeFight,
  toggleFight,
  toggleDisabledCharacter,
}) => {
  const results = calculateLevels(characters, fights, disabledCharacters);
  const export_data = {
    characters,
    fights,
    disabled_characters: disabledCharacters,
  };

  // --- Drag state ---
  const dragColIndex = useRef(null);
  const dragRowIndex = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);

  // --- Column (character) drag handlers ---
  const onColDragStart = (index) => {
    dragColIndex.current = index;
  };

  const onColDragOver = (e, index) => {
    e.preventDefault();
    setDragOverCol(index);
  };

  const onColDrop = (toIndex) => {
    const fromIndex = dragColIndex.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragColIndex.current = null;
      setDragOverCol(null);
      return;
    }

    const reordered = [...characters];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    changeCharacters(reordered);

    dragColIndex.current = null;
    setDragOverCol(null);
  };

  const onColDragEnd = () => {
    dragColIndex.current = null;
    setDragOverCol(null);
  };

  // --- Row (fight) drag handlers ---
  const onRowDragStart = (index) => {
    dragRowIndex.current = index;
  };

  const onRowDragOver = (e, index) => {
    e.preventDefault();
    setDragOverRow(index);
  };

  const onRowDrop = (toIndex) => {
    const fromIndex = dragRowIndex.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragRowIndex.current = null;
      setDragOverRow(null);
      return;
    }

    // Reorder fights array
    const reorderedFights = [...fights];
    const [movedFight] = reorderedFights.splice(fromIndex, 1);
    reorderedFights.splice(toIndex, 0, movedFight);

    // Reorder disabledCharacters array in sync
    const reorderedDisabled = [...disabledCharacters];
    const [movedDisabled] = reorderedDisabled.splice(fromIndex, 1);
    reorderedDisabled.splice(toIndex, 0, movedDisabled);

    // Disabled characters are stored per fight, so they move with the fights
    changeFights(reorderedFights);
    changeDisabledCharacters(reorderedDisabled);

    dragRowIndex.current = null;
    setDragOverRow(null);
  };

  const onRowDragEnd = () => {
    dragRowIndex.current = null;
    setDragOverRow(null);
  };

  // --- Character level / remove ---
  const changeCharacterLevel = (value, index) => {
    const level = parseLevel(value);
    const new_characters = [
      ...characters.slice(0, index),
      { ...characters[index], level },
      ...characters.slice(index + 1),
    ];
    changeCharacters(new_characters);
  };

  const removeCharacter = (index) => {
    changeCharacters([...characters.slice(0, index), ...characters.slice(index + 1)]);
  };

  const changeFightPartySize = (party_size, index) => {
    if (!isValidPartySize(party_size)) return;
    const new_fight = { ...fights[index], party_size: Number(party_size) };
    changeFight(new_fight, index);
  };

  if (results.length <= 0) return null;

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Table striped>
        <TableHeader>
          <TableRow>
            {/* Export cell — not draggable */}
            <TableHeaderCell>
              <ExportModal
                data={export_data}
                local_storage_prefix={'exp'}
                trigger={<Button primary>Export</Button>}
              />
            </TableHeaderCell>

            {characters.map((character, index) => (
              <HeaderCell
                key={index}
                character={character}
                index={index}
                changeCharacterLevel={changeCharacterLevel}
                removeCharacter={removeCharacter}
                isDragOver={dragOverCol === index}
                onDragStart={() => onColDragStart(index)}
                onDragOver={(e) => onColDragOver(e, index)}
                onDrop={() => onColDrop(index)}
                onDragEnd={onColDragEnd}
              />
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((result, index) => (
            <TableRow
              key={index}
              style={{
                opacity: dragRowIndex.current === index ? 0.4 : 1,
                outline: dragOverRow === index ? '1px dashed #2185d0' : undefined,
                cursor: 'grab',
              }}
            >
              <TableCell
                key={`${result.enemy_group.name}-${index}`}
                draggable
                onDragStart={() => onRowDragStart(index)}
                onDragOver={(e) => onRowDragOver(e, index)}
                onDrop={() => onRowDrop(index)}
                onDragEnd={onRowDragEnd}
              >
                <div>{result.enemy_group.name}</div>
                <div className="cell_controls">
                  {/* Stop drag from firing when interacting with controls */}
                  <DraftNumberInput
                    size={2}
                    min={MIN_PARTY_SIZE}
                    max={MAX_PARTY_SIZE}
                    step={1}
                    value={result.party_size}
                    accepts={isValidPartySize}
                    onCommit={(text) => changeFightPartySize(text, index)}
                    onDragStart={(e) => e.stopPropagation()}
                  />
                  <button
                    className={`toggle ${result.enabled ? 'fight_enabled' : 'fight_disabled'}`}
                    onClick={() => toggleFight(index)}
                  >
                    ●
                  </button>
                  <button className="remove" onClick={() => removeFight(index)}>
                    ⊖
                  </button>
                </div>
              </TableCell>

              {result.characters.map((character, charIdx) => (
                <RowCell
                  key={character.name}
                  character={character}
                  index={index}
                  enabled={result.enabled && !disabledCharacters[index].includes(character.name)}
                  toggleDisabledCharacter={toggleDisabledCharacter}
                  isDragOver={dragOverCol === charIdx}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

const RowCell = ({ character, index, enabled, toggleDisabledCharacter, isDragOver }) => {
  return (
    <TableCell
      className={`toggle ${enabled ? 'char_enabled' : 'char_disabled'}`}
      key={character.name}
      role="button"
      onClick={() => toggleDisabledCharacter(character.name, index)}
      style={{
        outline: isDragOver ? '1px dashed #2185d0' : undefined,
      }}
    >
      {parseFloat(character.level).toFixed(3)} <span className="indicator">●</span>
    </TableCell>
  );
};

const HeaderCell = ({
  character,
  index,
  changeCharacterLevel,
  removeCharacter,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  return (
    <TableHeaderCell
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        outline: isDragOver ? '1px dashed #2185d0' : undefined,
        cursor: 'grab',
      }}
    >
      <div className="character_name">{character.name}</div>
      <div className="cell_controls">
        <DraftNumberInput
          size={5}
          min={MIN_LEVEL}
          max={MAX_LEVEL}
          step={1}
          value={character.level}
          accepts={(text) => !Number.isNaN(parseFloat(text))}
          onCommit={(text) => changeCharacterLevel(text, index)}
          draggable={false}
        />
        <button className="remove" onClick={() => removeCharacter(index)}>
          ⊖
        </button>
      </div>
    </TableHeaderCell>
  );
};

export default withRouter(ExperienceContainer);
