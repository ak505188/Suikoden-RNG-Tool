import { RNG, generateEncounters } from 'suikoden-rng-lib/encounters';
import { findAreaById } from 'shared/lib/encounters';
import { groupsOf } from './groups';

// The Run Assistant's state from the result page's URL query: for each chosen area, its enemy
// groups and the fights from the starting RNG on.
export function buildRunAssistantState(search) {
  const params = new URLSearchParams(search);
  const rng = parseInt(params.get('rng'));
  const iterations = parseInt(params.get('iterations'));
  const partyLevel = parseInt(params.get('partylevel')) || 0;
  const realistic = params.get('realistic') !== 'false';
  const areas = params.get('areas').split(',').map(findAreaById);
  const groups = areas.map(groupsOf);

  const fightsList = areas.map((area, i) =>
    generateEncounters(new RNG(rng), area, { iterations, partyLevel, realistic }).map((fight) => ({
      ...fight,
      enemyGroup: groups[i][fight.encounterIndex],
    })),
  );
  const index = params.get('index') !== null ? parseInt(params.get('index')) : 0;

  return {
    currentArea: 0,
    areas: areas.map((area, i) => ({ name: area.name, enemies: groups[i] })),
    fightsList,
    index: index < fightsList[0].length ? index : 0,
    pattern: [],
    patternMode: false,
  };
}
