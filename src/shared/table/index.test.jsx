import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import TableContainer from './index';

// jsdom has no layout, so AutoSizer would render nothing
vi.mock('react-virtualized', async (importOriginal) => ({
  ...(await importOriginal()),
  AutoSizer: ({ children }) => children({ width: 600, height: 300 }),
}));

let container;
afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
});

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
  container = document.createElement('div');
  document.body.appendChild(container);
  const show = (tick) =>
    act(() => {
      ReactDOM.render(<Parent tick={tick} />, container);
    });
  show(0);
  return { given, rerender: () => show(Math.random()) };
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
