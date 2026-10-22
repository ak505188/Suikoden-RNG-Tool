export default class Status {
  constructor(progressCallback, { findAll = false } = {}) {
    this.done = false;
    this.progress = 0;
    this.message = '';
    this.matches = []; // { foundEncounterRNG, firstPossibleRNG, gap }
    this.findAll = findAll;
    this.progressCallback = progressCallback || console.log;
  }

  update(status) {
    this.done = status.done || this.done;
    this.progress = status.progress || this.progress;
    this.message = status.message || this.message;
    this.matches = status.matches ?? this.matches;
    return this;
  }

  export() {
    const { done, progress, message, findAll } = this;
    // A copy, so what has been sent isn't changed by matches found afterwards
    const matches = [...this.matches];
    return { done, progress, message, findAll, matches, result: matches[0] ?? null };
  }

  log() {
    this.progressCallback(this.export());
  }
}
