import { describe, expect, test } from 'vitest';
import { loadConfig } from './loadConfig';
import { initialState } from './reducers/config';

describe('loadConfig', () => {
  test('nothing saved gives the defaults', () => {
    expect(loadConfig(null)).toBe(initialState);
  });

  test('a saved setting wins over the default, the rest keep their defaults', () => {
    const config = loadConfig(
      JSON.stringify({
        compactMode: true,
        table: { rowHeight: 44 },
        hotkeys: { nextFight: 'j' },
      }),
    );
    expect(config.compactMode).toBe(true);
    expect(config.table).toEqual({ ...initialState.table, rowHeight: 44 });
    expect(config.hotkeys).toEqual({ ...initialState.hotkeys, nextFight: 'j' });
    expect(config.useImages).toBe(initialState.useImages);
  });

  test('a saved row style is merged over the default one, not swapped for it', () => {
    const config = loadConfig(JSON.stringify({ table: { rowStyle: { color: 'red' } } }));
    expect(config.table.rowStyle).toEqual({ ...initialState.table.rowStyle, color: 'red' });
  });

  test('saved columns replace the default columns', () => {
    const columns = [{ label: 'Index', key: 'index', width: 100, show: true }];
    expect(loadConfig(JSON.stringify({ columns })).columns).toEqual(columns);
  });

  test.each([
    ['text that is not JSON', 'not json {'],
    ['JSON that is not an object', '42'],
    ['null', 'null'],
    ['a list', '[1, 2]'],
  ])('%s gives the defaults', (_name, saved) => {
    expect(loadConfig(saved)).toBe(initialState);
  });

  test('a saved config without a table or hotkeys is still usable', () => {
    const config = loadConfig(JSON.stringify({ compactMode: true }));
    expect(config.table).toEqual(initialState.table);
    expect(config.hotkeys).toEqual(initialState.hotkeys);
  });
});
