import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { act, render } from 'test/render';
import Filter from './Filter';

const rows = [
  { name: 'Pahn', area: 'Cave' },
  { name: 'Cleo', area: 'Forest' },
  { name: 'Flik', area: 'Cave' },
];

// Like TableContainer: a new function and (optionally) a new copy of the data on every render
const mount = (data) => {
  const found = vi.fn();
  const element = (rowsNow) => <Filter data={rowsNow} setRowsToRender={(r) => found(r)} />;
  const container = render(element(data));
  return {
    found,
    input: container.querySelector('input'),
    rerender: (rowsNow) => render(element(rowsNow), container),
  };
};
const type = (input, text) => act(() => Simulate.change(input, { target: { value: text } }));
const settle = () => act(async () => {});
const lastFound = (found) => found.mock.calls.at(-1)[0];

describe('Filter', () => {
  test('starts with every row', async () => {
    const { found } = mount(rows);
    await settle();
    expect(lastFound(found)).toEqual([0, 1, 2]);
  });

  test('typing narrows the rows to those whose values match', async () => {
    const { found, input } = mount(rows);
    type(input, 'cave');
    await settle();
    expect(lastFound(found)).toEqual([0, 2]);
    type(input, 'cave,flik');
    await settle();
    expect(lastFound(found)).toEqual([2]);
  });

  test('new data is searched with the text already typed', async () => {
    const { found, input, rerender } = mount(rows);
    type(input, 'forest');
    await settle();
    expect(lastFound(found)).toEqual([1]);
    rerender([...rows, { name: 'Viktor', area: 'Forest' }]);
    await settle();
    expect(lastFound(found)).toEqual([1, 3]);
  });

  test('a fresh copy of the same data does not search again', async () => {
    const { found, rerender } = mount(rows);
    await settle();
    const calls = found.mock.calls.length;
    rerender(rows.map((row) => ({ ...row })));
    await settle();
    expect(found.mock.calls.length).toBe(calls);
  });
});
