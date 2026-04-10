# PROJECT_MANIFEST.md

## Doel van de App
We bouwen een mobiel-vriendelijke, offline-first reisplanner voor een roadtrip naar Frankrijk (Cantal, Aubrac, Pyreneeën) in juni 2026. De app is primair voor Dennis en Franzi en moet snel, betrouwbaar en consistent aanvoelen op mobiel.

## Versiebeheer
We gebruiken een Major.Minor versiesysteem voor iteraties (`v1.0`, `v1.1`, ...).  
De huidige stabiele basis staat op **v1.1**.

### Status
- **UI:** 100% compliant met `UI_NORMPROFIEL` (SaaS Refactor voltooid).
- **Typing:** `svelte-check` is volledig groen; regio-types hardened.
- **Regions:** Ariège (en subregio's) zijn canoniek geintegreerd.
- **A11y:** Screenreader-ready door aria-labels en live regions.

### Overdracht voor volgende sessie
- De focus verschuift naar de "Grote Kaart" (Leaflet). De Tab is al aanwezig.
- `GerechtenChecklist.svelte` is de laatste grote monoliet die opsplitsing behoeft.
- Overgang naar Firebase Auth voor identity.

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
- Firestore security rules zijn functioneel en veldvalidatie is aangescherpt (v1.1).
- Focus op herbruikbare, uniforme componenten en voorspelbare UX-patronen.
- **UI Compliance:** Alle kerncomponenten zijn geaudit en tokenized (geen hardcoded CSS-debt meer in core UI).

### Overnachtingen Systeem
Dit systeem is onlangs gerefactored naar een moderne SaaS-layout:
- `OvernachtingenPlanner.svelte`: Container component met alle business logic (Rune state).
- `OvernachtingenHeader.svelte`: Compacte SaaS header met actieknoppen.
- `OvernachtingenTabs.svelte`: horizontaal tab-systeem met geïntegreerde KPI's.
- `OvernachtingenEmptyState.svelte`: Centrale empty-state kaart met SVG illustratie.
- `OvernachtingenCalendarBoard.svelte`: De interactieve kalender.
- `OvernachtingenListsSection.svelte`: De gedetailleerde lijst-weergaven.
- `OvernachtingenFormPanel.svelte`: De edit/create modal forms. SaaS UI.

| Status item | Waarde | Opmerking |
| :--- | :--- | :--- |
| **Audit Status** | ✅ 100% UI Normprofiel | Alle componenten zijn token-driven. |
| **Architectuur** | 🧩 Modular (Svelte 5) | `OvernachtingenPlanner` refactored naar SaaS UI. |
| **Wildlife Data** | 🐻 Verrijkt (incl. Ariège) | Types hardened voor regio-alignment. |
| **A11y/Contrast** | ♿ Geoptimaliseerd | Aria-labels en live regions toegevoegd. |
| **Build State** | 🟢 Green | 0 errors / 0 warnings in `svelte-check`. |
