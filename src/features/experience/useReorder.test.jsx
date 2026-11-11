import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { act, render } from 'test/render';
import { useReorder } from './useReorder';

// Items a, b, c in a list that reports each move
const mount = () => {
  const moves = [];
  let api;
  const List = () => {
    api = useReorder((from, to) => moves.push([from, to]));
    return null;
  };
  render(<List />);
  const event = () => ({ preventDefault: vi.fn() });
  return { moves, get: () => api, event };
};

describe('useReorder', () => {
  test('dropping on another item reports the move', () => {
    const { moves, get } = mount();
    act(() => get().start(0));
    act(() => get().drop(2));
    expect(moves).toEqual([[0, 2]]);
  });

  test('dropping where the drag started, or ending the drag, reports nothing', () => {
    const { moves, get } = mount();
    act(() => get().start(1));
    act(() => get().drop(1));
    act(() => get().start(1));
    act(() => get().end());
    act(() => get().drop(0)); // nothing is being dragged now
    expect(moves).toEqual([]);
  });

  test('dragging over an item marks it, and only while something from the list is dragged', () => {
    const { get, event } = mount();
    const idle = event();
    act(() => get().over(idle, 1));
    expect(get().overIndex).toBeNull();
    expect(idle.preventDefault).not.toHaveBeenCalled();

    act(() => get().start(0));
    const active = event();
    act(() => get().over(active, 2));
    expect(get().overIndex).toBe(2);
    expect(active.preventDefault).toHaveBeenCalled();
  });

  test('the dragged item is marked just after the drag starts, and everything clears on drop', () => {
    vi.useFakeTimers();
    const { get } = mount();
    act(() => get().start(1));
    expect(get().dragging).toBeNull();
    act(() => vi.runAllTimers());
    expect(get().dragging).toBe(1);
    act(() => get().drop(0));
    expect(get().dragging).toBeNull();
    expect(get().overIndex).toBeNull();
    vi.useRealTimers();
  });

  test('a drag that ends before the marking timer fires leaves nothing marked', () => {
    vi.useFakeTimers();
    const { get } = mount();
    act(() => get().start(1));
    act(() => get().end());
    act(() => vi.runAllTimers());
    expect(get().dragging).toBeNull();
    vi.useRealTimers();
  });
});
