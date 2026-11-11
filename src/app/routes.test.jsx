import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { act, render as mount, renderAsync } from 'test/render';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

afterEach(() => vi.restoreAllMocks());

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {}); // React logs what the boundary catches

const render = (element) => {
  quiet();
  return mount(element);
};

const page = (url) => {
  quiet();
  return renderAsync(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
};

const query = (params) => '?' + new URLSearchParams(params).toString();
const BROKEN = "This link doesn't work";
const CRASHED = 'Something went wrong';

// Each result page: a link that works, and the links a form or a stale bookmark could leave
const base = { rng: '0x12', iterations: 20 };
const results = {
  '/sequence/result': { good: base },
  '/npc/result': { good: { ...base, npcs: 2 } },
  '/stats/starting-stats/result': {
    good: { ...base, characters: 'Cleo', startingLevel: 1, levelsGained: 1 },
    bad: { ...base, characters: '', startingLevel: 1, levelsGained: 1 },
    unknown: { ...base, characters: 'Nobody', startingLevel: 1, levelsGained: 1 },
  },
  '/stats/level-ups/result': {
    good: { ...base, characters: 'Cleo', startingLevel: 1 },
    bad: { ...base, characters: '', startingLevel: 1 },
    unknown: { ...base, characters: 'Nobody', startingLevel: 1 },
  },
  '/encounters/result': {
    good: { ...base, offset: 0, partylevel: 0, realistic: true, areas: 'Cave of the Past' },
    bad: { ...base, offset: 0, partylevel: 0, realistic: true, areas: '' },
    unknown: { ...base, areas: 'Nowhere' },
  },
  '/drops/result': {
    good: { ...base, area: 'Cave of the Past', enemyGroup: 0 },
    bad: { ...base, area: '', enemyGroup: 0 },
    unknown: { ...base, area: 'Nowhere', enemyGroup: 0 },
  },
  '/runassist/result': {
    good: { ...base, iterations: 2000, partylevel: 0, realistic: true, areas: 'Cave of the Past' },
    bad: { ...base, partylevel: 0, realistic: true, areas: '' },
    unknown: { ...base, areas: 'Nowhere' },
  },
  '/chinchironin/result': {
    good: { ...base, frames_to_wait: 203, player: 'Tai Ho' },
    bad: { ...base, frames_to_wait: 203, player: '' },
    unknown: { ...base, frames_to_wait: 203, player: 'Nobody' },
  },
  '/assassin/result': { good: { rng: '0x12', range_start: 0, range_end: 20 } },
  '/kaku/result': { good: { rng: '0x12', start_index: 0, frames: 20 } },
};

describe.each(Object.entries(results))('%s', (path, { good, bad, unknown }) => {
  test('shows its result for a good link', async () => {
    const text = (await page(path + query(good))).textContent;
    expect(text).not.toContain(BROKEN);
    expect(text).not.toContain(CRASHED);
  });

  test('says the link is broken, instead of crashing, when it has no parameters at all', async () => {
    const text = (await page(path)).textContent;
    expect(text).toContain(BROKEN);
    expect(text).not.toContain(CRASHED);
  });

  test('says the link is broken when a value is not a number', async () => {
    const text = (await page(path + query({ ...good, rng: 'soon' }))).textContent;
    expect(text).toContain(BROKEN);
    expect(text).toContain('rng is not a number');
  });

  if (bad) {
    test('says the link is broken when nothing was chosen', async () => {
      const text = (await page(path + query(bad))).textContent;
      expect(text).toContain(BROKEN);
      expect(text).not.toContain(CRASHED);
    });
  }

  if (unknown) {
    test('says the link is broken when it names something that does not exist', async () => {
      const text = (await page(path + query(unknown))).textContent;
      expect(text).toContain(BROKEN);
      expect(text).not.toContain(CRASHED);
    });
  }

  test('offers a way back to the form', async () => {
    const container = await page(path);
    const back = [...container.querySelectorAll('a')].find((a) =>
      /back to the form/i.test(a.textContent),
    );
    expect(back).toBeTruthy();
  });
});

describe('ErrorBoundary', () => {
  const Broken = () => {
    throw new Error('this page broke');
  };

  test('shows the error instead of a blank page', () => {
    const text = render(
      <MemoryRouter>
        <ErrorBoundary resetKey="a">
          <Broken />
        </ErrorBoundary>
      </MemoryRouter>,
    ).textContent;
    expect(text).toContain(CRASHED);
    expect(text).toContain('this page broke');
  });

  test('works again once the page changes', () => {
    quiet();
    const show = (resetKey, child, container) =>
      mount(
        <MemoryRouter>
          <ErrorBoundary resetKey={resetKey}>{child}</ErrorBoundary>
        </MemoryRouter>,
        container,
      );

    const container = show('/a', <Broken />);
    expect(container.textContent).toContain(CRASHED);
    show('/b', <p>fine now</p>, container);
    expect(container.textContent).toContain('fine now');
  });
});

describe('forms that need a selection', () => {
  const submit = async (path) => {
    const button = (await page(path)).querySelector('button[type=submit]');
    return button;
  };

  test.each([
    '/stats/starting-stats',
    '/stats/level-ups',
    '/encounters',
    '/runassist',
    '/rngfinder',
  ])('%s keeps its submit button off until something is chosen', async (path) => {
    expect((await submit(path)).disabled).toBe(true);
  });

  test.each(['/sequence', '/npc', '/drops', '/chinchironin', '/assassin', '/kaku'])(
    '%s can be submitted straight away',
    async (path) => {
      expect((await submit(path)).disabled).toBe(false);
    },
  );
});

describe('the Realistic Mode checkbox', () => {
  // Clicking the label, as a person does: a click on the label itself, not on the input
  const clickLabel = (container) => {
    const label = container.querySelector('.ui.checkbox label');
    act(() => {
      Simulate.mouseDown(label);
      Simulate.mouseUp(label);
      Simulate.click(label);
    });
  };

  test.each(['/encounters', '/runassist'])('%s: clicking its label unticks it', async (path) => {
    const container = await page(path);
    const input = container.querySelector('.ui.checkbox input');
    expect(input.checked).toBe(true);
    clickLabel(container);
    expect(input.checked).toBe(false);
    clickLabel(container);
    expect(input.checked).toBe(true);
  });
});

describe('the RNG Finder fight picker', () => {
  const column = (container, label) =>
    [...container.querySelectorAll('label')].find((l) => l.textContent === label)
      .nextElementSibling;
  const findButton = (container) => container.querySelector('button[type=submit]');
  const add = (container, row) =>
    act(() => column(container, 'Add Fight').querySelectorAll('button')[row].click());

  test('Find RNG Seed waits for two fights and says how many are missing', async () => {
    const container = await page('/rngfinder');
    expect(findButton(container).disabled).toBe(true);
    expect(container.textContent).toContain('Pick at least 2 fights');
    add(container, 0);
    expect(findButton(container).disabled).toBe(true);
    expect(container.textContent).toContain('Pick 1 more fight');
    add(container, 1);
    expect(findButton(container).disabled).toBe(false);
    expect(container.textContent).not.toContain('Pick ');
  });

  test('the picked fights are listed in order, and one can be taken back', async () => {
    const container = await page('/rngfinder');
    add(container, 2);
    add(container, 0);
    const seen = () =>
      [...column(container, 'Fights Seen').querySelectorAll('button')].map((b) => b.textContent);
    expect(seen()).toHaveLength(2);
    const [first, second] = seen();
    act(() => column(container, 'Fights Seen').querySelectorAll('button')[0].click());
    expect(seen()).toEqual([second]);
    expect(first).not.toBe(second);
  });
});
