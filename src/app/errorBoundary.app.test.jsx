import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { renderAsync } from 'test/render';
import App from './App';

// One page that throws, to see what App does about it
vi.mock('features/kaku', () => ({
  Form: () => null,
  Result: () => {
    throw new Error('the kaku page broke');
  },
}));

test('a page that throws shows a message in its place, and the navbar stays', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const container = await renderAsync(
    <MemoryRouter initialEntries={['/kaku/result']}>
      <App />
    </MemoryRouter>,
  );

  expect(container.textContent).toContain('Something went wrong on this page');
  expect(container.textContent).toContain('the kaku page broke');
  expect(container.textContent).toContain('Experience'); // the navbar is still there

  vi.restoreAllMocks();
});
