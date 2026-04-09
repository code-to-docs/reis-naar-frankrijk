/**
 * Svelte 5 Global Application State (Runes)
 * Includes simple subscribe compatibility for legacy store consumers.
 */

class AppState {
  /** @type {string} */
  gebruiker = $state("");
  /** @type {boolean} */
  isDarkMode = $state(false);
  /** @type {{tekst: string, type: string, emoji: string} | null} */
  snackbar = $state(null);

  /** @type {Set<(value: string) => void>} */
  gebruikerSubs = new Set();
  /** @type {Set<(value: boolean) => void>} */
  darkModeSubs = new Set();
  /** @type {Set<(value: {tekst: string, type: string, emoji: string} | null) => void>} */
  snackbarSubs = new Set();

  /**
   * @param {string} username
   */
  init(username) {
    if (typeof localStorage === "undefined" || !username) return;
    this.gebruiker = username;
    this.notifyGebruiker();

    const key = `darkmode_${username.toLowerCase()}`;
    const opgeslagen = localStorage.getItem(key);
    this.isDarkMode = opgeslagen === "true";
    this.notifyDarkMode();
    this.applyDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (typeof localStorage !== "undefined" && this.gebruiker) {
      const key = `darkmode_${this.gebruiker.toLowerCase()}`;
      localStorage.setItem(key, String(this.isDarkMode));
    }
    this.notifyDarkMode();
    this.applyDarkMode();
  }

  applyDarkMode() {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", this.isDarkMode);
  }

  /**
   * @param {string} tekst
   * @param {string} [type]
   * @param {string} [emoji]
   */
  showSnackbar(tekst, type = "success", emoji = "") {
    this.snackbar = { tekst, type, emoji };
    this.notifySnackbar();

    setTimeout(() => {
      if (this.snackbar?.tekst === tekst) {
        this.snackbar = null;
        this.notifySnackbar();
      }
    }, 3000);
  }

  notifyGebruiker() {
    for (const fn of this.gebruikerSubs) fn(this.gebruiker);
  }

  notifyDarkMode() {
    for (const fn of this.darkModeSubs) fn(this.isDarkMode);
  }

  notifySnackbar() {
    for (const fn of this.snackbarSubs) fn(this.snackbar);
  }
}

export const appState = new AppState();

const noop = () => {};

/**
 * @template T
 * @param {Set<(value: T) => void>} set
 * @param {(value: T) => void} fn
 */
function addSub(set, fn) {
  set.add(fn);
  return () => set.delete(fn);
}

export const gebruiker = {
  /**
   * @param {(value: string) => void} fn
   */
  subscribe: (fn) => {
    fn(appState.gebruiker);
    return addSub(appState.gebruikerSubs, fn);
  }
};

export const darkMode = {
  /**
   * @param {(value: boolean) => void} fn
   */
  subscribe: (fn) => {
    fn(appState.isDarkMode);
    return addSub(appState.darkModeSubs, fn);
  }
};

export const snackbar = {
  /**
   * @param {(value: {tekst: string, type: string, emoji: string} | null) => void} fn
   */
  subscribe: (fn) => {
    fn(appState.snackbar);
    return addSub(appState.snackbarSubs, fn);
  }
};

/** @param {string} t @param {string} [type] @param {string} [e] */
export const toonSnackbar = (t, type, e) => appState.showSnackbar(t, type, e);
/** @param {string} n */
export const initDarkMode = (n) => appState.init(n);
export const toggleDarkMode = () => appState.toggleDarkMode();
export const unsubscribeNoop = noop;
