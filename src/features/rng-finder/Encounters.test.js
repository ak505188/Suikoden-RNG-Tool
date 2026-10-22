import { describe, expect, test } from 'vitest';
import Encounters from './Encounters';

const filled = (ids, size = ids.length) => {
  const encounters = new Encounters(size);
  ids.forEach((id, i) => encounters.push(id, 1000 + i));
  return encounters;
};

describe('Encounters', () => {
  test('is full once `size` battles have been pushed', () => {
    const encounters = new Encounters(3);
    encounters.push(1, 10);
    encounters.push(2, 20);
    expect(encounters.isFull()).toBe(false);
    encounters.push(3, 30);
    expect(encounters.isFull()).toBe(true);
  });

  test('search gives the first position a pattern occurs, or -1', () => {
    const encounters = filled([4, 1, 2, 1, 2, 3]);
    expect(encounters.search([1, 2])).toBe(1);
    expect(encounters.search([2, 3])).toBe(4);
    expect(encounters.search([3, 1])).toBe(-1);
    expect(encounters.search([4, 1, 2, 1, 2, 3])).toBe(0);
  });

  test('search can carry on from one past a match, and matches may overlap', () => {
    const encounters = filled([1, 1, 1, 2]);
    expect(encounters.search([1, 1])).toBe(0);
    expect(encounters.search([1, 1], 1)).toBe(1);
    expect(encounters.search([1, 1], 2)).toBe(-1);
  });

  test('search only looks at battles that were pushed', () => {
    const encounters = new Encounters(6);
    encounters.push(1, 10);
    encounters.push(2, 20);
    expect(encounters.search([2, 0])).toBe(-1); // the 0 is just empty buffer
  });

  test('group indexes up to 255 work, not only single hex digits', () => {
    const encounters = filled([0, 16, 200, 255]);
    expect(encounters.search([16, 200])).toBe(1);
    expect(encounters.search([200, 255])).toBe(2);
  });

  test('seedAt gives the RNG a battle started at, and null where there is none', () => {
    const encounters = filled([5, 6, 7], 6);
    expect(encounters.seedAt(0)).toBe(1000);
    expect(encounters.seedAt(2)).toBe(1002);
    expect(encounters.seedAt(-1)).toBeNull();
    expect(encounters.seedAt(3)).toBeNull();
  });

  test('keeps the end and carries on after it, so a pattern across the boundary is found', () => {
    const encounters = filled([9, 9, 1, 2], 4);
    encounters.rotateEndToStart(2);
    expect(encounters.isFull()).toBe(false);
    encounters.push(3, 2000);
    encounters.push(4, 2001);
    expect(encounters.isFull()).toBe(true);
    // [1, 2] came from the end of the first buffer, [3, 4] after it
    expect(encounters.search([1, 2, 3, 4])).toBe(0);
    expect(encounters.seedAt(0)).toBe(1002);
    expect(encounters.seedAt(2)).toBe(2000);
  });
});
