import { championValue, formationEnemies, formationName } from 'suikoden-rng-lib/encounters';
import { ENEMY_IMAGES } from 'suikoden-rng-lib/enemy-images';

// What the Run Assistant works with for an enemy group: { name, enemies: [{ name, img }], champVal }.
// It finds groups by name, as it always has. Two groups with the same name are the same
// composition (a few areas list one twice, which makes it more likely), so they act as one.
export const groupOf = (formation) => {
  const keys = formation.filter((key) => key !== null);
  return {
    name: formationName(formation),
    enemies: formationEnemies(formation).map((enemy, i) => ({
      name: enemy.name,
      img: ENEMY_IMAGES[keys[i]],
    })),
    champVal: championValue(formation),
  };
};

// The groups of an area's random encounters, in table order
export const groupsOf = (area) => area.encounters.map(groupOf);
