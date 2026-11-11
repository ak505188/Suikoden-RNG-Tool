import { initialState as configDefault } from './reducers/config';

// The config the config modal saved to local storage, laid over the defaults so a setting added
// since it was saved still has a value. Anything missing or unreadable falls back to the defaults.
export const loadConfig = (saved) => {
  if (saved === null) return configDefault;

  let config;
  try {
    config = JSON.parse(saved);
  } catch {
    return configDefault;
  }
  if (config === null || typeof config !== 'object' || Array.isArray(config)) return configDefault;

  return {
    ...configDefault,
    ...config,
    table: {
      ...configDefault.table,
      ...config.table,
      rowStyle: { ...configDefault.table.rowStyle, ...config.table?.rowStyle },
    },
    hotkeys: { ...configDefault.hotkeys, ...config.hotkeys },
  };
};
