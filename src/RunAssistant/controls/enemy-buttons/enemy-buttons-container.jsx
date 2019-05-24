import * as React from 'react';
import { connect } from 'react-redux';
import { getCurrentEnemies } from 'RunAssistant/reducers/RunAssistant';
import { findFight } from 'RunAssistant/actions/RunAssistant';
import EnemyButtonsView from './enemy-buttons-view';

const mapStateToProps = state => ({
  enemies: getCurrentEnemies(state.RunAssistant),
  useImages: state.config.useImages,
  patternMode: state.RunAssistant.patternMode
});

const mapDispatchToProps = {
  findFight
};

const EnemyButtonContainer = props => {
  const enemiesByEnemyCount = props.enemies
    .reduce(
      (groups, enemyData) => {
        const enemyCount = enemyData.enemies.length - 1;
        if (groups[enemyCount] === undefined) {
          groups[enemyCount] = [];
        }
        if (!groups[enemyCount].some(currentEnemyData => enemyData.name === currentEnemyData.name)) {
          groups[enemyCount].push(enemyData);
        }
        return groups;
      },
      new Array(6))
    .reduce(
      (arr, enemyGroup) => {
        if (enemyGroup === undefined) {
          return arr;
        }
        if (enemyGroup.length > 1) {
          enemyGroup.sort((a, b) => a.name < b.name ? -1 : 1);
        }
        arr.push(enemyGroup);
        return arr;
      },
      []);

  return (
    <EnemyButtonsView
      enemiesByEnemyCount={enemiesByEnemyCount}
      useImages={props.useImages}
      enemyButtonOnClick={(enemyName) => props.findFight(enemyName)}
    />
  );
};

const ConnectedEnemyButtonContainer = connect(mapStateToProps, mapDispatchToProps)(EnemyButtonContainer);

export default ConnectedEnemyButtonContainer;
