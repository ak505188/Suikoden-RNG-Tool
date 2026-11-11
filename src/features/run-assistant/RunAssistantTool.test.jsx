import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { act, render } from 'test/render';
import RunAssistantTool from './RunAssistantTool';

const URL =
  '/runassist/result?rng=18&iterations=2000&partylevel=0&realistic=true&areas=Cave+of+the+Past';

const mount = (url = URL) => {
  // A new element each time, so rendering again really re-renders
  const element = () => (
    <MemoryRouter initialEntries={[url]}>
      <RunAssistantTool />
    </MemoryRouter>
  );
  const container = render(element());
  return { container, rerender: () => render(element(), container) };
};
const patternMode = (container) => container.querySelector('.ui.checkbox input');

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('RunAssistantTool', () => {
  test('shows the controls for a good link', () => {
    const { container } = mount();
    expect(container.textContent).toContain('Pattern Mode');
    expect(container.textContent).not.toContain("This link doesn't work");
  });

  test('says the link is broken for a bad one', () => {
    const { container } = mount('/runassist/result?rng=soon');
    expect(container.textContent).toContain("This link doesn't work");
  });

  test('keeps the run when the page renders again', () => {
    const { container, rerender } = mount();
    expect(patternMode(container).checked).toBe(false);
    const label = container.querySelector('.ui.checkbox label');
    act(() => {
      Simulate.mouseDown(label);
      Simulate.mouseUp(label);
      Simulate.click(label);
    });
    expect(patternMode(container).checked).toBe(true);
    rerender();
    expect(patternMode(container).checked).toBe(true);
  });

  test.each([
    ['text that is not JSON', 'not json {'],
    ['a config without a table', JSON.stringify({ compactMode: false })],
  ])('opens with %s saved as the config', (_name, saved) => {
    localStorage.setItem('config', saved);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = mount();
    expect(container.textContent).toContain('Pattern Mode');
  });
});
