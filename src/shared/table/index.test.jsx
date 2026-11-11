import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { act, render as mount } from 'test/render';
import TableContainer from './index';

// jsdom has no layout, so AutoSizer would never measure anything
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ renderProp }) => renderProp({ width: 600, height: 300 }),
}));

let container;

const makeColumns = () => [
  { key: 'a', label: 'Alpha', width: 50 },
  { key: 'b', label: 'Beta', width: 50 },
  { key: 'c', label: 'Gamma', width: 50, show: false },
];
const data = [{ a: 1, b: 2, c: 3 }];

// Like the result tables, the parent builds new column objects on every render
const render = () => {
  const given = [];
  const Parent = ({ tick }) => {
    const columns = makeColumns();
    given.push(columns);
    return <TableContainer key="t" columns={columns} data={data} filter={false} tick={tick} />;
  };
  container = mount(<Parent tick={0} />);
  return { given, rerender: () => mount(<Parent tick={Math.random()} />, container) };
};

const headers = () =>
  [...container.querySelectorAll('.ReactVirtualized__Table__headerColumn')].map((h) =>
    h.textContent.trim(),
  );
const toggle = (label) => {
  const item = [...container.querySelectorAll('.ui.dropdown .item')].find((i) =>
    i.textContent.includes(label),
  );
  act(() => Simulate.mouseDown(item.querySelector('.ui.checkbox') ?? item));
};

describe('table column toggling', () => {
  test('starts with the columns the caller left visible', () => {
    render();
    expect(headers()).toEqual(['Alpha', 'Beta']);
  });

  test('hiding and showing columns leaves the columns the caller passed untouched', () => {
    const { given } = render();
    toggle('Alpha');
    toggle('Gamma');
    expect(headers()).toEqual(['Beta', 'Gamma']);
    for (const columns of given) expect(columns).toEqual(makeColumns());
  });

  test('a choice survives the parent re-rendering with new column objects', () => {
    const { rerender } = render();
    toggle('Alpha');
    rerender();
    expect(headers()).toEqual(['Beta']);
  });
});

describe('table filtering', () => {
  const people = [
    { a: 'Pahn', b: 'Cave', c: 1 },
    { a: 'Cleo', b: 'Forest', c: 2 },
    { a: 'Flik', b: 'Cave', c: 3 },
  ];
  const shownRows = () =>
    [...container.querySelectorAll('.ReactVirtualized__Table__row')].map((row) =>
      row.textContent.trim(),
    );
  const typeFilter = async (text) => {
    const input = container.querySelector('input[placeholder=Filter]');
    act(() => Simulate.change(input, { target: { value: text } }));
    await act(async () => {});
  };

  test('shows every row until you type, then only the rows that match', async () => {
    container = mount(<TableContainer columns={makeColumns()} data={people} />);
    await act(async () => {});
    expect(shownRows()).toHaveLength(3);
    await typeFilter('cave');
    expect(shownRows()).toEqual(['Pahn', 'Flik'].map((name) => expect.stringContaining(name)));
    await typeFilter('');
    expect(shownRows()).toHaveLength(3);
  });

  test('filter={false} leaves the filter box out', () => {
    container = mount(<TableContainer columns={makeColumns()} data={people} filter={false} />);
    expect(container.querySelector('input[placeholder=Filter]')).toBeNull();
  });
});

describe('the current row', () => {
  const rows = Array.from({ length: 200 }, (_, i) => ({ a: `row-${i}`, b: i, c: i }));
  const shown = () =>
    [...container.querySelectorAll('.ReactVirtualized__Table__row')].map((row) =>
      row.textContent.trim(),
    );
  const table = (currentRow) => (
    <TableContainer columns={makeColumns()} data={rows} filter={false} currentRow={currentRow} />
  );

  test('is highlighted', () => {
    container = mount(table(2));
    const row = [...container.querySelectorAll('.ReactVirtualized__Table__row')].find((r) =>
      r.textContent.includes('row-2'),
    );
    expect(row.style.backgroundColor).toBe('yellow');
  });

  test('is scrolled to when it changes, and the rows before it are no longer drawn', () => {
    container = mount(table(0));
    expect(shown().some((text) => text.includes('row-0'))).toBe(true);
    expect(shown().some((text) => text.includes('row-120'))).toBe(false);
    mount(table(120), container);
    expect(shown().some((text) => text.includes('row-120'))).toBe(true);
    expect(shown().some((text) => text.includes('row-0'))).toBe(false);
  });

  test('a table with no current row does not scroll', () => {
    container = mount(table(undefined));
    expect(shown().some((text) => text.includes('row-0'))).toBe(true);
  });
});
