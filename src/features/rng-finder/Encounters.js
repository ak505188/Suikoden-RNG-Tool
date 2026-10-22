// The most recent battles found while scanning: each one's group index and the RNG it started at.
// Group indexes are stored as bytes, so an area can have up to 256 groups.
export default class Encounters {
  constructor(size = 0xffff) {
    this.size = size;
    this.ids = new Uint8Array(size);
    this.seeds = new Uint32Array(size);
    this.index = 0; // where the next battle goes; the buffer is full when this reaches `size`
  }

  isFull() {
    return this.index === this.size;
  }

  push(id, rngSeed) {
    this.ids[this.index] = id;
    this.seeds[this.index] = rngSeed;
    this.index++;
  }

  // The RNG the battle at `position` started at, or null if there is no battle there
  seedAt(position) {
    return position >= 0 && position < this.index ? this.seeds[position] : null;
  }

  // Where `pattern` (group indexes) first occurs in the buffer at or after `from`, or -1. Matches
  // may overlap, so search on from one past a match to get the next.
  search(pattern, from = 0) {
    for (let start = from; start + pattern.length <= this.index; start++) {
      let matched = 0;
      while (matched < pattern.length && this.ids[start + matched] === pattern[matched]) matched++;
      if (matched === pattern.length) return start;
    }
    return -1;
  }

  // Keeps the last `amount` battles at the start and carries on filling after them, so a pattern
  // that runs across the end of one full buffer is still found in the next
  rotateEndToStart(amount) {
    this.ids.copyWithin(0, this.size - amount);
    this.seeds.copyWithin(0, this.size - amount);
    this.index = amount;
  }
}
