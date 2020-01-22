import Area from '../Area';
import RNG from '../rng';
import Status from './Status';
import Encounters from './Encounters';
import { encounterSequenceToString } from '../lib';

export function findRNG(area, encounters, rngSeed, progress) {
  if (encounters.length <= 1) {
    return null;
  }

  let status = new Status(progress);
  const startTime = new Date().getTime();

  const generatedEncounters = new Encounters();
  const encountersPattern = new RegExp(encounterSequenceToString(encounters));
  const rng = new RNG(rngSeed);

  for (let i = 0; i < 0xffffffff; i++) {
    if (Area.isBattle(rng, area.encounterRate, area.areaType)) {
      const encounterID = Area.getEncounterIndex(rng, area.tableLength);
      const encounterRNGSeed = rng.getRNG();
      generatedEncounters.push(encounterID, encounterRNGSeed);
      // Uncomment for realistic mode
      // rng.next()
      if (generatedEncounters.isFull()) {
        status.update({ message: `Checking group of ${generatedEncounters.size} fights` }).log();
        const searchMatchIndex = generatedEncounters.search(encountersPattern);

        if (searchMatchIndex >= 0) {
          status.update({
            done: true,
            message: `Runtime: ${(new Date().getTime() - startTime) / 1000} seconds.`,
            foundEncounterRNG: generatedEncounters.get(searchMatchIndex).rngSeed,
            foundEncounterRNGPrevious: generatedEncounters.get(searchMatchIndex - 1).rngSeed
          }).log();
          return generatedEncounters.get(searchMatchIndex).rngSeed;
        }

        generatedEncounters.rotateEndToStart(encounters.length);
        status.update({ message: 'Generating fights to search' }).log();
      }
    }

    if (i % 42949672 === 0) {
      status.update({ progress: i / 42949672 }).log();
    }

    rng.next();
  }

  status.update({ progress: 100, message: 'No match found.', done: true }).log();
  return null;
}
