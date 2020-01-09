import Area from './Area';
import RNG from './rng';

export function findRNG(area, encounters, rngSeed, progress) {
  let status = new Status(progress);
  const startTime = new Date().getTime();
  if (encounters.length <= 1) { return null; }

  // Smaller array size is slower but more space efficient. Performance drop should be negligable.
  const ARRAY_SIZE = 0xffff;
  const generatedEncounters = new Array(ARRAY_SIZE);
  const rng = new RNG(rngSeed);

  for (let i = 0, index = 0; i < 0xffffffff; i++) {
    if (Area.isBattle(rng, area.encounterRate, area.areaType)) {
      const encounterID = Area.getEncounterIndex(rng, area.tableLength);
      const encounterRNGSeed = rng.getRNG();
      generatedEncounters[index] = { id: encounterID, rngSeed: encounterRNGSeed };
      // Uncomment for realistic mode
      // rng.next()
      index++;
      if (index === ARRAY_SIZE - 1) {
        status.update({ message: `Checking group of ${ARRAY_SIZE} fights` }).log();
        const boyerMooreInput = generatedEncounters.map(encounter => encounter.id);
        const result = boyerMoore(boyerMooreInput, encounters, area.tableLength);
        if (result !== null) {
          status.update({
            done: true,
            message: `Runtime: ${(new Date().getTime() - startTime) / 1000} seconds.`,
            foundEncounterRNG: generatedEncounters[result].rngSeed,
            foundEncounterRNGPrevious: generatedEncounters[(result - 1) % ARRAY_SIZE].rngSeed
          }).log();
          return generatedEncounters[result].rngSeed;
        }

        // Takes end of fights and puts it in the beginning for next iteration
        // Number of fight taken is length of pattern.
        for (let j = ARRAY_SIZE - encounters.length, k = 0; j < encounters.length; j++, k++) {
          generatedEncounters[k] = generatedEncounters[j];
        }
        index = encounters.length;
        status.update({ message: status.message = 'Generating fights to search' }).log();
      }
    }
    rng.next();
    if (i % 42949672 === 0) {
      status.update({ message: 'Generating fights to search', progress: i / 42949672 }).log();
    }
  }
  status.update({ progress: 100, message: 'No match found.', done: true }).log();
  return null;
}

export function boyerMoore(input, pattern, max) {
  const maxOffset = pattern.length - 1;
  // Create bad char array
  const badChar = new Array(max).fill(-1);
  for (let j = 0; j < pattern.length - 1; j++) {
    badChar[pattern[j]] = maxOffset - j;
  }

  let i = maxOffset;
  while (i < input.length) {
    // check if match
    let inputIndex = i;
    let patternIndex = maxOffset;
    while (input[inputIndex] === pattern[patternIndex]) {
      inputIndex--;
      patternIndex--;
      if (patternIndex === -1) {
        return i - pattern.length + 1;
      }
    }
    const badCharVal = badChar[input[inputIndex]];
    const jump = badCharVal === -1 ? maxOffset : badCharVal;
    i += jump;
  }
  return null;
}

class Status {
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

export function fr(fights, encounters, encounterTableLength) {
  return boyerMoore(fights, encounters, encounterTableLength);
}
