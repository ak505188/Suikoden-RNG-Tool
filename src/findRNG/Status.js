export default class Status {
  constructor(progressCallback) {
    this.done = false;
    this.progress = 0;
    this.message = '';
    this.foundEncounterRNG = null;
    this.foundEncounterRNGPrevious = null;
    this.progressCallback = progressCallback || console.log;
  }

  update(status) {
    this.done = status.done || this.done;
    this.progress = status.progress || this.progress;
    this.message = status.message || this.message;
    this.foundEncounterRNG = status.foundEncounterRNG || this.foundEncounterRNG;
    this.foundEncounterRNGPrevious = status.foundEncounterRNGPrevious || this.foundEncounterRNGPrevious;
    return this;
  }

  export() {
    const { done, progress, message } = this;
    const result = this.foundEncounterRNG ?
      {
        foundEncounterRNG: this.foundEncounterRNG,
        foundEncounterRNGPrevious: this.foundEncounterRNGPrevious
      } :
      null;
    return { done, progress, message, result };
  }

  log() {
    this.progressCallback(this.export());
  }
}

