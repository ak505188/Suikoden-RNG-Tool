import { describe, expect, test } from 'vitest';
import { bool, int, list, oneOf, parseParams, string } from './params';

describe('parseParams', () => {
  test('reads each kind of value', () => {
    const schema = {
      rng: int(),
      name: string(),
      characters: list(),
      realistic: bool(),
      player: oneOf(['Tai Ho', 'Gaspar']),
    };
    const query =
      '?rng=0x12&name=Cave%20of%20the%20Past&characters=Cleo,Viktor&realistic=true&player=Gaspar';
    expect(parseParams(query, schema)).toEqual({
      params: {
        rng: 18,
        name: 'Cave of the Past',
        characters: ['Cleo', 'Viktor'],
        realistic: true,
        player: 'Gaspar',
      },
      problems: [],
    });
  });

  test('an int accepts hex and decimal', () => {
    expect(
      parseParams('?a=0x00000012&b=18&c=0x80000000', { a: int(), b: int(), c: int() }).params,
    ).toEqual({ a: 18, b: 18, c: 0x80000000 });
  });

  test('a parameter with no default is required, whether missing or empty', () => {
    expect(parseParams('', { rng: int() }).problems).toEqual(['rng is missing']);
    expect(parseParams('?rng=', { rng: int() }).problems).toEqual(['rng is missing']);
    expect(parseParams('?characters=', { characters: list() }).problems).toEqual([
      'characters is missing',
    ]);
  });

  test('a default fills in a missing or empty value, and the value wins when there is one', () => {
    const schema = { offset: int({ default: 0 }), realistic: bool({ default: true }) };
    expect(parseParams('', schema)).toEqual({
      params: { offset: 0, realistic: true },
      problems: [],
    });
    expect(parseParams('?offset=&realistic=', schema).params).toEqual({
      offset: 0,
      realistic: true,
    });
    expect(parseParams('?offset=500&realistic=false', schema).params).toEqual({
      offset: 500,
      realistic: false,
    });
  });

  test('says what is wrong with a bad value, and keeps reading the rest', () => {
    const { params, problems } = parseParams('?rng=0x12&iterations=lots&player=Nobody', {
      rng: int(),
      iterations: int(),
      player: oneOf(['Tai Ho', 'Gaspar']),
    });
    expect(params).toEqual({ rng: 18 });
    expect(problems).toEqual([
      'iterations is not a number ("lots")',
      'player must be one of: Tai Ho, Gaspar (not "Nobody")',
    ]);
  });

  test('a list drops empty entries', () => {
    expect(parseParams('?areas=a,,b,', { areas: list() }).params.areas).toEqual(['a', 'b']);
  });
});
