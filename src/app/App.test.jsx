import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { it } from 'vitest';
import { render } from 'test/render';
import App from './App';

it('renders without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
});
