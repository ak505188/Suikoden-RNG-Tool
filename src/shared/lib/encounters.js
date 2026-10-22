import { AREAS, formationEnemies } from 'suikoden-rng-lib/encounters';

/** Areas with a random-encounter table, in the lib's order (excludes e.g. 'Other'). */
export const ENCOUNTER_AREAS = Object.values(AREAS).filter((area) => area.encounters.length > 0);

/** Areas with any fight to pick */
export const FIGHT_AREAS = Object.values(AREAS).filter(
  (area) => area.encounters.length > 0 || area.scripted?.length > 0,
);

/**
 * The id used for an area in URLs and dropdowns: its name without apostrophes and periods
 * ("Dragon's Den" -> "Dragons Den"). These match the keys of the old Areas export, so links
 * made before the migration keep working.
 */
export const areaId = (area) => area.name.replace(/['.]/g, '');

const areasById = new Map(FIGHT_AREAS.map((area) => [areaId(area), area]));

/** The area for an id from `areaId`, or undefined. */
export const findAreaById = (id) => areasById.get(id);

/**
 * A formation's display name: each distinct enemy with its count, in order of first appearance
 * ("2 Banshee 1 Clay Doll").
 * @param {import('suikoden-rng-lib/encounters').Formation} formation
 */
export function formationName(formation) {
  const counts = new Map();
  for (const { name } of formationEnemies(formation)) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => `${count} ${name}`).join(' ');
}

/**
 * The level of each enemy in a formation, in slot order.
 * @param {import('suikoden-rng-lib/encounters').Formation} formation
 */
export const formationLevels = (formation) => formationEnemies(formation).map((enemy) => enemy.LVL);

/**
 * Every fight formation in an area: the random encounters in table order, then the scripted ones.
 * A formation's position here is what URLs and dropdowns use as its group index.
 * @param {import('suikoden-rng-lib/encounters').AreaData} area
 * @returns {{ formation: import('suikoden-rng-lib/encounters').Formation, scripted: boolean }[]}
 */
export const areaFormations = (area) => [
  ...area.encounters.map((formation) => ({ formation, scripted: false })),
  ...(area.scripted ?? []).map((formation) => ({ formation, scripted: true })),
];
