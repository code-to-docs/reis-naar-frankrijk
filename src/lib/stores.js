import { writable } from 'svelte/store';
export const gebruiker = writable('');
export const activePagina = writable('home');

// Snackbar notificaties
export const snackbar = writable(null);

export function toonSnackbar(tekst, type = 'success', emoji = '') {
  snackbar.set({ tekst, type, emoji });
}
