import { describe, expect, test } from 'vitest';
import {
  ENCOUNTER_AREAS,
  FIGHT_AREAS,
  areaFormations,
  areaId,
  findAreaById,
  formationName,
} from './encounters';
import { itemName } from './items';

describe('encounter areas', () => {
  test('only areas with random encounters are listed', () => {
    expect(ENCOUNTER_AREAS.length).toBeGreaterThan(0);
    expect(ENCOUNTER_AREAS.every((area) => area.encounters.length > 0)).toBe(true);
  });

  test('every area is found by its id', () => {
    for (const area of ENCOUNTER_AREAS) expect(findAreaById(areaId(area))).toBe(area);
  });

  test('ids match the old Areas keys, so old links keep working', () => {
    for (const id of ['Dragons Den', 'Mt Seifu', 'Neclords Castle', 'Lepants Mansion']) {
      expect(findAreaById(id)).toBeDefined();
    }
    expect(findAreaById("Dragon's Den")).toBeUndefined();
  });
});

describe('formationName', () => {
  test('counts each enemy in order of first appearance', () => {
    expect(formationName(['BANSHEE', null, 'BANSHEE', null, 'CLAY_DOLL'])).toBe(
      '2 Banshee 1 Clay Doll',
    );
    expect(formationName([null, 'BANSHEE'])).toBe('1 Banshee');
  });
});

describe('areaFormations', () => {
  test('lists random encounters first, then scripted fights', () => {
    const area = FIGHT_AREAS.find((a) => a.scripted?.length > 0 && a.encounters.length > 0);
    const formations = areaFormations(area);
    expect(formations).toHaveLength(area.encounters.length + area.scripted.length);
    expect(formations.slice(0, area.encounters.length).every((f) => !f.scripted)).toBe(true);
    expect(formations.slice(area.encounters.length).every((f) => f.scripted)).toBe(true);
  });

  test('areas without scripted fights list just their encounters', () => {
    const area = findAreaById('Cave of the Past');
    expect(areaFormations(area)).toHaveLength(area.encounters.length);
  });
});

describe('itemName', () => {
  test('adds the quantity of stacks only', () => {
    expect(itemName({ name: 'Mega medicine', quantity: 3 })).toBe('Mega medicine x3');
    expect(itemName({ name: 'Graffiti' })).toBe('Graffiti');
    expect(itemName({ name: 'Needle', quantity: 1 })).toBe('Needle');
  });

  test('no item is an empty string', () => {
    expect(itemName(null)).toBe('');
  });
});
