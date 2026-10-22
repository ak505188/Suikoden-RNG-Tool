import { Helpers } from 'suikoden-rng-lib';

const TOP_BIT = 0x80000000;

// The game never looks at bit 31 of the RNG, so a value and the same value with bit 31 flipped
// give the same battles and drops from then on. The finder reports one of them; these show both.

// The other value of the pair
export const twinOf = (raw) => (raw ^ TOP_BIT) >>> 0;

// Both values, bit 31 clear first: "0x00a34468 / 0x80a34468"
export const formatPair = (raw) => {
  const clear = (raw & ~TOP_BIT) >>> 0;
  return `${Helpers.numToHexString(clear)} / ${Helpers.numToHexString(twinOf(clear))}`;
};
