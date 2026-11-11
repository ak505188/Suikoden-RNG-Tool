import React from 'react';
import {
  Container,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
} from 'semantic-ui-react';
import DraftNumberInput from 'shared/form/DraftNumberInput';
import {
  MAX_LEVEL,
  MAX_PARTY_SIZE,
  MIN_LEVEL,
  MIN_PARTY_SIZE,
  calculateLevels,
  isValidPartySize,
  parseLevel,
} from './lib';
import { planActions } from './plan';
import { useReorder } from './useReorder';

const ExperienceContainer = ({
  characters,
  fights,
  disabledCharacters,
  highlightLevelUps,
  dispatch,
}) => {
  const results = calculateLevels(characters, fights, disabledCharacters);
  const enabledFights = fights.filter((fight) => fight.enabled).length;

  // Characters are the columns, fights the rows; each can be dragged to a new place
  const columnDrag = useReorder((from, to) => dispatch(planActions.moveCharacter(from, to)));
  const rowDrag = useReorder((from, to) => dispatch(planActions.moveFight(from, to)));

  const changeFightPartySize = (party_size, index) => {
    if (!isValidPartySize(party_size)) return;
    dispatch(planActions.changeFight(index, { ...fights[index], party_size: Number(party_size) }));
  };

  if (results.length <= 0) return null;

  return (
    <Container className="page-fill" textAlign="center">
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
                changeCharacterLevel={(value) =>
                  dispatch(planActions.setCharacterLevel(index, parseLevel(value)))
                }
                removeCharacter={() => dispatch(planActions.removeCharacter(index))}
                isDragOver={columnDrag.overIndex === index}
                onDragStart={() => columnDrag.start(index)}
                onDragOver={(e) => columnDrag.over(e, index)}
                onDrop={() => columnDrag.drop(index)}
                onDragEnd={columnDrag.end}
              />
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((result, index) => (
            <TableRow
              key={index}
              onDragOver={(e) => rowDrag.over(e, index)}
              onDrop={() => rowDrag.drop(index)}
              className={`${rowDrag.dragging === index ? 'dragging' : ''} ${
                rowDrag.overIndex === index ? 'drag-over' : ''
              }`}
            >
              <TableCell key={`${result.enemy_group.name}-${index}`}>
                <DragHandle
                  orientation="row"
                  label={`Drag to reorder ${result.enemy_group.name}`}
                  onDragStart={() => rowDrag.start(index)}
                  onDragEnd={rowDrag.end}
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
                    onClick={() => dispatch(planActions.toggleFight(index))}
                  >
                    ●
                  </button>
                  <button
                    className="remove"
                    title="Remove this fight"
                    aria-label={`Remove ${result.enemy_group.name}`}
                    onClick={() => dispatch(planActions.removeFight(index))}
                  >
                    ⊖
                  </button>
                </div>
              </TableCell>

              {result.characters.map((character, charIdx) => (
                <RowCell
                  key={character.name}
                  character={character}
                  enabled={result.enabled && !disabledCharacters[index].includes(character.name)}
                  toggleDisabledCharacter={(name) =>
                    dispatch(planActions.toggleDisabledCharacter(name, index))
                  }
                  levelUp={highlightLevelUps && character.levelsGained > 0}
                  isDragOver={columnDrag.overIndex === charIdx}
                  onDragOver={(e) => columnDrag.over(e, charIdx)}
                  onDrop={() => columnDrag.drop(charIdx)}
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
      }${isDragOver ? ' drag-over' : ''}`}
      key={character.name}
      role="button"
      aria-pressed={enabled}
      title={cellTitle(character, enabled, levelUp)}
      onClick={() => toggleDisabledCharacter(character.name)}
    >
      {parseFloat(character.level).toFixed(3)} <span className="indicator">●</span>
    </TableCell>
  );
};

const HeaderCell = ({
  character,
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
      className={isDragOver ? 'drag-over' : undefined}
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
          onCommit={changeCharacterLevel}
        />
        <button
          className="remove"
          title={`Remove ${character.name}`}
          aria-label={`Remove ${character.name}`}
          onClick={removeCharacter}
        >
          ⊖
        </button>
      </div>
    </TableHeaderCell>
  );
};

export default ExperienceContainer;
