import BigNumber from 'bignumber.js';

BigNumber.config({ DECIMAL_PLACES: 3, ROUNDING_MODE: 1 });

const EXP_TABLE = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 90, 120 , 160 , 200 , 400 , 900 , 1600, 2600, 3900, 5100 , 6000 , 6900 , 7500 , 8000 , 8500 , 9000 , 9300 , 9700 , 10000
];

const offset = 14;

// Current structure:
// Characters: [{ name, level }]
// Fights:
// [{
//   enemy_group: {
//     name,
//     levels: []
//   },
//   party_size,
//   enabled,
// }]
export function calculateLevels(characters, fights, disabled_characters) {
  const results = [];
  let new_characters = characters;
  for (let i = 0; i < fights.length; i++) {
    new_characters = levelupCharacters(new_characters, fights[i], disabled_characters[i]);
    results.push({ ...fights[i], characters: new_characters });
  };

  return results;
}

// Returns new characters
function levelupCharacters(characters, fight, disabled_characters) {
  return characters.map(character => {
    if (!fight.enabled || disabled_characters.includes(character.name)) return character;
    const new_level = levelupCharacter(character.level, fight.enemy_group, fight.party_size);
    return { ...character, level: new_level };
  });
}

function levelupCharacter(level, enemy_group, party_size) {
  const expGrowth = new BigNumber(enemy_group.levels.reduce((exp, enemyLevel) => {
    let levelDiff = Math.ceil(enemyLevel - level);
    if (levelDiff > 14) {
      levelDiff = 15;
    } else if (levelDiff < -13) {
      levelDiff = -14;
    }
    return (exp + EXP_TABLE[levelDiff + offset] / 1000);
  }, 0)).dividedBy(party_size);
  return parseFloat(expGrowth.plus(level).toFormat(3));
}

// const ExperienceContainer = ({ levels, fights }) => {
//
//   const results = levels.map(level => {
//     const startingLevel = parseFloat(level);
//     const finalLevel = fights.reduce((currentLevel, currentFight) => {
//       const partySize = parseInt(currentFight.partySize);
//       if (partySize === 0) {
//         return currentLevel;
//       }
//       const expGrowth = new BigNumber(currentFight.levels.reduce((exp, enemyLevel) => {
//         let levelDiff = Math.ceil(enemyLevel - currentLevel);
//         if (levelDiff > 14) {
//           levelDiff = 15;
//         } else if (levelDiff < -13) {
//           levelDiff = -14;
//         }
//         return (exp + EXP_TABLE[levelDiff + offset] / 1000);
//       }, 0)).dividedBy(partySize);
//       return expGrowth.plus(currentLevel).toFormat(3);
//     }, startingLevel);
//     return finalLevel;
//   });
