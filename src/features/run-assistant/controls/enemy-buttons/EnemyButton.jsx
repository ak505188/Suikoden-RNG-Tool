import * as React from 'react';
import './EnemyButtons.css';

const EnemyImages = ({ enemyGroup }) =>
  enemyGroup.enemies.map((enemy, index) => (
    <img className="enemy-image" key={index} src={enemy.img} alt="" />
  ));

export const CompactEnemyButton = (props) => {
  // useImages and enemyGroup are for this component, not the button element
  const { useImages, enemyGroup, ...buttonProps } = props;
  if (useImages) {
    return (
      <div
        className="ui button compact-enemy-button compact-enemy-button-images"
        role="button"
        {...buttonProps}
      >
        <EnemyImages enemyGroup={enemyGroup} />
      </div>
    );
  }
  return (
    <div className="ui button compact-enemy-button" role="button" {...buttonProps}>
      {enemyGroup.name}
    </div>
  );
};

const EnemyButton = (props) => {
  const { useImages, enemyGroup, ...buttonProps } = props;
  if (useImages) {
    return (
      <div className="ui button enemy-button enemy-button-images" role="button" {...buttonProps}>
        <EnemyImages enemyGroup={enemyGroup} />
      </div>
    );
  }
  return (
    <button className="ui button enemy-button" role="button" {...buttonProps}>
      {enemyGroup.name}
    </button>
  );
};

export default EnemyButton;
