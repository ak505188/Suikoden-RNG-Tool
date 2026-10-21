import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, Container, Dropdown, Segment } from 'semantic-ui-react';
import CompactEnemyButtons from './enemy-buttons-compact/enemy-buttons-container';
import EnemyButtons from './enemy-buttons';
import { jumpRNG, nextFight, previousFight, findFight, switchArea, togglePatternMode } from '../actions/RunAssistant';
import { findNextFight, getCurrentArea, getCurrentFight, getFight } from '../reducers/RunAssistant';
import ConfigModal from './modal/config-modal';
import styled from 'styled-components';

const mapStateToProps = state => ({
  areas: state.RunAssistant.areas.map(area => area.name),
  currentArea: getCurrentArea(state.RunAssistant).name,
  findNextFight: () => {
    const index = findNextFight(state.RunAssistant);
    return index > -1 ? getFight(state.RunAssistant, index) : null;
  },
  getCurrentFight: () => getCurrentFight(state.RunAssistant),
  patternMode: state.RunAssistant.patternMode,
  compactMode: state.config.compactMode,
  hotkeys: state.config.hotkeys
});

const mapDispatchToProps = {
  jumpRNG,
  nextFight,
  previousFight,
  findFight,
  switchArea,
  togglePatternMode
};

class Controls extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', this.handleHotkeyNextFight);
    document.addEventListener('keydown', this.handleHotkeyPrevFight);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleHotkeyNextFight);
    document.removeEventListener('keydown', this.handleHotkeyPrevFight);
  }

  handleHotkeyNextFight = event => {
    if (event.target.tagName.toLowerCase() !== 'input') {
      if (event.key === this.props.hotkeys.nextFight) {
        this.props.nextFight();
      }
    }
  }

  handleHotkeyPrevFight = event => {
    if (event.target.tagName.toLowerCase() !== 'input') {
      if (event.key === this.props.hotkeys.prevFight) {
        this.props.previousFight();
      }
    }
  }

  render() {
    const { areas, currentArea, compactMode } = this.props;
    return (
      <Container className={this.props.className}>
        {
          compactMode ?
          <CompactEnemyButtons/> :
          <EnemyButtons/>
        }
        <Segment style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Dropdown
            label="Areas"
            placeholder="Area"
            value={currentArea}
            options={areas.map((name) => { return { key: name, value: name, text: name }; })}
            onChange={(_e, data) => {
              this.props.switchArea(data.value);
            }}
            selection={true}
          />
          <Checkbox
            style={{ display: 'flex', margin: '0 1em', alignItems: 'center' }}
            label="Pattern Mode"
            checked={this.props.patternMode}
            onChange={() => this.props.togglePatternMode()}
          />
          <ConfigModal trigger={<Button>Config</Button>}/>
          <span style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
            <Button content="+100" onClick={() => this.props.jumpRNG(100)}/>
            <Button content="+500" onClick={() => this.props.jumpRNG(500)}/>
            <Button content="+1000" onClick={() => this.props.jumpRNG(1000)}/>
            <Button content="Previous" onClick={() => this.props.previousFight()}/>
            <Button content="Next" onClick={() => this.props.nextFight()}/>
          </span>
        </Segment>
      </Container>
    );
  }
}

const ConnectedControls = connect(mapStateToProps, mapDispatchToProps)(Controls);

const StyledControls = styled(ConnectedControls)``;

export default StyledControls;
