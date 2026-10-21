import { AREAS, formationEnemies } from 'suikoden-rng-lib/encounters';

/** Areas with a random-encounter table, in the lib's order (excludes e.g. 'Other'). */
export const ENCOUNTER_AREAS = Object.values(AREAS).filter((area) => area.encounters.length > 0);

/**
 * The id used for an area in URLs and dropdowns: its name without apostrophes and periods
 * ("Dragon's Den" -> "Dragons Den"). These match the keys of the old Areas export, so links
 * made before the migration keep working.
 */
export const areaId = (area) => area.name.replace(/['.]/g, '');

const areasById = new Map(ENCOUNTER_AREAS.map((area) => [areaId(area), area]));

/** The encounter area for an id from `areaId`, or undefined. */
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
