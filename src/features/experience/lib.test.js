import { describe, expect, test } from 'vitest';
import {
  calculateLevels,
  clampNumber,
  isValidPartySize,
  normalizeImport,
  parseLevel,
  parsePartySize,
} from './lib';

const fight = (levels, party_size = 6, enabled = true) => ({
  enemy_group: { name: 'test', levels },
  party_size,
  enabled,
});
const levelAfter = (level, levels, party_size) =>
  calculateLevels([{ name: 'A', level }], [fight(levels, party_size)], [[]])[0].characters[0].level;

describe('calculateLevels', () => {
  test('gains the table EXP split by party size, exact to the thousandth', () => {
    // enemies 7 levels below (20 EXP) and 6 above (5100 EXP) a level 1 character
    expect(levelAfter(1, [-6, 7], 1)).toBe(6.12);
    expect(levelAfter(1, [-6, 7], 2)).toBe(3.56);
    expect(levelAfter(1, [-6, 7], 4)).toBe(2.28);
    expect(levelAfter(1, [-6, 7], 5)).toBe(2.024);
  });

  test('gains at least 5 EXP', () => {
    expect(levelAfter(10, [1], 6)).toBe(10.005);
  });

  test('a level typed in as a string is still added to, not concatenated', () => {
    expect(levelAfter('10', [1], 6)).toBe(10.005);
    expect(levelAfter('10', [12], 6)).toBe(10.15);
  });

  test('results never carry more than 3 decimals', () => {
    for (let level = 1; level <= 40; level += 3.5) {
      for (let party = 1; party <= 6; party++) {
        for (let enemy = 1; enemy <= 60; enemy += 7) {
          const result = levelAfter(level, [enemy, enemy + 1], party);
          expect(Math.abs(result * 1000 - Math.round(result * 1000))).toBeLessThan(1e-6);
        }
      }
    }
  });

  test('each fight starts from the level the last one ended at', () => {
    const results = calculateLevels(
      [{ name: 'A', level: 10 }],
      [fight([12], 6), fight([12], 6)],
      [[], []],
    );
    expect(results.map((r) => r.characters[0].level)).toEqual([10.15, 10.3]);
  });

  test('disabled fights and characters are skipped', () => {
    const characters = [
      { name: 'A', level: 10 },
      { name: 'B', level: 10 },
    ];
    const [first, second] = calculateLevels(
      characters,
      [fight([12], 6), fight([12], 6, false)],
      [['B'], []],
    );
    expect(first.characters.map((c) => c.level)).toEqual([10.15, 10]);
    expect(second.characters.map((c) => c.level)).toEqual([10.15, 10]);
  });
});

describe('input normalization', () => {
  test('clampNumber parses strings, clamps, and falls back on junk', () => {
    expect(clampNumber('05', 1, 99, 1)).toBe(5);
    expect(clampNumber('10.', 1, 99, 1)).toBe(10);
    expect(clampNumber('120', 1, 99, 1)).toBe(99);
    expect(clampNumber('0', 1, 99, 1)).toBe(1);
    expect(clampNumber('', 1, 99, 7)).toBe(7);
    expect(clampNumber('abc', 1, 99, 7)).toBe(7);
  });

  test('parseLevel keeps levels in range to the thousandth', () => {
    expect(parseLevel('10.12345')).toBe(10.123);
    expect(parseLevel('99.9')).toBe(99);
    expect(parseLevel('')).toBe(1);
    expect(typeof parseLevel('10')).toBe('number');
  });

  test('isValidPartySize accepts whole numbers 1-6 only', () => {
    for (const ok of [1, 6, '3', '6']) expect(isValidPartySize(ok)).toBe(true);
    for (const bad of ['', '0', 0, 7, '2.5', 'abc', null, undefined, -1]) {
      expect(isValidPartySize(bad)).toBe(false);
    }
  });

  test('parsePartySize clamps to a whole number 1-6', () => {
    expect(parsePartySize('4')).toBe(4);
    expect(parsePartySize('9')).toBe(6);
    expect(parsePartySize('0')).toBe(1);
    expect(parsePartySize('')).toBe(6);
  });

  test('normalizeImport turns string levels and party sizes from old exports into numbers', () => {
    const imported = normalizeImport({
      characters: [{ name: 'A', level: '10' }],
      fights: [{ ...fight([12], '6') }],
      disabled_characters: [[]],
    });
    expect(imported.characters[0].level).toBe(10);
    expect(imported.fights[0].party_size).toBe(6);
    expect(imported.disabled_characters).toEqual([[]]);
    const [result] = calculateLevels(
      imported.characters,
      imported.fights,
      imported.disabled_characters,
    );
    expect(result.characters[0].level).toBe(10.15);
  });
});
