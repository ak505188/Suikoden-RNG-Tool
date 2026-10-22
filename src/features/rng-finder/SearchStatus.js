export default class Status {
  constructor(progressCallback) {
    this.done = false;
    this.progress = 0;
    this.matches = []; // { foundEncounterRNG, firstPossibleRNG, gap }
    this.limitReached = false; // stopped because maxMatches was hit
    this.progressCallback = progressCallback || console.log;
  }

  update(status) {
    this.done = status.done || this.done;
    this.progress = status.progress || this.progress;
    this.matches = status.matches ?? this.matches;
    this.limitReached = status.limitReached || this.limitReached;
    return this;
  }

  export() {
    const { done, progress, limitReached } = this;
    // A copy, so what has been sent isn't changed by matches found afterwards
    return { done, progress, limitReached, matches: [...this.matches] };
  }

  log() {
    this.progressCallback(this.export());
  }
}
