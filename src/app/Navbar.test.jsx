import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { render } from 'test/render';
import Home from './Home';
import Navbar from './Navbar';
import { TOOLS, TOOL_GROUPS } from './tools';

const navbarAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
  );
const links = (container) => [...container.querySelectorAll('a')];

describe('Navbar', () => {
  test('links to Home and to every tool, each to its own page', () => {
    const container = navbarAt('/');
    const found = Object.fromEntries(
      links(container).map((a) => [a.getAttribute('href'), a.textContent]),
    );
    expect(found['/']).toBe('Home');
    for (const tool of TOOLS) expect(found[tool.path], tool.path).toBe(tool.name);
  });

  test('has one drop-down per group', () => {
    const container = navbarAt('/');
    const labels = [...container.querySelectorAll('.ui.dropdown > .text')].map(
      (t) => t.textContent,
    );
    expect(labels).toEqual(TOOL_GROUPS.map((group) => group.name));
  });

  test('marks the group you are in, also on a result page', () => {
    const active = (path) =>
      [...navbarAt(path).querySelectorAll('.ui.dropdown.active > .text')].map((t) => t.textContent);
    expect(active('/kaku')).toEqual(['Find your RNG']);
    expect(active('/kaku/result')).toEqual(['Find your RNG']);
    expect(active('/stats/level-ups/result')).toEqual(['Stats']);
    expect(active('/')).toEqual([]);
  });
});

describe('Home', () => {
  test('lists every tool that has a description, linked, and the repository', () => {
    const container = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const hrefs = links(container).map((a) => a.getAttribute('href'));
    for (const tool of TOOLS.filter((t) => t.description)) {
      expect(hrefs, tool.path).toContain(tool.path);
      expect(container.textContent).toContain(tool.description);
    }
    expect(hrefs).toContain('https://github.com/ak505188/Suikoden-RNG-Tool/tree/master');
  });

  test('does not list a tool that has no description', () => {
    const container = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const hrefs = links(container).map((a) => a.getAttribute('href'));
    for (const tool of TOOLS.filter((t) => !t.description)) expect(hrefs).not.toContain(tool.path);
  });
});
