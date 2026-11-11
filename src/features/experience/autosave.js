import { normalizeImport } from './lib';
import { planData } from './plan';

// The plan as it was when the page was last used, kept in local storage so a reload doesn't lose
// it. The key doesn't start with "exp", so it stays out of the Import list (see ImportModal).
export const AUTOSAVE_KEY = 'autosave-experience';

// The saved plan, checked like an import, or null if there is none or it can't be used
export const loadAutosave = () => {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    return saved === null ? null : normalizeImport(JSON.parse(saved));
  } catch {
    return null;
  }
};

// Saves the plan while it has a character in it (without one the page shows no table, so there is
// nothing to bring back); otherwise forgets it. Storage can be full or blocked, which is no reason
// to interrupt anything.
export const saveAutosave = (plan) => {
  try {
    if (plan.characters.length > 0) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(planData(plan)));
    } else {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  } catch {
    // keep going without saving
  }
};
