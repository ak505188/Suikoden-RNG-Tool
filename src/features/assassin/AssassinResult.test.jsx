import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { simulateAssassinFight } from 'suikoden-rng-lib';
import { act, render as mount } from 'test/render';
import AssassinResult from './AssassinResult';

vi.mock('suikoden-rng-lib', async (importOriginal) => {
  const lib = await importOriginal();
  return { ...lib, simulateAssassinFight: vi.fn(lib.simulateAssassinFight) };
});

let container;

const render = () => {
  container = mount(
    <MemoryRouter initialEntries={['/assassin/result?rng=0x12&rangeStart=0&rangeEnd=20']}>
      <AssassinResult />
    </MemoryRouter>,
  );
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

  test('filters reuse the simulation, a new armor value runs it again', () => {
    render();
    const runs = simulateAssassinFight.mock.calls.length;
    expect(runs).toBe(20); // one per index in the range
    for (const label of ['Turn 1 Damage', 'Turn 2 Damage', 'Kirkis HP']) type(box(label), '30');
    expect(simulateAssassinFight.mock.calls.length).toBe(runs);
    type(box('McDohl Armor'), '85');
    expect(simulateAssassinFight.mock.calls.length).toBe(runs * 2);
  });
});
