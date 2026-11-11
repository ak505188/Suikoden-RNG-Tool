import { describe, expect, test } from 'vitest';
import { PAGES } from './pages';
import { TOOLS, TOOL_GROUPS } from './tools';

describe('tools and pages', () => {
  test('no two pages share a path, and no two tools do', () => {
    const unique = (paths) => new Set(paths).size === paths.length;
    expect(unique(PAGES.map((page) => page.path))).toBe(true);
    expect(unique(TOOLS.map((tool) => tool.path))).toBe(true);
  });

  test('every tool in the navbar and on the home page has a page', () => {
    const paths = PAGES.map((page) => page.path);
    for (const tool of TOOLS) expect(paths).toContain(tool.path);
  });

  test('every page belongs to a tool, so it can be reached from the navbar', () => {
    for (const { path } of PAGES) {
      if (path === '/') continue;
      const owner = TOOLS.some((tool) => path === tool.path || path.startsWith(`${tool.path}/`));
      expect(owner, path).toBe(true);
    }
  });

  test('every group has a name and at least one tool', () => {
    for (const group of TOOL_GROUPS) {
      expect(group.name).toBeTruthy();
      expect(group.tools.length).toBeGreaterThan(0);
    }
  });
});
