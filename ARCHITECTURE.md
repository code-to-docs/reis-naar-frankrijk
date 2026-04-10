# ARCHITECTURE.md

## Mappenstructuur
```txt
src/
  app.css
  app.html
  routes/
    +layout.svelte
    +layout.js
    +page.svelte
    budget/+page.svelte
    campings/+page.svelte
    poi/+page.svelte
    meer/+page.svelte
    meer/[id]/+page.svelte
    api/weather-alerts/+server.ts
  lib/
    api/
      weatherApi.ts
      wikiApi.ts
    assets/
      favicon.svg
    components/
      Budget.svelte
      BudgetChart.svelte
      BudgetForm.svelte
      GedeeldeLijst.svelte
      GerechtenChecklist.svelte
      GerechtTipWidget.svelte
      Header.svelte
      Navigation.svelte
      Noodinfo.svelte
      OvernachtingenPlanner.svelte
      Snackbar.svelte
      SpotVanDeDag.svelte
      WeerWidget.svelte
      WildlifeChecklist.svelte
      budget/
      gerechten/
      overnachtingen/
      poi/
      weer/
      wildlife/
    services/
      overnachtingenService.ts
      poiService.ts
    styles/
      ui-tokens.css
      ui-norm-profile.css
    utils/
    config.ts
    firebase.ts
    stores.svelte.js
    types.ts
```

### Status
- **UI:** 100% compliant met `UI_NORMPROFIEL`.
- **Typing:** Alle componenten hebben `svelte-check` validatie zonder kritieke errors.
- **Regions:** Ariège (en subregio's) zijn canoniek geintegreerd in het wildlife systeem.
- **A11y:** Screenreader-ready door aria-labels en live regions.

### Overdracht voor volgende sessie
- De focus kan nu verschuiven naar de "Grote Kaart" feature.
- `GerechtenChecklist.svelte` is nog een relatief grote component die opsplitsing kan gebruiken.
- Overgang van LocalStorage naar Firebase Auth voor identity.

## Feature-to-File Mapping
- App shell en globale flows zitten in `src/routes/+layout.svelte` + `src/routes/+layout.js`.
- Dashboard/home zit in `src/routes/+page.svelte` met widgets:
  - `WeerWidget.svelte`
  - `SpotVanDeDag.svelte`
  - `GerechtTipWidget.svelte`

## UI & Componenten
De UI is gebouwd met een **strict design token systeem** (`src/lib/styles/ui-tokens.css`). Alle styling gebruikt CSS-variabelen voor spacing, kleuren en afronding.

### Overnachtingen Systeem
Dit systeem is onlangs gerefactored van een monoliet naar een modulaire opzet:
- `OvernachtingenPlanner.svelte`: Container component met alle business logic (Rune state).
- `OvernachtingenHeader.svelte`: Presentatie van titel en hoofdacties.
- `OvernachtingenStats.svelte`: Dynamische weergave van nachten en locatietellers.
- `OvernachtingenViewSwitcher.svelte`: Toggle voor de actieve weergave modus.
- `OvernachtingenListsSection.svelte`: De gedetailleerde lijst-weergaven.
- `OvernachtingenCalendarBoard.svelte`: De interactieve kalender.
- `OvernachtingenFormPanel.svelte`: De edit/create modal forms.

- Budget feature:
  - route: `src/routes/budget/+page.svelte`
  - component: `src/lib/components/Budget.svelte`
  - chart: `src/lib/components/BudgetChart.svelte`
- Overnachtingen:
  - route: `src/routes/campings/+page.svelte`
  - component: `src/lib/components/OvernachtingenPlanner.svelte`
  - submodules: `src/lib/components/overnachtingen/*`
- POI suggesties:
  - route: `src/routes/poi/+page.svelte`
  - service: `src/lib/services/poiService.ts`
  - UI: `src/lib/components/poi/*`
- Meer-sectie:
  - overzicht: `src/routes/meer/+page.svelte`
  - dynamische submodules: `src/routes/meer/[id]/+page.svelte`
  - loaded modules: `wildlife`, `gerechten`, `dagboek`, `activiteiten`, `paklijst`, `boodschappen`, `zwemplekken`, `noodinfo`

## Data Flow & Schema
- Data is realtime client-side via Firestore snapshots.
- Kerncontracten staan in `src/lib/types.ts`:
  - `Uitgave`
  - `Overnachting`
  - `Poi`
  - `Spotting`
  - `GerechtCheck`
- Er is geen relationele `tripId`-koppeling in de huidige v1.1.
- Entiteiten zijn functioneel gekoppeld via context en `door` (Dennis/Franzi), plus domein-ID’s:
  - wildlife spotting document-ID koppelt aan `wildlifeData` soort-ID
  - gerechten checks koppelen via `gerechtId`
  - budget/poi/overnachtingen delen dezelfde reiscontext

## State & UI Gedrag
- Global app state in `src/lib/stores.svelte.js` (gebruiker, snackbar, etc.).
- Gebruikerskeuze wordt lokaal bewaard (`localStorage`).
- Dashboard-spotlink deep-linkt nu naar specifieke wildlife kaart via query (`/meer/wildlife?open=<id>`), waarna de bijbehorende kaart automatisch opent.
