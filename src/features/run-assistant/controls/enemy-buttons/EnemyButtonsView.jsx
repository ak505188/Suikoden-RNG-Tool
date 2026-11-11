import * as React from 'react';
import { Button, Container, Segment } from 'semantic-ui-react';
import EnemyButton from './EnemyButton';
import './EnemyButtons.css';

const EnemyButtonsView = ({ enemiesByEnemyCount, useImages, enemyButtonOnClick }) => {
  return (
    <Container className="enemy-buttons-container">
      <Segment>
        <div className="even-columns">
          {enemiesByEnemyCount.map((enemiesGroup, index) => {
            return (
              <Button.Group className="enemy-button-group" vertical={true} key={index}>
                {enemiesGroup.map((enemyGroup) => {
                  return (
                    <EnemyButton
                      key={enemyGroup.name}
                      useImages={useImages}
                      enemyGroup={enemyGroup}
                      onClick={() => enemyButtonOnClick(enemyGroup.name)}
                    />
                  );
                })}
              </Button.Group>
            );
          })}
        </div>
      </Segment>
    </Container>
  );
};

export default EnemyButtonsView;
