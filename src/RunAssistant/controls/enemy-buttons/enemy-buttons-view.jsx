import * as React from 'react';
import { Button, Container, Segment } from 'semantic-ui-react';
import EnemyButton from './EnemyButton';
import EvenColumnContainer from './even-column-container';

const EnemyButtonsView = ({ enemiesByEnemyCount, useImages, enemyButtonOnClick }) => {
  return (
    <Container style={{ width: '100%' }}>
      <Segment>
        <EvenColumnContainer>
          {enemiesByEnemyCount.map((enemiesGroup, index) => {
            return (
              <Button.Group
                style={{ width: '100%', margin: '2px' }}
                vertical={true}
                key={index}
              >
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
        </EvenColumnContainer>
      </Segment>
    </Container>
  );
};

export default EnemyButtonsView;
