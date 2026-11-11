import React, { useReducer, useState } from 'react';
import { Button, Checkbox, Container, Form } from 'semantic-ui-react';
import { Characters } from 'suikoden-rng-lib';
import { formationName } from 'suikoden-rng-lib/encounters';
import { areaFormations, findAreaById, formationLevels } from 'shared/lib/encounters';
import AreaGroupPicker from 'shared/form/AreaGroupPicker';
import ExportModal from 'shared/table/export-modal';
import ImportModal from 'shared/ui/ImportModal';

import ExperienceResult from './ExperienceResult';
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE, isValidPartySize, normalizeImport } from './lib';
import { emptyPlan, planActions, planData, planReducer } from './plan';
import './Experience.css';

const ExperienceForm = () => {
  const [plan, dispatch] = useReducer(planReducer, emptyPlan);
  const { characters, fights, disabledCharacters, undoStack } = plan;
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [area, setArea] = useState('Cave of the Past');
  const [enemyGroup, setEnemyGroup] = useState(0);
  const [partySize, setPartySize] = useState(6);
  const [highlightLevelUps, setHighlightLevelUps] = useState(false);

  // Nothing to undo on a fresh page, but if the last character was just removed the table is empty
  // and Undo is the way back, so it stays while there is anything to undo.
  const showUndo = characters.length > 0 || undoStack.length > 0;

  const partySizeValid = isValidPartySize(partySize);
  const selected_character_names = characters.map((character) => character.name);

  // Checks the file first, so one that isn't a plan changes nothing (ImportModal shows the error)
  const importData = (imported) => dispatch(planActions.importPlan(normalizeImport(imported)));

  const addCharacters = () => {
    dispatch(planActions.addCharacters(selectedCharacters));
    setSelectedCharacters([]);
  };

  const addFight = () => {
    if (!partySizeValid) return;
    const { formation } = areaFormations(findAreaById(area))[enemyGroup];
    dispatch(
      planActions.addFight({
        enemy_group: {
          name: formationName(formation),
          levels: formationLevels(formation),
        },
        party_size: Number(partySize),
        enabled: true,
      }),
    );
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
        <AreaGroupPicker
          area={area}
          enemyGroup={enemyGroup}
          onChange={(picked) => {
            setArea(picked.area);
            setEnemyGroup(picked.enemyGroup);
          }}
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
          {(characters.length > 0 || showUndo) && (
            <Form.Field className="experience-end">
              {characters.length > 0 && (
                <Checkbox
                  toggle
                  label="Highlight level-ups"
                  title="Highlight the cells where a character reaches a new whole level"
                  checked={highlightLevelUps}
                  onChange={(_e, data) => setHighlightLevelUps(data.checked)}
                />
              )}
              {characters.length > 0 && (
                <ExportModal
                  data={planData(plan)}
                  local_storage_prefix="exp"
                  trigger={<Button primary>Export</Button>}
                />
              )}
              {showUndo && (
                <Button
                  type="button"
                  content="Undo"
                  title={
                    undoStack.length > 0 ? `Undo: ${undoStack[undoStack.length - 1].label}` : ''
                  }
                  disabled={undoStack.length === 0}
                  onClick={() => dispatch(planActions.undo())}
                />
              )}
            </Form.Field>
          )}
        </Form.Group>
      </Form>
      {characters.length > 0 && (
        <ExperienceResult
          characters={characters}
          fights={fights}
          disabledCharacters={disabledCharacters}
          highlightLevelUps={highlightLevelUps}
          dispatch={dispatch}
        />
      )}
    </Container>
  );
};

export default ExperienceForm;
