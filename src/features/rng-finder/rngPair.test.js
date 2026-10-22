import { describe, expect, test } from 'vitest';
import { formatPair, twinOf } from './rngPair';

describe('rngPair', () => {
  test('the twin of a value is the same value with bit 31 flipped', () => {
    expect(twinOf(0x00a34468)).toBe(0x80a34468);
    expect(twinOf(0x80a34468)).toBe(0x00a34468);
    expect(twinOf(0)).toBe(0x80000000);
    expect(twinOf(0xffffffff)).toBe(0x7fffffff);
  });

  test('a value and its twin are shown the same way, bit 31 clear first', () => {
    expect(formatPair(0x00a34468)).toBe('0x00a34468 / 0x80a34468');
    expect(formatPair(0x80a34468)).toBe('0x00a34468 / 0x80a34468');
    expect(formatPair(0x12)).toBe('0x00000012 / 0x80000012');
  });
});
