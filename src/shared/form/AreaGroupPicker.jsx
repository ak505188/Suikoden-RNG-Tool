import React from 'react';
import { Form } from 'semantic-ui-react';
import { formationName } from 'suikoden-rng-lib/encounters';
import './AreaGroupPicker.css';
import { FIGHT_AREAS, areaFormations, areaId, findAreaById } from 'shared/lib/encounters';

const AREA_OPTIONS = FIGHT_AREAS.map((a) => ({ key: areaId(a), value: areaId(a), text: a.name }));

// The scripted fights follow the random encounters, set off from them by an amber tint and a line above the first
const groupOptions = (area) => {
  const formations = areaFormations(findAreaById(area));
  return formations.map(({ formation, scripted }, index) => ({
    key: index,
    value: index,
    text: formationName(formation),
    className: scripted
      ? `scripted${formations[index - 1]?.scripted ? '' : ' scripted-start'}`
      : undefined,
  }));
};

// An area dropdown and the dropdown of that area's enemy groups (index into `areaFormations`).
// Picking another area resets the group to the first one.
const AreaGroupPicker = ({ area, enemyGroup, onChange }) => (
  <>
    <Form.Dropdown
      label="Area"
      placeholder="Area"
      options={AREA_OPTIONS}
      value={area}
      onChange={(_e, data) => onChange({ area: data.value, enemyGroup: 0 })}
      search={true}
      selection={true}
    />
    <Form.Dropdown
      label="Enemy Group"
      placeholder="Enemy Group"
      options={groupOptions(area)}
      value={enemyGroup}
      onChange={(_e, data) => onChange({ area, enemyGroup: data.value })}
      search={true}
      selection={true}
    />
  </>
);

export default AreaGroupPicker;
