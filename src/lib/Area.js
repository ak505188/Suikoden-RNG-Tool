import EnemyGroup from './EnemyGroup';
import Fight from './Fight';
import { div32ulo } from './lib';

export default class AreaClass {
  constructor(name, area) {
    this.name           = name;
    this.areaType       = area.areaType;
    this.encounterRate  = area.encounterRate;
    this.enemies        = area.enemies;
    // Encounter table has to be initialized after enemies
    this.encounterTable = this.parseEncounterTable(area.encounters);
  }

  getEncounter(rng) {
    const enemyGroup = this.encounterTable[this.getEncounterIndex(rng)];
    return Fight(this.name, enemyGroup, rng);
  }

  isBattle(rng) {
    return isBattle(rng, this.encounterRate, this.areaType);
  }

  static isBattle(rng, encounterRate, areaType) {
    return isBattle(rng, encounterRate, areaType);
  }

  getEnemyGroup(name) {
    for (const enemyGroup of this.encounterTable) {
      if (enemyGroup.name === name) {
        return enemyGroup;
      }
    }
    return null;
  }

  getEncounterIndex(rng) {
    return getEncounterIndex(rng, this.encounterTable.length);
  }

  static getEncounterIndex(rng, encounterTableLength) {
    return getEncounterIndex(rng, encounterTableLength);
  }

  // Realistic advances RNG whenever getEncounter is called.
  // Sometimes, you get battles at 2 RNG values next to each other
  // ex: You get a battle at index 1444 and index 1445
  // What 99.999% of the time is that you hit the index at 1444 and skip the battle at 1445
  // With realistic false it will show both battles.
  // With realistic on it will show only 1444
  // Realistic is recommended for RunAssistant and RNG finder
  // Also, keep realistic off with partylevel > 0
  generateEncounters(rng, iterations, partylevel, realistic = false) {
    const encounters = [];
    for (let i = 0; i < iterations; i++) {
      if (this.isBattle(rng)) {
        const fight = this.getEncounter(rng);
        if (!(partylevel > 0 && partylevel > fight.enemyGroup.champVal)) {
          encounters.push(fight);
        }
        if (realistic) {
          rng.next();
          i++;
        }
      }
      rng.next();
    }
    return encounters;
  }

  parseEncounterTable(encounters) {
    const encounterTable = [];
    for (let i = 0; i < encounters.length; i++) {
      const name = encounters[i].name;
      const enemies = this.parseEncounter(encounters[i].parseString, this.enemies);
      const enemyGroup = new EnemyGroup(name, enemies);
      encounterTable.push(enemyGroup);
    }
    return encounterTable;
  }

  parseEncounter(parseString, enemies) {
    const encounter = parseString.split(' ');
    const enemyGroup = [];
    for (let j = 0; j < encounter.length; j = j + 2) {
      const name = encounter[j + 1];
      for (let k = 0; k < parseInt(encounter[j], 10); k++) {
        const enemy = enemies[encounter[j + 1]];
        enemy.name = name;
        enemy.img = require(`../assets/${name}.png`);
        enemyGroup.push(enemies[encounter[j + 1]]);
      }
    }
    return enemyGroup;
  }

}

function isBattleWorldMap(rng, encounterRate) {
  let r2 = rng.getRNG2();
  const r3 = r2;
  r2 = (r2 >> 8) << 8;
  r2 = r3 - r2;
  return r2 < encounterRate;
}

function isBattleDungeon(rng, encounterRate) {
  let r2 = rng.getRNG2();
  const r3 = 0x7F;
  const mflo = div32ulo(r2, r3);
  r2 = mflo;
  r2 = r2 & 0xFF;
  return r2 < encounterRate;
}

function isBattle(rng, encounterRate, areaType) {
    return areaType === 'Dungeon'
      ? isBattleDungeon(rng, encounterRate) : isBattleWorldMap(rng, encounterRate);
}

function getEncounterIndex(rng, encounterTableLength) {
  const r2 = rng.getNext().rng2;
  const r3 = div32ulo(0x7FFF, encounterTableLength);
  let encounterIndex = div32ulo(r2, r3);
  while (encounterIndex >= encounterTableLength) {
    encounterIndex--;
  }
  return encounterIndex;
}
