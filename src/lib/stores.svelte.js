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
  /** @type {ReturnType<typeof setTimeout> | null} */
  snackbarTimer = null;

  /**
   * @param {string} username
   */
  init(username) {
    if (typeof localStorage === "undefined" || !username) return;
    this.gebruiker = username;

    const key = `darkmode_${username.toLowerCase()}`;
    let opgeslagen = null;
    try {
      opgeslagen = localStorage.getItem(key);
    } catch {
      opgeslagen = null;
    }
    this.isDarkMode = opgeslagen === "true";
    this.applyDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (typeof localStorage !== "undefined" && this.gebruiker) {
      const key = `darkmode_${this.gebruiker.toLowerCase()}`;
      try {
        localStorage.setItem(key, String(this.isDarkMode));
      } catch {
        // Ignore storage errors and keep current UI state.
      }
    }
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

    if (this.snackbarTimer) {
      clearTimeout(this.snackbarTimer);
      this.snackbarTimer = null;
    }

    this.snackbarTimer = setTimeout(() => {
      if (this.snackbar?.tekst === tekst) {
        this.snackbar = null;
      }
      this.snackbarTimer = null;
    }, 3000);
  }
}

export const appState = new AppState();

/** @param {string} t @param {string} [type] @param {string} [e] */
export const toonSnackbar = (t, type, e) => appState.showSnackbar(t, type, e);
