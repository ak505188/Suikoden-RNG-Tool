export function findRNG(area, encounters, rng, progress) {
  let status = {
    message: '',
    progress: 0,
    done: false,
  };
  const startTime = new Date().getTime();
  if (encounters.length <= 1) { return null; }
    // Smaller array size is slower but more space efficient. Performance drop should be negligable.
  const arraySize = 0xffff;
  const fights = new Array(arraySize);
  const fightsRNG = new Array(arraySize);
  for (let i = 0, index = 0; i < 0xffffffff; i++) {
    if (area.isBattle(rng)) {
      fights[index] = area.getEncounterIndex(rng);
      fightsRNG[index] = rng.getRNG();
      index++;
      if (index === arraySize - 1) {
        status.message = `Checking group of ${arraySize} fights`;
        progress ? progress(status) : console.log(status);
        const result = boyerMoore(fights, encounters, area.encounterTable.length);
        if (result !== null) {
          status.done = true;
          status.result = fightsRNG[result];
          status.message = `Runtime: ${(new Date().getTime() - startTime) / 1000} seconds.`;
          progress ? progress(status) : console.log(status);
          return fightsRNG[result];
        }

        // Takes end of fights and puts it in the beginning for next iteration
        // Number of fight taken is length of pattern.
        for (let j = arraySize - encounters.length, k = 0; j < encounters.length; j++, k++) {
          fights[k] = fights[j];
          fightsRNG[k] = fights[j];
        }
        index = encounters.length;
        status.message = 'Generating fights to search';
        progress ? progress(status) : console.log(status);
      }
    }
    rng.next();
    if (i % 42949672 === 0) {
      status.message = 'Generating fights to search';
      status.progress = i / 42949672;
      progress ? progress(status) : console.log(status);
    }
  }
  return null;
}

export function boyerMoore(input, pattern, max) {
  const maxOffset = pattern.length - 1;
  // Create bad char array
  const badChar: Array<number> = new Array(max).fill(-1);
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

export function fr(fights, encounters, encounterTableLength) {
  return boyerMoore(fights, encounters, encounterTableLength);
}
