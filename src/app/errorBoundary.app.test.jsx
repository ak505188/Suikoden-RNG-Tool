import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import App from './App';

// One page that throws, to see what App does about it
vi.mock('features/kaku', () => ({
  Form: () => null,
  Result: () => {
    throw new Error('the kaku page broke');
  },
}));

test('a page that throws shows a message in its place, and the navbar stays', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  vi.spyOn(console, 'error').mockImplementation(() => {});

  await act(async () => {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/kaku/result']}>
        <App />
      </MemoryRouter>,
      container,
    );
  });

  for (let i = 0; i < 500 && container.querySelector('.ui.loader'); i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }

  expect(container.textContent).toContain('Something went wrong on this page');
  expect(container.textContent).toContain('the kaku page broke');
  expect(container.textContent).toContain('Experience'); // the navbar is still there

  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  vi.restoreAllMocks();
});
