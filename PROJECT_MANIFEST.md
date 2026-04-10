# PROJECT_MANIFEST.md

## Doel van de App
We bouwen een mobiel-vriendelijke, offline-first reisplanner voor een roadtrip naar Frankrijk (Cantal, Aubrac, Pyreneeën) in juni 2026. De app is primair voor Dennis en Franzi en moet snel, betrouwbaar en consistent aanvoelen op mobiel.

## Versiebeheer
We gebruiken een Major.Minor versiesysteem voor iteraties (`v1.0`, `v1.1`, ...).  
De huidige stabiele basis staat op **v1.1**.

## Harde Eisen & UI Standaarden (CRITICAL)
### STRICT VERBODEN
- Tailwind classes
- Shadcn
- Inline styles
- Hardcoded CSS-waarden in componenten (`px`, `rem`, `hex`, `rgba`, kleurnamen)

### VERPLICHT
- Uitsluitend token-based styling via:
  - `docs/UI_NORMPROFIEL.txt`
  - `src/lib/styles/ui-tokens.css`
  - `src/lib/styles/ui-norm-profile.css`
  - `src/app.css`

### UITZONDERINGEN
- Alleen bij specifieke layout-geometrie (bijv. complexe grid/kaart-overlay) mag beperkt afgeweken worden.
- Elke afwijking moet minimaal en expliciet gemotiveerd zijn.

## Token Spiekbriefje (Werkgeheugen)
- Kleuren: `var(--bg-app)`, `var(--bg-surface)`, `var(--text-primary)`, `var(--text-*)`, `var(--border-*)`, plus semantische status-tokens (`success`, `warning`, `error`).
- Typografie: `var(--font-sans)`, `var(--text-*)`, `var(--leading-normal)`, `--ui-widget-*`.
- Lay-out & Geometrie: `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`.
- Touch/Afmetingen: `var(--ui-btn-height)`, `var(--ui-btn-height-compact)`, `var(--ui-touch-compact)`, `var(--ui-touch-min)`.
- Standaard classes: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.btn-pill`, `.ui-chip`.

## Aanvullende UI Standaarden (v1.1)
- Pills/chips zijn uniform en subtiel: gebruik `.ui-chip` of app-brede pill classes (`.pill`, `.wl-pill`, `.gr-pill`, `.poi-pill`, `.cat-pill`) met token-gedreven actieve state.
- Filter-rij patroon is uniform: zoekveld links + filterknop rechts, beide met gelijke hoogte (`--ui-touch-min`) en afgeronde hoeken (`--radius-lg`).
- Budget categorie-kleuren gebruiken vaste tokens met hoog onderscheid:
  - `--budget-cat-dining`
  - `--budget-cat-boodschappen`
  - `--budget-cat-overnachting`
  - `--budget-cat-benzine`
  - `--budget-cat-tol`
  - `--budget-cat-uitjes`
  - `--budget-cat-overig`
- Regio-naamgeving is consistent en correct geaccentueerd in UI-teksten (o.a. `Lozère`, `Ariège`, `Pyrénées Ariégeoises`).

## Tech Stack
- SvelteKit 2
- Svelte 5 (Runes)
- Vite 8
- Firebase Firestore (client-side realtime)
- Vitest
- Vercel

## Rendering & Performance
- Geen SSR voor de app-shell (`ssr = false` op layout-niveau).
- Mobile-first performance blijft leidend.

## Architectuurprincipes
- Identity nu lokaal (`localStorage` gebruiker Dennis/Franzi), later vervangbaar door echte auth.
- Firestore security rules zijn functioneel maar nog te open; moeten aangescherpt worden.
- Focus op herbruikbare, uniforme componenten en voorspelbare UX-patronen.
