import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import BigNumber from 'bignumber.js';

BigNumber.config({ DECIMAL_PLACES: 3, ROUNDING_MODE: 1 });

const expTable = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 90, 120 , 160 , 200 , 400 , 900 , 1600, 2600, 3900, 5100 , 6000 , 6900 , 7500 , 8000 , 8500 , 9000 , 9300 , 9700 , 10000
];

const offset = 14;

const ExperienceContainer = ({ levels, fights }) => {

  const results = levels.map(level => {
    const startingLevel = parseFloat(level);
    const finalLevel = fights.reduce((currentLevel, currentFight) => {
      const partySize = parseInt(currentFight.partySize);
      if (partySize === 0) {
        return currentLevel;
      }
      const expGrowth = new BigNumber(currentFight.levels.reduce((exp, enemyLevel) => {
        let levelDiff = Math.ceil(enemyLevel - currentLevel);
        if (levelDiff > 14) {
          levelDiff = 15;
        } else if (levelDiff < -13) {
          levelDiff = -14;
        }
        return (exp + expTable[levelDiff + offset] / 1000);
      }, 0)).dividedBy(partySize);
      return expGrowth.plus(currentLevel).toFormat(3);
    }, startingLevel);
    return finalLevel;
  });

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      {
        results.map((level, index) =>
          <div key={`${level}-${index}`}>
            {levels[index]} : {level}
          </div>
        )
      }
    </Container>
  );
}

export default withRouter(ExperienceContainer);
