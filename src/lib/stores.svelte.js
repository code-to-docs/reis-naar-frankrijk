/**
 * Svelte 5 Global Application State (Runes)
 * Replaces traditional Svelte 4 writable stores for better performance.
 */

class AppState {
  gebruiker = $state('');
  isDarkMode = $state(false);
  snackbar = $state(null);

  constructor() {
    // We don't initialize localStorage here to avoid SSR issues
  }

  /**
   * Initialize state from localStorage
   */
  init(username) {
    if (typeof localStorage === 'undefined' || !username) return;
    this.gebruiker = username;
    
    const key = `darkmode_${username.toLowerCase()}`;
    const opgeslagen = localStorage.getItem(key);
    this.isDarkMode = opgeslagen === 'true';
    this.applyDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (typeof localStorage !== 'undefined' && this.gebruiker) {
      const key = `darkmode_${this.gebruiker.toLowerCase()}`;
      localStorage.setItem(key, String(this.isDarkMode));
    }
    this.applyDarkMode();
  }

  applyDarkMode() {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  showSnackbar(tekst, type = 'success', emoji = '') {
    this.snackbar = { tekst, type, emoji };
    // Auto-clear after 3 seconds
    setTimeout(() => {
      if (this.snackbar?.tekst === tekst) this.snackbar = null;
    }, 3000);
  }
}

// Single instance for the application
export const appState = new AppState();

// For transition compatibility, we can keep functions that components expect
export const gebruiker = { 
  subscribe: (fn) => { /* Mock for old stores if needed, but better to update components */ } 
};

// Simplified alias functions
export const toonSnackbar = (t, type, e) => appState.showSnackbar(t, type, e);
export const initDarkMode = (n) => appState.init(n);
export const toggleDarkMode = (n) => appState.toggleDarkMode();
export const darkMode = { subscribe: (fn) => { /* ditto */ } };