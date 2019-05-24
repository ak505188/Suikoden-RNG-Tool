import React, { useEffect } from 'react';
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

const EnemyButtonContainer = props => {
  useEffect(() => {
    const handler = event => {
      if (event.target.tagName.toLowerCase() !== 'input') {
        const index = props.hotkeys.indexOf(event.key);
        if (index !== -1) {
          handleHotkey(index);
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [props.groupSize]);

  const enemyGroupSizes = props.enemies.reduce((groupSizes, enemyGroup) => {
    const enemyCount = enemyGroup.enemies.length;
    if (!groupSizes.includes(enemyCount)) {
      groupSizes.push(enemyCount);
    }
    return groupSizes;
  }, []).sort();

  const enemyGroupsBySize = props.enemies.reduce((groups, enemyGroup) => {
    const enemyCount = enemyGroup.enemies.length;
    groups[enemyCount].push(enemyGroup);
    return groups;
  }, { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

  const handleHotkey = index => {
    if (props.groupSize === null) {
      selectGroupSize(index + 1);
    } else if (index < enemyGroupsBySize[props.groupSize].length) {
      selectFight(enemyGroupsBySize[props.groupSize][index]);
    }
  };

  const selectFight = enemyGroup => {
    props.findFight(enemyGroup.name);
  };

  const selectGroupSize = size => {
    if (enemyGroupsBySize[size].length === 1) {
      props.findFight(enemyGroupsBySize[size][0].name);
    } else if (enemyGroupsBySize[size].length > 0) {
      props.setEnemyButtonGroupSize(size);
    }
  };

  return (
    <Container style={{ width: '100%' }}>
      <Segment>
        <Button.Group
          style={{ width: '100%', margin: '2px' }}
        >
          { props.groupSize === null ?
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
            enemyGroupsBySize[props.groupSize].map(enemyGroup =>
              <CompactEnemyButton
                key={enemyGroup.name}
                useImages={props.useImages}
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
