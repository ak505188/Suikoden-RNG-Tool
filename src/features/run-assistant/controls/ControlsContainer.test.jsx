import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, test, vi } from 'vitest';
import { act, render } from 'test/render';
import reducer from '../reducers';
import { buildRunAssistantState } from '../buildState';
import { initialState as configDefault } from '../reducers/config';
import { initialState as controlsDefault } from '../reducers/controls';
import { changeHotkey } from '../actions/config';
import Controls from './ControlsContainer';

// The enemy buttons and the config modal have their own connections and are not under test
vi.mock('./enemy-buttons-compact/CompactEnemyButtonsContainer', () => ({ default: () => null }));
vi.mock('./enemy-buttons', () => ({ default: () => null }));
vi.mock('./modal/ConfigModal', () => ({ default: () => null }));

const mount = () => {
  const query = new URLSearchParams({
    rng: '18',
    iterations: '5000',
    partyLevel: '0',
    realistic: 'true',
    areas: 'Cave of the Past',
  }).toString();
  const { state } = buildRunAssistantState(query);
  const store = createStore(reducer, {
    RunAssistant: state,
    config: configDefault,
    controls: controlsDefault,
  });
  const container = render(
    <Provider store={store}>
      <Controls />
    </Provider>,
  );
  const index = () => store.getState().RunAssistant.index;
  const press = (key, target = document.body) =>
    act(() => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    });
  const button = (text) =>
    [...container.querySelectorAll('button')].find((b) => b.textContent === text);
  return { store, container, index, press, button };
};

describe('Run Assistant controls', () => {
  test('the next and previous hotkeys move through the fights', () => {
    const { index, press } = mount();
    expect(index()).toBe(0);
    press('n');
    press('n');
    expect(index()).toBe(2);
    press('b');
    expect(index()).toBe(1);
  });

  test('hotkeys are ignored while typing in an input', () => {
    const { index, press } = mount();
    const input = document.createElement('input');
    document.body.appendChild(input);
    press('n', input);
    input.remove();
    expect(index()).toBe(0);
  });

  test('a hotkey changed in the config works at once, and the old one stops', () => {
    const { store, index, press } = mount();
    act(() => store.dispatch(changeHotkey('nextFight', 'x')));
    press('n');
    expect(index()).toBe(0);
    press('x');
    expect(index()).toBe(1);
  });

  test('the buttons do the same as the hotkeys', () => {
    const { index, button } = mount();
    act(() => button('Next').click());
    act(() => button('Next').click());
    expect(index()).toBe(2);
    act(() => button('Previous').click());
    expect(index()).toBe(1);
  });

  test('the +100 button jumps the RNG forward', () => {
    const { store, button } = mount();
    const before = store.getState().RunAssistant;
    act(() => button('+100').click());
    expect(store.getState().RunAssistant).not.toBe(before);
  });

  test('hotkeys stop working once the controls are gone', () => {
    const { index, press, container } = mount();
    // Unmounting through the helper's cleanup: render something else into the same root
    render(<p>gone</p>, container);
    press('n');
    expect(index()).toBe(0);
  });
});
