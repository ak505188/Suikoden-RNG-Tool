import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { render } from 'test/render';
import Home from './Home';
import { Routes as NAVBAR_ROUTES } from './Navbar';

const homeLinks = () =>
  [
    ...render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    ).querySelectorAll('a'),
  ].map((a) => a.getAttribute('href'));

describe('Home', () => {
  test('links to every tool in the navbar', () => {
    const links = homeLinks();
    for (const { path } of NAVBAR_ROUTES.filter((route) => route.path !== '/')) {
      expect(links, path).toContain(path);
    }
  });

  test('links to the tools that are not in the navbar', () => {
    const links = homeLinks();
    for (const path of ['/chinchironin', '/assassin', '/kaku']) expect(links, path).toContain(path);
  });

  test('links to the repository', () => {
    expect(homeLinks()).toContain('https://github.com/ak505188/Suikoden-RNG-Tool/tree/master');
  });
});
