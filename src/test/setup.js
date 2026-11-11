import { afterEach } from 'vitest';
import { cleanup } from './render';

// Tells React that updates in tests are wrapped in act()
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);
