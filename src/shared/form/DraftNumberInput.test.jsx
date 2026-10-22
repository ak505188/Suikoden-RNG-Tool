import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import DraftNumberInput from './DraftNumberInput';

let container;
afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
});

// Mirrors the table: a committed value in state, only whole numbers 1-6 accepted
const render = () => {
  const commits = [];
  const Harness = () => {
    const [value, setValue] = useState(4);
    return (
      <DraftNumberInput
        value={value}
        accepts={(text) => /^[1-6]$/.test(text)}
        onCommit={(text) => {
          commits.push(text);
          setValue(Number(text));
        }}
      />
    );
  };
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<Harness />, container);
  });
  return { input: container.querySelector('input'), commits };
};

const type = (input, text) => act(() => Simulate.change(input, { target: { value: text } }));
const blur = (input) => act(() => Simulate.blur(input));

describe('DraftNumberInput', () => {
  test('shows the committed value until you type', () => {
    expect(render().input.value).toBe('4');
  });

  test('can be cleared, and clearing commits nothing', () => {
    const { input, commits } = render();
    type(input, '');
    expect(input.value).toBe('');
    expect(commits).toEqual([]);
  });

  test('commits accepted text as you type it', () => {
    const { input, commits } = render();
    type(input, '');
    type(input, '2');
    expect(commits).toEqual(['2']);
    expect(input.value).toBe('2');
  });

  test('rejected text is shown while focused but not committed, and goes away on blur', () => {
    const { input, commits } = render();
    type(input, '9');
    expect(input.value).toBe('9');
    expect(commits).toEqual([]);
    blur(input);
    expect(input.value).toBe('4');
  });

  test('an abandoned empty field goes back to the last committed value', () => {
    const { input } = render();
    type(input, '');
    blur(input);
    expect(input.value).toBe('4');
  });
});
