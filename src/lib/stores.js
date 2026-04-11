import { writable } from 'svelte/store';

// Legacy stores for compatibility with provided scripts
export const activePagina = writable('home');
export const gebruiker = writable('');
export const darkMode = writable(false);

/**
 * @param {string} currentGebruiker
 */
export function toggleDarkMode(currentGebruiker) {
  darkMode.update(d => !d);
  // Optional: sync with localStorage or appState if needed
}
