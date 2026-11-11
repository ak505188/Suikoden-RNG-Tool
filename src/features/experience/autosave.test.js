import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AUTOSAVE_KEY, loadAutosave, saveAutosave } from './autosave';

const plan = {
  characters: [{ name: 'Cleo', level: 3 }],
  fights: [{ enemy_group: { name: 'x', levels: [4] }, party_size: 6, enabled: true }],
  disabledCharacters: [['Cleo']],
};

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('autosave', () => {
  test('what is saved loads back as a plan', () => {
    saveAutosave(plan);
    expect(loadAutosave()).toEqual({
      characters: plan.characters,
      fights: plan.fights,
      disabled_characters: plan.disabledCharacters,
    });
  });

  test('nothing saved loads as null', () => {
    expect(loadAutosave()).toBeNull();
  });

  test('a plan with no character is not kept', () => {
    saveAutosave(plan);
    saveAutosave({ ...plan, characters: [] });
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
  });

  test('storage that refuses to save or to read does not interrupt anything', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveAutosave(plan)).not.toThrow();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadAutosave()).toBeNull();
  });
});
