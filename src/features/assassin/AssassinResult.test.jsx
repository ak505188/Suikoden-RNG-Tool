import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test } from 'vitest';
import AssassinResult from './AssassinResult';

let container;
afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
});

const render = () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/assassin/result?rng=0x12&range_start=0&range_end=20']}>
        <AssassinResult />
      </MemoryRouter>,
      container,
    );
  });
};

const box = (label) =>
  [...container.querySelectorAll('.field')]
    .find((field) => field.querySelector('label')?.textContent === label)
    .querySelector('input');
const type = (input, text) => act(() => Simulate.change(input, { target: { value: text } }));
const blur = (input) => act(() => Simulate.blur(input));

describe('Assassin number boxes', () => {
  test('McDohl Armor can be cleared without turning into NaN', () => {
    render();
    const armor = box('McDohl Armor');
    type(armor, '');
    expect(armor.value).toBe('');
    blur(armor);
    expect(armor.value).toBe('80');
    expect(container.textContent).not.toContain('NaN');
  });

  test('McDohl Armor below the minimum is not committed', () => {
    render();
    const armor = box('McDohl Armor');
    type(armor, '8');
    blur(armor);
    expect(armor.value).toBe('80');
  });

  test('an emptied damage filter counts as 0', () => {
    render();
    const damage = box('Turn 1 Damage');
    type(damage, '5');
    type(damage, '');
    expect(damage.value).toBe('');
    blur(damage);
    expect(damage.value).toBe('0');
  });
});
