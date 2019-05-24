import RNG from './lib/rng';
import { enemies } from './lib/enemies';
import { initAreas } from './lib/lib';

const rng = new RNG(0x0);
const areas = initAreas(enemies);
const area = areas['Cave of the Past'];
let battles = [];
for (let i = 0; i < Math.pow(2, 31); i++) {
  if (area.isBattle(rng)) {
    battles.push(area.getEncounterIndex(rng));
    rng.next();
  }
  rng.next();
  // console.log(`Index ${i}, battle count: ${battles.length}`);
 process.stdout.write(`Index 0x${i.toString(16)}, battle count: ${battles.length}`);
  process.stdout.cursorTo(0);
}
