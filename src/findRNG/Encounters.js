import { Helpers } from 'suikoden-rng-lib';

export default class Encounters {
  constructor() {
    this.index = 0;
    this.size = 0xffff;
    this.encounters = [];
    this.full = false;
  }

  get(index) {
    return this.encounters[index % this.size];
  }

  isFull() {
    return this.full;
  }

  push(id, rngSeed) {
    this.encounters[this.index] = { id, rngSeed };
    this.index = ++this.index % this.size;
    if (this.index === 0) {
      this.full = true;
    }
  }

  rotateEndToStart(amount) {
    // Takes end of fights and puts it in the beginning for next iteration
    // Number of fight taken is length of pattern.
    for (let i = 0, j = this.size - amount; i < amount; i++, j++) {
      this.encounters[i] = this.encounters[j];
    }
    this.full = false;
  }

  toIdString() {
    return Helpers.encounterSequenceToString(this.encounters.map(encounter => encounter.id));
  }

  search(pattern) {
    return this.toIdString().search(pattern);
  }
}

