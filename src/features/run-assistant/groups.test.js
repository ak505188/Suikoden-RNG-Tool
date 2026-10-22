import { describe, expect, test } from 'vitest';
import { championValue } from 'suikoden-rng-lib/encounters';
import { ENEMY_IMAGES } from 'suikoden-rng-lib/enemy-images';
import { ENCOUNTER_AREAS } from 'shared/lib/encounters';
import { groupOf, groupsOf } from './groups';

const area = (name) => ENCOUNTER_AREAS.find((a) => a.name === name);

describe('groupOf', () => {
  test('is the name, the enemies in slot order, and the champion value', () => {
    const group = groupOf(['BANSHEE', null, 'BANSHEE', null, 'CLAY_DOLL']);
    expect(group.name).toBe('2 Banshee 1 Clay Doll');
    expect(group.enemies.map((enemy) => enemy.name)).toEqual(['Banshee', 'Banshee', 'Clay Doll']);
    expect(group.champVal).toBe(championValue(['BANSHEE', null, 'BANSHEE', null, 'CLAY_DOLL']));
  });

  test('each enemy has its picture, a data URL ready to use as an <img> src', () => {
    const [banshee, clayDoll] = groupOf(['BANSHEE', 'CLAY_DOLL']).enemies;
    expect(banshee.img).toBe(ENEMY_IMAGES.BANSHEE);
    expect(clayDoll.img).toBe(ENEMY_IMAGES.CLAY_DOLL);
    expect(banshee.img).not.toBe(clayDoll.img);
  });

  test('every enemy in every area has a picture', () => {
    for (const area of ENCOUNTER_AREAS) {
      for (const group of groupsOf(area)) {
        for (const enemy of group.enemies) {
          if (!enemy.img?.startsWith('data:image/png;base64,')) {
            throw new Error(`no picture for ${enemy.name} in ${area.name}`);
          }
        }
      }
    }
  });
});

describe('groupsOf', () => {
  test("has a group for each of the area's random encounters, in table order", () => {
    const cave = area('Cave of the Past');
    const groups = groupsOf(cave);
    expect(groups).toHaveLength(cave.encounters.length);
    groups.forEach((group, i) => expect(group).toEqual(groupOf(cave.encounters[i])));
  });

  test('a group an area lists twice has the same name both times', () => {
    const groups = groupsOf(area("Magician's Island"));
    const names = groups.map((group) => group.name);
    expect(names.filter((name) => name === '4 Holly Boy')).toHaveLength(2);
  });
});
