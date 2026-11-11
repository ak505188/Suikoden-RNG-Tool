import { act } from 'react';
import { createRoot } from 'react-dom/client';

// Mounts React elements into the document for tests. Everything mounted is unmounted again after
// each test (see setup.js), so a test only has to call render().

const mounted = new Map(); // container -> root

const rootFor = (container) => {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  if (!mounted.has(container)) mounted.set(container, createRoot(container));
  return { container, root: mounted.get(container) };
};

// Renders `element` inside act() and returns its container. Pass a container that an earlier
// render() returned to render something new into the same root, as a parent re-rendering would.
export const render = (element, container) => {
  const target = rootFor(container);
  act(() => target.root.render(element));
  return target.container;
};

// Like render(), for pages whose code loads lazily: waits until the loading spinner has gone
export const renderAsync = async (element, container) => {
  const target = rootFor(container);
  await act(async () => target.root.render(element));
  for (let i = 0; i < 500 && target.container.querySelector('.ui.loader'); i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  return target.container;
};

export const cleanup = () => {
  for (const [container, root] of mounted) {
    act(() => root.unmount());
    container.remove();
  }
  mounted.clear();
};

export { act };
