import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { act, render } from 'test/render';
import ExperienceForm from './ExperienceForm';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

const field = (container, label) =>
  [...container.querySelectorAll('.field')].find(
    (f) => f.querySelector('label')?.textContent === label,
  );
const button = (container, text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
const click = (element) => act(() => element.click());

const mount = () => {
  const container = render(<ExperienceForm />);
  const pick = (...names) => {
    for (const name of names) {
      const option = [...field(container, 'Characters').querySelectorAll('[role=option]')].find(
        (o) => o.textContent === name,
      );
      act(() => option.click());
    }
  };
  const addCharacters = (...names) => {
    pick(...names);
    click(button(container, 'Add Characters'));
  };
  const addFight = () => click(button(container, 'Add Fight'));
  const columns = () =>
    [...container.querySelectorAll('.character_name')].map((c) => c.textContent);
  const rows = () =>
    [...container.querySelectorAll('.experience-table tbody tr')].map(
      (tr) => tr.querySelector('td > div:not(.cell_controls)').textContent,
    );
  const summary = () => container.querySelector('.summary-cell')?.textContent;
  return { container, pick, addCharacters, addFight, columns, rows, summary };
};

// A drag as the browser reports it: start on a handle, over a target, drop on it
const dataTransfer = () => ({ setData() {}, setDragImage() {}, effectAllowed: '' });
const drag = (handle, target) => {
  act(() => Simulate.dragStart(handle, { dataTransfer: dataTransfer() }));
  act(() => Simulate.dragOver(target, { dataTransfer: dataTransfer() }));
  act(() => Simulate.drop(target, { dataTransfer: dataTransfer() }));
  act(() => Simulate.dragEnd(handle));
};

describe('building a plan', () => {
  test('starts with no table, then shows characters and fights as they are added', () => {
    const { container, addCharacters, addFight, columns, rows, summary } = mount();
    expect(container.querySelector('.experience-table')).toBeNull();
    addCharacters('Cleo', 'Pahn');
    addFight();
    addFight();
    expect(columns()).toEqual(['Cleo', 'Pahn']);
    expect(rows()).toHaveLength(2);
    expect(summary()).toContain('2 fights');
  });

  test('Generate EXP Table adds the picked characters and a fight together', () => {
    const { container, pick, columns, rows } = mount();
    pick('Flik');
    click(button(container, 'Generate EXP Table'));
    expect(columns()).toEqual(['Flik']);
    expect(rows()).toHaveLength(1);
  });

  test('an invalid party size turns the buttons off', () => {
    const { container } = mount();
    const input = field(container, 'Party Size').querySelector('input');
    act(() => Simulate.change(input, { target: { value: '9' } }));
    expect(button(container, 'Add Fight').disabled).toBe(true);
    expect(button(container, 'Generate EXP Table').disabled).toBe(true);
    act(() => Simulate.change(input, { target: { value: '4' } }));
    expect(button(container, 'Add Fight').disabled).toBe(false);
  });

  test('clicking a level cell sits that character out of that fight only', () => {
    const { container, addCharacters, addFight } = mount();
    addCharacters('Cleo');
    addFight();
    addFight();
    const cells = () => [...container.querySelectorAll('td.toggle')];
    click(cells()[1]);
    expect(cells().map((c) => c.classList.contains('char_disabled'))).toEqual([false, true]);
    click(cells()[1]);
    expect(cells().map((c) => c.classList.contains('char_disabled'))).toEqual([false, false]);
  });
});

describe('removing and undoing', () => {
  test('a removed fight comes back with Undo', () => {
    const { container, addCharacters, addFight, rows } = mount();
    addCharacters('Cleo');
    addFight();
    addFight();
    expect(button(container, 'Undo').disabled).toBe(true);
    click(container.querySelector('button.remove[title="Remove this fight"]'));
    expect(rows()).toHaveLength(1);
    expect(button(container, 'Undo').disabled).toBe(false);
    click(button(container, 'Undo'));
    expect(rows()).toHaveLength(2);
    expect(button(container, 'Undo').disabled).toBe(true);
  });

  test('a removed character comes back with Undo, and the table can be emptied and restored', () => {
    const { container, addCharacters, addFight, columns } = mount();
    addCharacters('Cleo');
    addFight();
    click(container.querySelector('button.remove[title="Remove Cleo"]'));
    expect(container.querySelector('.experience-table')).toBeNull();
    click(button(container, 'Undo'));
    expect(columns()).toEqual(['Cleo']);
  });
});

describe('importing', () => {
  const plan = {
    characters: [{ name: 'Flik', level: '5' }],
    fights: [{ enemy_group: { name: 'x', levels: [3, 3] }, party_size: '4', enabled: true }],
    disabled_characters: [[]],
  };
  const importFromStorage = (container, value) => {
    localStorage.setItem('exp-saved', value);
    click(button(container, 'Import'));
    const modalImport = [...document.querySelectorAll('.ui.modal button')].find(
      (b) => b.textContent === 'Import',
    );
    click(modalImport);
  };

  test('a saved plan replaces the table, and Undo returns to what was there', () => {
    const { container, addCharacters, addFight, columns, rows } = mount();
    addCharacters('Cleo');
    addFight();
    importFromStorage(container, JSON.stringify(plan));
    expect(columns()).toEqual(['Flik']);
    expect(rows()).toEqual(['x']);
    click(button(container, 'Undo'));
    expect(columns()).toEqual(['Cleo']);
  });

  test('something that is not a plan is refused without touching the table or the undo history', () => {
    const { container, addCharacters, addFight, columns } = mount();
    addCharacters('Cleo');
    addFight();
    importFromStorage(container, JSON.stringify({ fights: [] }));
    expect(columns()).toEqual(['Cleo']);
    expect(document.querySelector('.ui.modal').textContent).toContain(
      "isn't something that can be imported",
    );
    expect(button(container, 'Undo').disabled).toBe(true);
  });
});

describe('reordering', () => {
  test('dragging a row moves the fight and who is sitting it out', () => {
    const { container, addCharacters, addFight, rows } = mount();
    addCharacters('Cleo');
    addFight();
    addFight();
    addFight();
    // Tell the first fight apart from the others: Cleo sits it out
    click(container.querySelectorAll('td.toggle')[0]);
    const before = rows();
    const trs = () => [...container.querySelectorAll('.experience-table tbody tr')];
    drag(trs()[0].querySelector('.drag-handle-row'), trs()[2]);
    expect(rows()).toEqual(before); // same fight names, so look at who sits out instead
    const sitting = () =>
      [...container.querySelectorAll('td.toggle')].map((c) =>
        c.classList.contains('char_disabled'),
      );
    expect(sitting()).toEqual([false, false, true]);
  });

  test('dragging a column header moves the character', () => {
    const { container, addCharacters, addFight, columns } = mount();
    addCharacters('Cleo', 'Pahn', 'Flik');
    addFight();
    const ths = () => [...container.querySelectorAll('.experience-table thead th')];
    drag(ths()[1].querySelector('.drag-handle-column'), ths()[3]);
    expect(columns()).toEqual(['Pahn', 'Flik', 'Cleo']);
  });

  test('dragging something that did not start in the table does nothing', () => {
    const { container, addCharacters, addFight, columns } = mount();
    addCharacters('Cleo', 'Pahn');
    addFight();
    const th = container.querySelectorAll('.experience-table thead th')[2];
    act(() => Simulate.dragOver(th, { dataTransfer: dataTransfer() }));
    act(() => Simulate.drop(th, { dataTransfer: dataTransfer() }));
    expect(columns()).toEqual(['Cleo', 'Pahn']);
  });
});
