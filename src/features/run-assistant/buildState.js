import { RNG, generateEncounters } from 'suikoden-rng-lib/encounters';
import { findAreaById } from 'shared/lib/encounters';
import { bool, int, list, parseParams } from 'shared/lib/params';
import { groupsOf } from './groups';

const SCHEMA = {
  rng: int(),
  iterations: int(),
  partylevel: int({ default: 0 }),
  realistic: bool({ default: true }),
  areas: list(),
  index: int({ default: 0 }),
};

// The Run Assistant's state from the result page's URL query: for each chosen area, its enemy
// groups and the fights from the starting RNG on. Returns { state, problems }: problems lists what
// is wrong with the link, and state is null when there are any.
export function buildRunAssistantState(search) {
  const { params, problems: parseProblems } = parseParams(search, SCHEMA);
  const problems = [...parseProblems];
  const areas = (params.areas ?? []).map(findAreaById);
  const unknown = (params.areas ?? []).filter((_id, i) => !areas[i]);
  if (unknown.length > 0) problems.push(`unknown area: ${unknown.join(', ')}`);
  if (problems.length > 0) return { state: null, problems };

  const { rng, iterations, partylevel: partyLevel, realistic, index } = params;
  const groups = areas.map(groupsOf);

  const fightsList = areas.map((area, i) =>
    generateEncounters(new RNG(rng), area, { iterations, partyLevel, realistic }).map((fight) => ({
      ...fight,
      enemyGroup: groups[i][fight.encounterIndex],
    })),
  );

  return {
    problems: [],
    state: {
      currentArea: 0,
      areas: areas.map((area, i) => ({ name: area.name, enemies: groups[i] })),
      fightsList,
      index: index < fightsList[0].length ? index : 0,
      pattern: [],
      patternMode: false,
    },
  };
}
