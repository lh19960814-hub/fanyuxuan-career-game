const SAVE_KEY = 'fanyuxuan-career-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGame(player) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return Boolean(loadSave());
}
