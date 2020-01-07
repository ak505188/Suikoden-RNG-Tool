import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { getCurrentEnemies } from 'RunAssistant/reducers/RunAssistant';
import { findFight } from 'RunAssistant/actions/RunAssistant';
import { setEnemyButtonGroupSize } from 'RunAssistant/actions/controls';
import { Button, Container, Segment } from 'semantic-ui-react';
import { CompactEnemyButton } from '../enemy-buttons/EnemyButton';

const mapStateToProps = state => ({
  enemies: getCurrentEnemies(state.RunAssistant),
  useImages: state.config.useImages,
  patternMode: state.RunAssistant.patternMode,
  groupSize: state.controls.compactEnemyButtonsGroupSize,
  hotkeys: state.config.hotkeys.compactModeEnemyButtons
});

const mapDispatchToProps = {
  findFight,
  setEnemyButtonGroupSize
};

const EnemyButtonContainer = ({ enemies, findFight, groupSize, hotkeys, setEnemyButtonGroupSize, useImages }) => {
  const enemyGroupSizes = enemies.reduce((groupSizes, enemyGroup) => {
    const enemyCount = enemyGroup.enemies.length;
    if (!groupSizes.includes(enemyCount)) {
      groupSizes.push(enemyCount);
    }
    return groupSizes;
  }, []).sort();

  const enemyGroupsBySize = enemies.reduce((groups, enemyGroup) => {
    const enemyCount = enemyGroup.enemies.length;
    groups[enemyCount].push(enemyGroup);
    return groups;
  }, { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

  const selectFight = useCallback(enemyGroup => {
    findFight(enemyGroup.name);
  }, [findFight]);

  const selectGroupSize = useCallback(size => {
    if (enemyGroupsBySize[size].length === 1) {
      findFight(enemyGroupsBySize[size][0].name);
    } else if (enemyGroupsBySize[size].length > 0) {
      setEnemyButtonGroupSize(size);
    }
  }, [enemyGroupsBySize, findFight, setEnemyButtonGroupSize]);

  const handleHotkey = useCallback(index => {
    if (groupSize === null) {
      selectGroupSize(index + 1);
    } else if (index < enemyGroupsBySize[groupSize].length) {
      selectFight(enemyGroupsBySize[groupSize][index]);
    }
  }, [enemyGroupsBySize, groupSize, selectFight, selectGroupSize]);

  useEffect(() => {
    const handler = event => {
      if (event.target.tagName.toLowerCase() !== 'input') {
        const index = hotkeys.indexOf(event.key);
        if (index !== -1) {
          handleHotkey(index);
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [hotkeys, handleHotkey]);

  return (
    <Container style={{ width: '100%' }}>
      <Segment>
        <Button.Group
          style={{ width: '100%', margin: '2px' }}
        >
          { groupSize === null ?
            enemyGroupSizes.map(size =>
              <button
                key={size}
                style={{ height: '60px', margin: '0 2px', flex: 1 }}
                className="ui button"
                onClick={() => selectGroupSize(size)}
              >
                {size}
              </button>
            ) :
            enemyGroupsBySize[groupSize].map(enemyGroup =>
              <CompactEnemyButton
                key={enemyGroup.name}
                useImages={useImages}
                enemyGroup={enemyGroup}
                onClick={() => selectFight(enemyGroup)}
              />
            )
          }
        </Button.Group>
      </Segment>
    </Container>
  );
};

const ConnectedEnemyButtonContainer = connect(mapStateToProps, mapDispatchToProps)(EnemyButtonContainer);

export default ConnectedEnemyButtonContainer;
