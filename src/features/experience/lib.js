const EXP_TABLE = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 90, 120, 160, 200, 400, 900, 1600, 2600, 3900, 5100, 6000,
  6900, 7500, 8000, 8500, 9000, 9300, 9700, 10000,
];

const offset = 14;
const EXP_PER_LEVEL = 1000;
const MIN_BATTLE_EXP = 5;

export const UNDO_LIMIT = 20;

// The undo history with `entry` added, keeping only the newest UNDO_LIMIT entries.
export const pushUndo = (history, entry) => [...history, entry].slice(-UNDO_LIMIT);

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 99;
export const MIN_PARTY_SIZE = 1;
export const MAX_PARTY_SIZE = 6;

// Typed input arrives as a string; these turn it into the numbers the calculation expects.
export function clampNumber(value, min, max, fallback) {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

// Typed text -> a character level: 1-99, rounded to the thousandth (the calculation's precision).
// Empty or non-numeric text gives level 1.
export function parseLevel(value) {
  return (
    Math.round(clampNumber(value, MIN_LEVEL, MAX_LEVEL, MIN_LEVEL) * EXP_PER_LEVEL) / EXP_PER_LEVEL
  );
}

export function isValidPartySize(value) {
  const size = Number(value);
  return Number.isInteger(size) && size >= MIN_PARTY_SIZE && size <= MAX_PARTY_SIZE;
}

// Typed text or a saved value -> a whole party size, 1-6. Empty or non-numeric text gives 6.
// Saved data can need this: old exports kept the raw input strings.
export function parsePartySize(value) {
  return Math.trunc(clampNumber(value, MIN_PARTY_SIZE, MAX_PARTY_SIZE, MAX_PARTY_SIZE));
}

// A copy of `list` with the item at `from` moved to position `to`.
export const moveItem = (list, from, to) => {
  const moved = [...list];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  return moved;
};

// Checks a saved export and cleans it up: levels and party sizes become numbers in range (old
// exports have strings), a fight with no `enabled` counts as enabled, and a missing or short
// disabled_characters list becomes one empty list per fight. Throws if it isn't a saved plan.
export function normalizeImport(data) {
  const isCharacter = (c) => c && typeof c.name === 'string';
  const isFight = (f) => f && f.enemy_group && Array.isArray(f.enemy_group.levels);
  if (
    !data ||
    !Array.isArray(data.characters) ||
    !Array.isArray(data.fights) ||
    !data.characters.every(isCharacter) ||
    !data.fights.every(isFight)
  ) {
    throw new Error('Not a saved EXP plan: it needs characters and fights');
  }
  const saved = Array.isArray(data.disabled_characters) ? data.disabled_characters : [];
  return {
    ...data,
    characters: data.characters.map((c) => ({ ...c, level: parseLevel(c.level) })),
    fights: data.fights.map((f) => ({
      ...f,
      party_size: parsePartySize(f.party_size),
      enabled: f.enabled ?? true,
    })),
    disabled_characters: data.fights.map((_, i) => (Array.isArray(saved[i]) ? saved[i] : [])),
  };
}

export function calculateLevels(characters, fights, disabledCharacters) {
  const results = [];
  let newCharacters = characters;
  for (let i = 0; i < fights.length; i++) {
    newCharacters = levelupCharacters(newCharacters, fights[i], disabledCharacters[i]);
    results.push({ ...fights[i], characters: newCharacters });
  }

  return results;
}

// Returns new characters
// Each character also gets `levelsGained`: how many whole levels this fight took them past (0 for
// most fights, and for characters sitting it out). It is always reset, so it never carries over
// from the fight before.
function levelupCharacters(characters, fight, disabledCharacters) {
  return characters.map((character) => {
    if (!fight.enabled || disabledCharacters.includes(character.name)) {
      return { ...character, levelsGained: 0 };
    }
    const newLevel = levelupCharacter(character.level, fight.enemy_group, fight.party_size);
    const levelsGained = Math.floor(newLevel) - Math.floor(character.level);
    return { ...character, level: newLevel, levelsGained };
  });
}

function levelupCharacter(level, enemyGroup, partySize) {
  const total = enemyGroup.levels.reduce((exp, enemyLevel) => {
    let levelDiff = Math.ceil(enemyLevel - level);
    const index = Math.min(Math.max(levelDiff, -14), 15) + offset;
    return exp + EXP_TABLE[index];
  }, 0);
  const exp = Math.max(Math.floor(total / partySize), MIN_BATTLE_EXP);
  return (Math.round(level * EXP_PER_LEVEL) + exp) / EXP_PER_LEVEL;
}
