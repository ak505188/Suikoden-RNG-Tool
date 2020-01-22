import Area, { isBattleDungeon } from './Area';

export default class Dungeon extends Area {
  constructor(name, enemies, encounterTable, encounterRate) {
    super(name, enemies, encounterTable, encounterRate, 'Dungeon');
  }

  isBattle(rng) {
    return isBattleDungeon(rng, this.encounterRate);
  }
}
