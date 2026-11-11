import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { act, renderAsync, settle } from 'test/render';
import App from './App';

const BROKEN = "This link doesn't work";
const CRASHED = 'Something went wrong';

// Opens a form, makes the choices it needs, presses its submit button, and reports where that led
const submit = async (formPath, choices) => {
  let location;
  const container = await renderAsync(
    <MemoryRouter initialEntries={[formPath]}>
      <App />
      <Route
        path="*"
        render={({ location: here }) => {
          location = here;
          return null;
        }}
      />
    </MemoryRouter>,
  );
  for (const [label, option] of choices) {
    const field = [...container.querySelectorAll('.field')].find(
      (f) => f.querySelector('label')?.textContent === label,
    );
    const item = [...field.querySelectorAll('[role=option]')].find((o) => o.textContent === option);
    act(() => item.click());
  }
  act(() => container.querySelector('button[type=submit]').click());
  await settle(container);
  return { container, location };
};

// [form, the result page it should lead to, what has to be chosen before it can be submitted]
const FORMS = [
  ['/sequence', '/sequence/result', []],
  ['/npc', '/npc/result', []],
  ['/drops', '/drops/result', []],
  ['/chinchironin', '/chinchironin/result', []],
  ['/assassin', '/assassin/result', []],
  ['/kaku', '/kaku/result', []],
  ['/encounters', '/encounters/result', [['Areas', 'Cave of the Past']]],
  ['/stats/starting-stats', '/stats/starting-stats/result', [['Characters', 'Cleo']]],
  ['/stats/level-ups', '/stats/level-ups/result', [['Characters', 'Cleo']]],
  ['/runassist', '/runassist/result', [['Areas', 'Cave of the Past']]],
];

describe('every form leads to a working result page', () => {
  test.each(FORMS)('%s submits to %s', async (form, result, choices) => {
    const { container, location } = await submit(form, choices);
    expect(location.pathname).toBe(result);
    expect(location.search).not.toMatch(/undefined|NaN/);
    expect(container.textContent).not.toContain(BROKEN);
    expect(container.textContent).not.toContain(CRASHED);
    expect(container.querySelector('button[type=submit]')).toBeNull(); // left the form
  });
});

describe('every form starts from the default RNG value', () => {
  test.each([...FORMS.map(([form]) => form), '/rngfinder'])('%s', async (form) => {
    const container = await renderAsync(
      <MemoryRouter initialEntries={[form]}>
        <App />
      </MemoryRouter>,
    );
    expect(container.querySelector('input[name=rng]').value).toBe('0x00000012');
  });
});
