# PROJECT_MANIFEST.md

## Doel van de App
Een mobiel-vriendelijke, offline-first reisplanner voor een roadtrip naar Frankrijk
(Cantal, Aubrac, Pyreneeën) in juni 2026, voor gebruikers Dennis en Franzi.

## Tech Stack
* **Framework:** SvelteKit 2 + Svelte 5 (Runes — zie Svelte-regels hieronder)
* **Build/Tooling:** Vite 8, Vitest 3 + JSDOM, Playwright 1.59
* **Database:** Firebase Firestore (client-side realtime, IndexedDB persistence actief)
* **Styling:** CSS tokens + UI normprofiel (`docs/UI_NORMPROFIEL.md`) — GEEN Tailwind/shadcn
* **Deployment:** Vercel — `export const ssr = false` op alle app-routes. Alleen `/api` routes
  mogen SSR gebruiken.

## Harde Eisen (CRITICAL)

### UI & Styling
* **VERBODEN:** Tailwind, Shadcn, inline styles, hardcoded CSS-waarden
  (`px`, `rem`, `hex`, `rgba`, kleurnamen).
* **VERPLICHT:** Uitsluitend CSS custom properties uit het token-systeem.
* **VERPLICHT:** Dark mode gaat automatisch via tokens — schrijf nooit handmatige
  dark mode overrides.

### Svelte 5 Runes
* **VERPLICHT:** `$state`, `$derived`, `$effect` voor alle reactieve state.
* **VERBODEN:** `writable()`, `readable()`, `derived()` uit `svelte/store` —
  uitzondering: bestaande code in `stores.svelte.js`.
* **VERBODEN:** `createEventDispatcher()` — gebruik callback props.
* **VERPLICHT:** Props via `interface Props` + `let { ... } = $props()`.
* **VERPLICHT:** Bestandsnamen PascalCase voor componenten, camelCase voor utilities.

### Data & Firestore
* **VERPLICHT:** `src/lib/types.ts` is de enige bron van waarheid voor datamodellen.
* **VERPLICHT:** Firestore collectienamen komen exact overeen met de TypeScript interfaces
  in `types.ts`.
* **VERBODEN:** Nieuwe collecties of velden introduceren zonder `types.ts` eerst bij
  te werken.
* **Offline:** Firestore IndexedDB persistence is geactiveerd in `firebase.ts`.
  Bij ontbrekende `PUBLIC_FIREBASE_*` variabelen gebruikt `firebase.ts` een
  fallback-config (read-only mock, geen writes).

### Architectuur
* Modulaire Svelte 5 composables — geen monolithische bestanden (>400 regels is een
  signaal).
* State via composables + context providers, geen prop-drilling.
* Auth is toekomstig werk — schrijf geen auth-code. Identiteit = `localStorage`
  (Dennis/Franzi).
* Nieuwe features volgen het patroon van `src/lib/features/gerechten/` als template.

## Niet-standaard Scripts
* `npm run test:visual:update` — Playwright visual regression baselines updaten.
* `npm run check` — Svelte-check validatie (verplicht voor PR).

## Token Spiekbriefje
* **Achtergronden:** `var(--bg-app)`, `var(--bg-surface)`, `var(--bg-surface-raised)`,
  `var(--bg-accent)`
* **Tekst:** `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`,
  `var(--text-accent)`
* **Randen:** `var(--border-default)`, `var(--border-subtle)`, `var(--border-focus)`
* **Status:** `--color-success-base`, `--color-error-base`, `--color-warning-base`
* **Typografie:** `var(--text-sm)`, `var(--text-base)`, `var(--text-lg)`,
  `var(--leading-normal)`
* **Spacing:** `var(--space-2)` (8px), `var(--space-4)` (16px), `var(--space-6)` (24px),
  `var(--space-8)` (32px), `var(--space-12)` (48px)
* **Radius & Shadow:** `var(--radius-md)`, `var(--radius-lg)`, `var(--shadow-sm)`,
  `var(--shadow-md)`
* **Motion:** `var(--duration-fast)` (100ms), `var(--duration-normal)` (200ms),
  `var(--ease-default)`
* **Touch:** Minimaal 44×44px voor primaire interactie
* **Classes:** `.button-primary`, `.button-secondary`, `.button-tertiary`,
  `.button-destructive`, `.badge`, `.chip`, `.card`