import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Modal } from 'semantic-ui-react';
import HotkeyInput from './hotkey';
import {
  changeUseImages,
  changeCompactMode,
  changeColumnWidth,
  changeColumnVisibility,
  changeRowFontSize,
  changeTableHeaderHeight,
  changeTableRowHeight,
  changeHotkey,
  changeCompactModeEnemyButtonsHotkey,
  resetToDefault
} from 'RunAssistant/actions/config';

const mapStateToProps = state => ({
  ...state.config
});

const mapDispatchToProps = {
  changeUseImages,
  changeCompactMode,
  changeColumnVisibility,
  changeColumnWidth,
  changeRowFontSize,
  changeTableRowHeight,
  changeTableHeaderHeight,
  changeCompactModeEnemyButtonsHotkey,
  changeHotkey,
  resetToDefault
};

const saveToLocalStorage = props => {
  window.localStorage.setItem('config', JSON.stringify({
    useImages: props.useImages,
    compactMode: props.compactMode,
    columns: props.columns,
    table: props.table
  }));
};

const ConfigModal = props => (
  <Modal trigger={props.trigger}>
    <Modal.Header>
      Run Assistant Configuration
    </Modal.Header>
    <Modal.Content>
      <Form>
        <Header>Run Assistant</Header>
        <Form.Group inline={true}>
          <Form.Checkbox
            checked={props.useImages}
            onChange={() => props.changeUseImages(!props.useImages)}
            label="Use Enemy Images"
            toggle={true}
          />
          <Form.Checkbox
            checked={props.compactMode}
            onChange={() => props.changeCompactMode(!props.compactMode)}
            label="Enemy Compact Mode"
            toggle={true}
          />
        </Form.Group>
        <Header>
          Table
        </Header>
        <Form.Group widths="equal" label="Default Visible Columns">
          {props.columns.map((column, index) => (
            <Form.Checkbox
              key={column.key}
              checked={column.show !== false}
              onChange={() => props.changeColumnVisibility(index, !column.show)}
              label={column.label}
            />
          ))}
        </Form.Group>
        <Form.Group>
          <Form.Input
            type="number"
            onChange={e => props.changeRowFontSize(parseInt(e.currentTarget.value))}
            min={4}
            max={72}
            step={2}
            value={props.table.rowStyle.fontSize}
            label="Font Size (px)"
          />
          <Form.Input
            type="number"
            onChange={e => props.changeTableRowHeight(parseInt(e.currentTarget.value))}
            min={10}
            max={120}
            step={10}
            value={props.table.rowHeight}
            label="Table Row Height (px)"
          />
          <Form.Input
            type="number"
            onChange={e => props.changeTableHeaderHeight(parseInt(e.currentTarget.value))}
            min={10}
            max={120}
            step={10}
            value={props.table.headerHeight}
            label="Header Row Height (px)"
          />
        </Form.Group>
        <Header>
          Hotkeys
        </Header>
        <Form.Group widths="equal">
          <HotkeyInput
            key="nextFight"
            action="nextFight"
            label="Next Fight"
            type="text"
            changeHotkey={key => props.changeHotkey('nextFight', key)}
            hotkey={props.hotkeys.nextFight}
          />
          <HotkeyInput
            key="prevFight"
            action="prevFight"
            label="Previous Fight"
            type="text"
            changeHotkey={key => props.changeHotkey('prevFight', key)}
            hotkey={props.hotkeys.prevFight}
          />
        </Form.Group>
        <Header>
          Compact Enemy Button Hotkeys
        </Header>
        <Form.Group widths="equal">
          {props.hotkeys.compactModeEnemyButtons.slice(0, 3).map((key, index) =>
            <HotkeyInput
              key={`Enemy / Group ${index + 1}`}
              action={`Enemy / Group ${index + 1}`}
              label={`Enemy / Group ${index + 1}`}
              type="text"
              changeHotkey={key => props.changeCompactModeEnemyButtonsHotkey(index, key)}
              hotkey={key.toString()}
            />
          )}
        </Form.Group>
        <Form.Group widths="equal">
          {props.hotkeys.compactModeEnemyButtons.slice(3).map((key, index) =>
            <HotkeyInput
              key={`Enemy / Group ${index + 4}`}
              action={`Enemy / Group ${index + 4}`}
              label={`Enemy / Group ${index + 4}`}
              type="text"
              changeHotkey={key => props.changeCompactModeEnemyButtonsHotkey(index + 3, key)}
              hotkey={key.toString()}
            />
          )}
        </Form.Group>
        <Form.Group inline={true}>
          <Form.Button content="Save Settings" primary={true} onClick={() => saveToLocalStorage(props)}/>
          <Form.Button content="Reset to Default" onClick={() => props.resetToDefault()}/>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

export default connect(mapStateToProps, mapDispatchToProps)(ConfigModal);
