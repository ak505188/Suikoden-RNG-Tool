import React, { useRef, useState } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from 'semantic-ui-react';
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
  removeCharacter,
  toggleFight,
  toggleDisabledCharacter,
  highlightLevelUps,
}) => {
  const results = calculateLevels(characters, fights, disabledCharacters);
  const enabledFights = fights.filter((fight) => fight.enabled).length;

  // --- Drag state ---
  const dragColIndex = useRef(null);
  const dragRowIndex = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);
  const [draggingRow, setDraggingRow] = useState(null);

  // --- Column (character) drag handlers ---
  const onColDragStart = (index) => {
    dragColIndex.current = index;
  };

  const onColDragOver = (e, index) => {
    if (dragColIndex.current === null) return;
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
    // Dim the row after the drag has started, or the drag image would be dimmed too
    setTimeout(() => setDraggingRow(index), 0);
  };

  const onRowDragOver = (e, index) => {
    if (dragRowIndex.current === null) return;
    e.preventDefault();
    setDragOverRow(index);
  };

  const onRowDrop = (toIndex) => {
    const fromIndex = dragRowIndex.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragRowIndex.current = null;
      setDragOverRow(null);
      setDraggingRow(null);
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
    setDraggingRow(null);
  };

  const onRowDragEnd = () => {
    dragRowIndex.current = null;
    setDragOverRow(null);
    setDraggingRow(null);
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

  const changeFightPartySize = (party_size, index) => {
    if (!isValidPartySize(party_size)) return;
    const new_fight = { ...fights[index], party_size: Number(party_size) };
    changeFight(new_fight, index);
  };

  if (results.length <= 0) return null;

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Table striped className="experience-table">
        <TableHeader>
          <TableRow>
            {/* Summary cell */}
            <TableHeaderCell className="summary-cell">
              <div>
                {fights.length} {fights.length === 1 ? 'fight' : 'fights'}
              </div>
              <div>{enabledFights} enabled</div>
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
              onDragOver={(e) => onRowDragOver(e, index)}
              onDrop={() => onRowDrop(index)}
              style={{
                opacity: draggingRow === index ? 0.4 : 1,
                outline: dragOverRow === index ? '1px dashed #2185d0' : undefined,
              }}
            >
              <TableCell key={`${result.enemy_group.name}-${index}`}>
                <DragHandle
                  orientation="row"
                  label={`Drag to reorder ${result.enemy_group.name}`}
                  onDragStart={() => onRowDragStart(index)}
                  onDragEnd={onRowDragEnd}
                />
                <div>{result.enemy_group.name}</div>
                <div className="cell_controls">
                  <DraftNumberInput
                    size={2}
                    min={MIN_PARTY_SIZE}
                    max={MAX_PARTY_SIZE}
                    step={1}
                    value={result.party_size}
                    aria-label={`Party size for ${result.enemy_group.name}`}
                    accepts={isValidPartySize}
                    onCommit={(text) => changeFightPartySize(text, index)}
                  />
                  <button
                    className={`toggle ${result.enabled ? 'fight_enabled' : 'fight_disabled'}`}
                    title={`${result.enabled ? 'Disable' : 'Enable'} this fight`}
                    aria-label={`${result.enabled ? 'Disable' : 'Enable'} ${result.enemy_group.name}`}
                    onClick={() => toggleFight(index)}
                  >
                    ●
                  </button>
                  <button
                    className="remove"
                    title="Remove this fight"
                    aria-label={`Remove ${result.enemy_group.name}`}
                    onClick={() => removeFight(index)}
                  >
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
                  levelUp={highlightLevelUps && character.levelsGained > 0}
                  isDragOver={dragOverCol === charIdx}
                  onDragOver={(e) => onColDragOver(e, charIdx)}
                  onDrop={() => onColDrop(charIdx)}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

// The strip a row or column is dragged by: the full height of a row's first cell, or the full
// width of a column's header cell (styled in Experience.css). The drag image is the whole
// row/column header, not just the strip.
const DragHandle = ({ orientation, label, onDragStart, onDragEnd }) => (
  <span
    className={`drag-handle drag-handle-${orientation}`}
    draggable
    title={label}
    aria-label={label}
    onDragStart={(e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ''); // Firefox won't start a drag without data
      const dragImage = e.currentTarget.closest(orientation === 'row' ? 'tr' : 'th');
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      onDragStart();
    }}
    onDragEnd={onDragEnd}
  />
);

// Hover text for a level cell: the level-up, if this fight causes one, then what a click does.
const cellTitle = (character, enabled, levelUp) => {
  const toggle = `${enabled ? 'Disable' : 'Enable'} ${character.name} for this fight`;
  if (!levelUp) return toggle;
  const level = Math.floor(character.level);
  return `Level ${level - character.levelsGained} → ${level} · ${toggle}`;
};

const RowCell = ({
  character,
  index,
  levelUp,
  enabled,
  toggleDisabledCharacter,
  isDragOver,
  onDragOver,
  onDrop,
}) => {
  return (
    <TableCell
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`toggle ${enabled ? 'char_enabled' : 'char_disabled'}${
        levelUp ? ' level_up' : ''
      }`}
      key={character.name}
      role="button"
      aria-pressed={enabled}
      title={cellTitle(character, enabled, levelUp)}
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
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        outline: isDragOver ? '1px dashed #2185d0' : undefined,
      }}
    >
      <DragHandle
        orientation="column"
        label={`Drag to reorder ${character.name}`}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
      <div className="character_name">{character.name}</div>
      <div className="cell_controls">
        <DraftNumberInput
          size={5}
          min={MIN_LEVEL}
          max={MAX_LEVEL}
          step={1}
          value={character.level}
          aria-label={`${character.name} level`}
          accepts={(text) => !Number.isNaN(parseFloat(text))}
          onCommit={(text) => changeCharacterLevel(text, index)}
        />
        <button
          className="remove"
          title={`Remove ${character.name}`}
          aria-label={`Remove ${character.name}`}
          onClick={() => removeCharacter(index)}
        >
          ⊖
        </button>
      </div>
    </TableHeaderCell>
  );
};

export default ExperienceContainer;
