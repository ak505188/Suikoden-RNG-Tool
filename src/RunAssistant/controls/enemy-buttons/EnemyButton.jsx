import * as React from 'react';
import styled from 'styled-components';

const EnemyImage = styled.img`
  padding: 0 2px;
  max-height: 56px;
`;

export const EnemyButtonText = styled.button`
  &&&&& {
    width: 100%;
    flex: 0 0 auto;
    margin: 2px 0;
  }
`;

const EnemyButtonImage = styled.div`
  &&&&& {
    height: 60px;
    width: 100%;
    margin: 2px 0;
    flex: 0 0 auto;
    border: none;
    border-radius: .28571429rem;
    padding: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const CompactEnemyButtonText = styled.div`
  &&&&& {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    flex: 1;
    margin: 0 2px;
  }
`;

const CompactEnemyButtonImage = styled.div`
  &&&&& {
    height: 60px;
    margin: 0 2px;
    flex: 1;
    border: none;
    border-radius: .28571429rem;
    padding: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const CompactEnemyButton = props => {
  const { useImages, enemyGroup } = props;
  if (useImages) {
    return (
      <CompactEnemyButtonImage
        className="ui button"
        role="button"
        {...props}
      >
        {enemyGroup.enemies.map((enemy, index) => <EnemyImage key={index} src={enemy.img}/>)}
      </CompactEnemyButtonImage>
    );
  }
  return (
    <CompactEnemyButtonText
      className="ui button"
      role="button"
      {...props}
    >
      {enemyGroup.name}
    </CompactEnemyButtonText>
  );
};

const EnemyButton = props => {
  const { useImages, enemyGroup } = props;
  if (useImages) {
    return (
      <EnemyButtonImage
        className="ui button"
        role="button"
        {...props}
      >
        {enemyGroup.enemies.map((enemy, index) => <EnemyImage key={index} src={enemy.img}/>)}
      </EnemyButtonImage>
    );
  } else {
    return (
      <EnemyButtonText
        className="ui button"
        role="button"
        {...props}
      >
        {enemyGroup.name}
      </EnemyButtonText>
    );
  }
};

export default EnemyButton;
