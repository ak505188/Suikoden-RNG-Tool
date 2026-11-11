import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, Container, Dropdown, Segment } from 'semantic-ui-react';
import CompactEnemyButtons from './enemy-buttons-compact/CompactEnemyButtonsContainer';
import EnemyButtons from './enemy-buttons';
import {
  jumpRNG,
  nextFight,
  previousFight,
  switchArea,
  togglePatternMode,
} from '../actions/runAssistant';
import { getCurrentArea } from '../reducers/runAssistant';
import ConfigModal from './modal/ConfigModal';
import './Controls.css';

const mapStateToProps = (state) => ({
  areas: state.RunAssistant.areas.map((area) => area.name),
  currentArea: getCurrentArea(state.RunAssistant).name,
  patternMode: state.RunAssistant.patternMode,
  compactMode: state.config.compactMode,
  hotkeys: state.config.hotkeys,
});

const mapDispatchToProps = {
  jumpRNG,
  nextFight,
  previousFight,
  switchArea,
  togglePatternMode,
};

const Controls = ({
  areas,
  currentArea,
  patternMode,
  compactMode,
  hotkeys,
  jumpRNG,
  nextFight,
  previousFight,
  switchArea,
  togglePatternMode,
}) => {
  // The hotkeys work anywhere on the page except while typing in an input
  React.useEffect(() => {
    const handleHotkey = (event) => {
      if (event.target.tagName.toLowerCase() === 'input') return;
      if (event.key === hotkeys.nextFight) nextFight();
      if (event.key === hotkeys.prevFight) previousFight();
    };
    document.addEventListener('keydown', handleHotkey);
    return () => document.removeEventListener('keydown', handleHotkey);
  }, [hotkeys.nextFight, hotkeys.prevFight, nextFight, previousFight]);

  return (
    <Container>
      {compactMode ? <CompactEnemyButtons /> : <EnemyButtons />}
      <Segment className="controls-bar">
        <Dropdown
          label="Areas"
          placeholder="Area"
          value={currentArea}
          options={areas.map((name) => {
            return { key: name, value: name, text: name };
          })}
          onChange={(_e, data) => {
            switchArea(data.value);
          }}
          selection={true}
        />
        <Checkbox
          className="pattern-mode"
          label="Pattern Mode"
          checked={patternMode}
          onChange={() => togglePatternMode()}
        />
        <ConfigModal trigger={<Button>Config</Button>} />
        <span className="jump-buttons">
          <Button content="+100" onClick={() => jumpRNG(100)} />
          <Button content="+500" onClick={() => jumpRNG(500)} />
          <Button content="+1000" onClick={() => jumpRNG(1000)} />
          <Button content="Previous" onClick={() => previousFight()} />
          <Button content="Next" onClick={() => nextFight()} />
        </span>
      </Segment>
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
