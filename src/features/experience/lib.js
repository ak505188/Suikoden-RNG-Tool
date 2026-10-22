const EXP_TABLE = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 90, 120, 160, 200, 400, 900, 1600, 2600, 3900, 5100, 6000,
  6900, 7500, 8000, 8500, 9000, 9300, 9700, 10000,
];

const offset = 14;
const EXP_PER_LEVEL = 1000;
const MIN_BATTLE_EXP = 5;

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

// Cleans up a saved export so levels and party sizes are numbers in range (old exports have strings).
export function normalizeImport(data) {
  return {
    ...data,
    characters: data.characters.map((c) => ({ ...c, level: parseLevel(c.level) })),
    fights: data.fights.map((f) => ({ ...f, party_size: parsePartySize(f.party_size) })),
  };
}

export function calculateLevels(characters, fights, disabled_characters) {
  const results = [];
  let new_characters = characters;
  for (let i = 0; i < fights.length; i++) {
    new_characters = levelupCharacters(new_characters, fights[i], disabled_characters[i]);
    results.push({ ...fights[i], characters: new_characters });
  }

  return results;
}

// Returns new characters
function levelupCharacters(characters, fight, disabled_characters) {
  return characters.map((character) => {
    if (!fight.enabled || disabled_characters.includes(character.name)) return character;
    const new_level = levelupCharacter(character.level, fight.enemy_group, fight.party_size);
    return { ...character, level: new_level };
  });
}

function levelupCharacter(level, enemy_group, party_size) {
  const total = enemy_group.levels.reduce((exp, enemyLevel) => {
    let levelDiff = Math.ceil(enemyLevel - level);
    const index = Math.min(Math.max(levelDiff, -14), 15) + offset;
    return exp + EXP_TABLE[index];
  }, 0);
  const exp = Math.max(Math.floor(total / party_size), MIN_BATTLE_EXP);
  return (Math.round(level * EXP_PER_LEVEL) + exp) / EXP_PER_LEVEL;
}
