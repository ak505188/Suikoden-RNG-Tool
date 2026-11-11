import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import ImportModal from './ImportModal';

let container;
beforeEach(() => localStorage.clear());
afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  localStorage.clear();
});

// The modal opens into a portal on document.body
const open = (importData) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(
      <ImportModal
        local_storage_prefix="exp"
        importData={importData}
        trigger={<button id="open">Import</button>}
      />,
      container,
    );
  });
  act(() => Simulate.click(container.querySelector('#open')));
};

const modalText = () => document.body.querySelector('.ui.modal').textContent;
const waitFor = async (check) => {
  for (let i = 0; i < 200 && !check(); i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
};
const chooseFile = async (name, text, done) => {
  const input = document.body.querySelector('input[type=file]');
  const file = new File([text], name, { type: 'application/json' });
  act(() => Simulate.change(input, { target: { files: [file] } }));
  await waitFor(done);
};

describe('ImportModal', () => {
  test('hands a valid JSON file to importData', async () => {
    const importData = vi.fn();
    open(importData);
    await chooseFile('plan.json', '{"characters":[]}', () => importData.mock.calls.length > 0);
    expect(importData).toHaveBeenCalledWith({ characters: [] });
    expect(modalText()).not.toContain("isn't");
  });

  test('says so when the file is not JSON, and imports nothing', async () => {
    const importData = vi.fn();
    open(importData);
    await chooseFile('plan.json', 'not json {', () => modalText().includes("isn't valid JSON"));
    expect(modalText()).toContain("plan.json isn't valid JSON.");
    expect(importData).not.toHaveBeenCalled();
  });

  test('says so when importData rejects the file', async () => {
    const importData = vi.fn(() => {
      throw new Error('no characters');
    });
    open(importData);
    await chooseFile('plan.json', '{"fights":[]}', () => modalText().includes('imported'));
    expect(modalText()).toContain("plan.json isn't something that can be imported.");
  });

  test('a saved entry that is not a plan is listed as unreadable, and fails on import', () => {
    localStorage.setItem('exp-broken', 'just some text');
    const importData = vi.fn(() => {
      throw new Error('bad');
    });
    open(importData);
    expect(modalText()).toContain('Unreadable entry');
    const button = [...document.body.querySelectorAll('.ui.modal button')].find(
      (b) => b.textContent === 'Import',
    );
    act(() => Simulate.click(button));
    expect(modalText()).toContain("broken isn't something that can be imported.");
  });
});
