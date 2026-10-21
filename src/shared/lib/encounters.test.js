import { describe, expect, test } from 'vitest';
import { ENCOUNTER_AREAS, areaId, findAreaById, formationName } from './encounters';

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
