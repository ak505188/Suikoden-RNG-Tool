export const switchArea = area => ({
  type: 'SWITCH_AREA',
  area
});

export const previousFight = () => ({
  type: 'PREVIOUS_FIGHT'
});

export const nextFight = () => ({
  type: 'NEXT_FIGHT'
});

export const selectFight = index => ({
  type: 'SELECT_FIGHT',
  index
});

export const findFight = name => ({
  type: 'FIND_FIGHT',
  name
});

export const findMatch = name => ({
  type: 'FIND_MATCH',
  name
});

export const jumpRNG = jump => ({
  type: 'JUMP_RNG',
  jump
});

export const togglePatternMode = () => ({
  type: 'TOGGLE_PATTERN_MODE'
});
