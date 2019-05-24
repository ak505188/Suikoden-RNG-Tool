import React, { useState, useEffect } from 'react';
import { Form } from 'semantic-ui-react';

const HotkeyInput = props => {
  const [selected, setSelected] = useState(false);
  const { action, hotkey, changeHotkey, ...otherProps } = props;

  useEffect(() => {
    document.getElementById(action).addEventListener('focus', () => setSelected(true));
    document.getElementById(action).addEventListener('blur', () => setSelected(false));
    document.getElementById(action).addEventListener('keypress', e => {
      changeHotkey(e.key.toLowerCase())
      setSelected(false);
    });
  }, []);

  return (
    <Form.Input
      id={props.action}
      value={
        selected ?
        'Press key to bind.' :
        hotkey.toLowerCase()
      }
      {...otherProps}
    />
  );
};

export default HotkeyInput;
