# ARCHITECTURE.md

## 1. Mappenstructuur (De Ruimte)
Dit overzicht toont de fysieke indeling van het project.

```txt
src/
  app.css                 # Globale CSS en mapping van design tokens naar basisstijlen.
  app.html                # HTML-entrypoint (body, fonts, meta-tags).
  routes/                 # SvelteKit routing (file-based).
    +layout.svelte        # App shell: navigatie, gebruikerskeuze, globale state.
    +page.svelte          # Dashboard/Home: verzamelpunt van actieve widgets.
    budget/               # Module voor uitgavenbeheer en budgetoverzichten.
    campings/             # Module voor overnachtingen en reisplanning.
    poi/                  # Module voor Point of Interest suggesties.
    meer/                 # Groepsmenu voor submodules.
    meer/[id]/            # Dynamische routes voor wildlife, gerechten, noodinfo, etc.
    api/                  # Server-side endpoints (o.a. weather-alerts).
  lib/
    api/                  # Externe API-adapters (Open-Meteo, Wikipedia, Nominatim).
    components/           # Herbruikbare UI-elementen, gesorteerd op domein.
      budget/             # Specifieke UI voor uitgaven en settlement cards.
      overnachtingen/     # UI voor kalender, lijstweergaven en planners.
      poi/                # UI voor POI-cards en interactieve suggesties.
      weer/               # Weer-widgets en waarschuwings-banners.
      wildlife/           # UI voor de fauna-checklist en spotting-details.
    features/             # Zelfvoorzienende feature-modules (Svelte 5 standard).
      gerechten/          # Volledige proeverij-feature incl. logic & UI.
    services/             # Domeinlogica en Firestore-interacties.
    styles/               # Design tokens en het visuele normprofiel.
    utils/                # Pure helperfuncties voor data en UI-transformaties.
    firebase.ts           # Firebase/Firestore initialisatie en configuratie.
    stores.svelte.js      # Globale state (gebruiker, snackbar, thema).
    types.ts              # Centrale TypeScript contracten voor het hele project.

    2. Feature-to-File Mapping
App Shell: Beheerd in src/routes/+layout.svelte met navigatie in src/lib/components/Navigation.svelte.

Identiteit: Gebruikersselectie (Dennis/Franzi) via localStorage, gedistribueerd via src/lib/stores.svelte.js.

Budget & Uitgaven: Core logica in src/lib/components/Budget.svelte en data-invoer in src/lib/components/BudgetForm.svelte.

Overnachtingen: Modulair systeem met container OvernachtingenPlanner.svelte en submodules in src/lib/components/overnachtingen/.

POI Suggesties: Realtime suggestielijst v1 via src/lib/services/poiService.ts en src/routes/poi/+page.svelte.

Wildlife & Fauna: Checklist en spotting-persistence in src/lib/components/wildlife/.

Gerechten & Proeverij: Regionale food-tracking in src/lib/features/gerechten/ (Svelte 5 Composables).

Weer-informatie: Integratie van Open-Meteo en Météo-France alerts via src/lib/api/weatherApi.ts.

3. Data Flow & Schema
Persistence: Realtime client-side synchronisatie via Firebase Firestore snapshots.

Domeinmodellen: Vastgelegd in src/lib/types.ts (Uitgave, Overnachting, Poi, Spotting, GerechtCheck).

Koppelingen: Entiteiten zijn functioneel gekoppeld via het door veld (Dennis/Franzi); er is geen relationele tripId.

State: Componenten communiceren via Svelte 5 Runes en context providers om prop-drilling te voorkomen.