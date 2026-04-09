import { writable } from 'svelte/store';

export const gebruiker = writable('');

// Dark mode store
export const darkMode = writable(false);

export function initDarkMode(naam) {
  if (typeof localStorage === 'undefined' || !naam) return;
  const key = 'darkmode_' + naam.toLowerCase();
  const opgeslagen = localStorage.getItem(key);
  const isDark = opgeslagen === 'true';
  darkMode.set(isDark);
  applyDarkMode(isDark);
}

export function toggleDarkMode(naam) {
  if (typeof localStorage === 'undefined' || !naam) return;
  const key = 'darkmode_' + naam.toLowerCase();
  let nieuw;
  darkMode.update(v => {
    nieuw = !v;
    return nieuw;
  });
  localStorage.setItem(key, String(nieuw));
  applyDarkMode(nieuw);
}

function applyDarkMode(isDark) {
  if (typeof document === 'undefined') return;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Snackbar notificaties
export const snackbar = writable(null);
export function toonSnackbar(tekst, type = 'success', emoji = '') {
  snackbar.set({ tekst, type, emoji });
}