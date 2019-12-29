const worker = () => {
  function findRNG(area, encounters, rng_val, progress) {
    // area; { dungeon: boolean, encounterRate: number, tableLength: number }
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
    let rng = { rng: rng_val, rng2: (rng_val >> 16) & 0x7FFF };
    function isBattle(rng) {
      return area.dungeon ? isBattleDungeon(rng, area.encounterRate) : isBattleWorldMap(rng, area.encounterRate);
    }
    for (let i = 0, index = 0; i < 0xffffffff; i++) {
      if (isBattle(rng.rng2)) {
        fights[index] = getEncounterIndex(nextrng(rng.rng), area.tableLength);
        fightsRNG[index] = rng;
        // Uncomment for realistic mode
        // rng = nextrng(rng.rng);
        index++;
        if (index === arraySize - 1) {
          status.message = `Checking group of ${arraySize} fights`;
          progress ? progress(status) : console.log(status);
          const result = boyerMoore(fights, encounters, area.tableLength);
          if (result !== null) {
            status.done = true;
            status.result = fightsRNG[result];
            status.prevBattleRNG = fightsRNG[(result - 1) % arraySize];
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
      rng = nextrng(rng.rng);
      if (i % 42949672 === 0) {
        status.message = 'Generating fights to search';
        status.progress = i / 42949672;
        progress ? progress(status) : console.log(status);
      }
    }
    if (progress) progress({ progress: 100, message: 'No match found.', done: true });
    return null;
  }

  function boyerMoore(input, pattern, max) {
    const maxOffset = pattern.length - 1;
    // Create bad char array
    const badChar = new Array(max).fill(-1);
    for (let j = 0; j < pattern.length - 1; j++) {
      badChar[pattern[j]] = maxOffset - j;
    }

    // var patternIndex = pattern.length - 1;
    let i = maxOffset
    while (i < input.length) {
      // check if match
      let inputIndex = i;
      let patternIndex = pattern.length - 1;
      while (input[inputIndex] === pattern[patternIndex]) {
        inputIndex--;
        patternIndex--;
        if (patternIndex === -1) {
          return i - pattern.length + 1;
        }
      }
      const badCharVal = badChar[input[inputIndex]];
      // console.log('badCharVal:', badCharVal);
      const jump = badCharVal === -1 ? maxOffset : badCharVal || 1;
      i += jump;
    }
    return null;
  }

  function isBattleWorldMap(r2, encounterRate) {
    const r3 = r2;
    r2 = (r2 >> 8) << 8;
    r2 = r3 - r2;
    return r2 < encounterRate;
  }

  function isBattleDungeon(r2, encounterRate) {
    const r3 = 0x7F;
    const mflo = div32ulo(r2, r3);
    r2 = mflo;
    r2 = r2 & 0xFF;
    return r2 < encounterRate;
  }

  function getEncounterIndex(rng, len) {
    const r2 = rng.rng2;
    const r3 = div32ulo(0x7FFF, len);
    let encounterIndex = div32ulo(r2, r3);
    while (encounterIndex >= len) {
      encounterIndex--;
    }
    return encounterIndex;
  }

  function nextrng(rng) {
    rng = mult32ulo(rng, 0x41c64e6d) + 0x3039;
    const rng2 = (rng >> 16) & 0x7FFF;
    return { rng, rng2 };
  }

  function mult32ulo(n, m) {
    n >>>= 0;
    m >>>= 0;
    const nlo = n & 0xffff;
    const nhi = n - nlo;
    return (((nhi * m >>> 0) + (nlo * m)) & 0xFFFFFFFF) >>> 0;
  }

  function div32ulo(n, m) {
    return Math.floor(n / m) >>> 0;
  }

  onmessage = function(e) {
    const params = e.data;
    findRNG(params.area, params.encounters, params.rng, (status) => {
      postMessage(status);
    });
  }
};

export default worker;
