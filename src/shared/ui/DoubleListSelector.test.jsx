import React, { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { act, render } from 'test/render';
import DoubleListSelector from './DoubleListSelector';

const options = ['Banshee', 'Clay Doll', 'Red Elemental'];

// Holds the picked positions the way RngFinder does, inside a form like RngFinder's
const mount = (initial = []) => {
  const changes = [];
  const submitted = vi.fn((e) => e.preventDefault());
  const Harness = () => {
    const [list, setList] = useState(initial);
    return (
      <form onSubmit={submitted}>
        <DoubleListSelector
          options={options}
          list={list}
          handleChange={(next) => {
            changes.push(next);
            setList(next);
          }}
        />
      </form>
    );
  };
  const container = render(<Harness />);
  const column = (index) => container.querySelectorAll('label')[index].nextElementSibling;
  const names = (index) => [...column(index).querySelectorAll('button')].map((b) => b.textContent);
  const click = (index, row) => act(() => column(index).querySelectorAll('button')[row].click());
  return { changes, submitted, names, click };
};

describe('DoubleListSelector', () => {
  test('the left list offers every option and the right list starts empty', () => {
    const { names } = mount();
    expect(names(0)).toEqual(options);
    expect(names(1)).toEqual([]);
  });

  test('clicking an option adds it to the end, and the same option can be added again', () => {
    const { names, click, changes } = mount();
    click(0, 2);
    click(0, 0);
    click(0, 2);
    expect(changes.at(-1)).toEqual([2, 0, 2]);
    expect(names(1)).toEqual(['Red Elemental', 'Banshee', 'Red Elemental']);
  });

  test('clicking a picked entry removes only that entry', () => {
    const { names, click, changes } = mount([2, 0, 2]);
    click(1, 2);
    expect(changes.at(-1)).toEqual([2, 0]);
    click(1, 0);
    expect(changes.at(-1)).toEqual([0]);
    expect(names(1)).toEqual(['Banshee']);
  });

  test('the buttons do not submit the form around them', () => {
    const { click, submitted } = mount([1]);
    click(0, 0);
    click(1, 0);
    expect(submitted).not.toHaveBeenCalled();
  });
});
