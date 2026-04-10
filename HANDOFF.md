# HANDOFF.md

## 1) Project Essence

**Project:** `reis-naar-frankrijk`  
**Doel:** een gedeelde reisplanner voor Frankrijk met focus op overzicht, snelle invoer en mobiele bruikbaarheid.

**Huidige stack (feitelijk):**
- SvelteKit 2 + Svelte 5 (Runes)
- Vite 8
- Firebase Firestore (client-side realtime)
- Vitest (unit tests)
- CSS tokens + UI normprofiel in eigen stylesheets (geen Tailwind/shadcn)
- Vercel deployment

**Belangrijk:** de template in eerdere prompts noemde Next.js/Turso/Drizzle/Tailwind, maar dit project draait op **SvelteKit + Firestore + token-based CSS**.

---

## 2) Current Architecture

### Root structuur (actieve delen)

```txt
src/
  lib/
    api/
    components/
      poi/
      wildlife/
      gerechten/
      overnachtingen/
      budget/
      weer/
    services/
    styles/
    utils/
    config.ts
    firebase.ts
    stores.svelte.js
    types.ts
  routes/
    +layout.svelte
    +page.svelte
    budget/+page.svelte
    campings/+page.svelte
    poi/+page.svelte
    meer/+page.svelte
    meer/[id]/+page.svelte
    api/weather-alerts/+server.ts
  app.css
docs/
  UI_NORMPROFIEL.txt
  POI_SUGGESTIELIJST_V1_IMPLEMENTATIEPLAN.md
firestore.rules
.env.example
```

### Routing-opzet

- `src/routes/+layout.svelte`
  - app shell
  - gebruikerselectie (`Dennis` / `Franzi`) via `localStorage`
  - global dark mode toggle flow
  - globale `Header`, `Navigation`, `Snackbar`
- `src/routes/+page.svelte`
  - dashboard/home (weer + widgets + quick actions)
- `src/routes/budget/+page.svelte`
  - budgetmodule
- `src/routes/campings/+page.svelte`
  - overnachtingenplanner
- `src/routes/poi/+page.svelte`
  - nieuwe POI suggestielijst v1
- `src/routes/meer/+page.svelte`
  - menupagina met groepen
- `src/routes/meer/[id]/+page.svelte`
  - **dynamische route** voor submodules:
    - `activiteiten`
    - `gerechten`
    - `paklijst`
    - `boodschappen`
    - `zwemplekken`
    - `wildlife`
    - `dagboek`
    - `noodinfo`
- `src/routes/api/weather-alerts/+server.ts`
  - server endpoint voor officiële Météo-France alertaggregatie + cache

---

## 3) Database Schema State (Firestore Equivalent)

Er is **geen** `schema.ts` (SQL ORM) in deze codebase.  
Datacontracten staan in `src/lib/types.ts` + daadwerkelijke collectiegebruik in services/components.

### Kern-typen (equivalent van schema-definitie)

```ts
// src/lib/types.ts (relevante domeinen)
export interface Uitgave {
  id?: string;
  bedrag: number;
  categorie: string;
  omschrijving: string;
  door: string;
  datum: Timestamp;
}

export interface Overnachting {
  id?: string;
  naam: string;
  door: string;
  shortlist?: boolean;
  type?: "hotel" | "bnb" | "camping";
  adres?: string;
  startDatum?: string;
  nachten?: number;
  latitude?: number | null;
  longitude?: number | null;
  notities?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  mapsLink?: string;
  openStreetMapUrl?: string;
  datum?: Timestamp;
}

export type PoiCategorieId =
  | "cultuur"
  | "natuur"
  | "activiteit"
  | "eten_drinken"
  | "winkelen"
  | "overig";

export type PoiScore = 1 | 2 | 3;

export interface Poi {
  id?: string;
  naam: string;
  categorie: PoiCategorieId;
  score: PoiScore;
  omschrijving?: string;
  locatieNaam?: string;
  mapsLink?: string;
  websiteUrl?: string;
  door: string;
  toegevoegdOp?: Timestamp | string | null;
  bijgewerktOp?: Timestamp | string | null;
  bezocht?: boolean;
  bezochtOp?: Timestamp | string | null;
}

export interface Spotting {
  id?: string;
  gespot: boolean;
  door: string;
  datum: Timestamp | string;
  notitie?: string;
  locatie?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  openStreetMapUrl?: string;
}

export interface GerechtCheck {
  id?: string;
  gerechtId: string;
  door: string;
  geproefd?: boolean;
  datum?: Timestamp | string | null;
  rating?: number;
}
```

### Actief collectiegebruik

- `uitgaven` (budget entries)
- `instellingen/budget` (budget totaal)
- `campings` (overnachtingen)
- `poi_suggesties` (nieuwe POI feature)
- `wildlife` (spottings)
- `gerechten_checks` (food tasting state)
- generieke lijsten via `GedeeldeLijst`: `activiteiten`, `paklijst_dennis`, `paklijst_franzi`, `boodschappen`, `zwemplekken`, `dagboek`, etc.

### Relaties tussen domeinen (conceptueel)

- Er is geen formele `tripId` relationele sleutel.
- Relaties zijn functioneel en implicit:
  - `door` koppelt acties aan gebruiker (Dennis/Franzi)
  - `wildlife` koppelt spotting state aan `wildlifeData` op `id`
  - `gerechten_checks` koppelt checks aan `gerechtenData` op `gerechtId`
  - POI en overnachtingen zijn losstaande planningsdomeinen binnen dezelfde reiscontext
- De app is momenteel single-trip/single-context (geen multi-trip tenancy model).

---

## 4) Completed Features (huidige status)

### 100% aanwezig in codebase

- Realtime Firestore flows voor budget, overnachtingen, POI, wildlife en gedeelde lijsten.
- Nieuwe POI suggestielijst v1:
  - score 1-3
  - categorieconfig
  - filter/sort/search
  - modal CRUD
  - bezocht toggle
- Dashboard quick actions als klikbare widgets (navigeren via hele kaart).
- Home widget voor “Nieuwe uitgave” opent `budget?nieuw=1`.
- “Laatste spotting” en “Proeftip” widgets uniformer gemaakt via UI tokens.
- Weather module:
  - Open-Meteo forecast
  - Nominatim reverse geocoding
  - server-side Météo-France alert endpoint met caching
- Overnachtingenplanner met:
  - shortlist + planning
  - kalenderweergave
  - link-outs naar Maps
- Wildlife checklist met filters, expand, spotting persistence en Wikipedia-image loading/cache.
- Gerechten checklist met status/rating per user.
- UI normprofiel aanwezig:
  - `src/lib/styles/ui-norm-profile.css`
  - mapping in `src/app.css`

### Gevalideerd in huidige state

- `npm run test` OK (12 tests)
- `npm run check` OK (0 errors/warnings)
- `npm run build` OK

---

## 5) Pending Tasks & Roadmap

### Korte termijn (stabiliteit / basis)

1. Security model aanscherpen (nu grotendeels `allow read, write: if true`).
2. UI norm handhaving verder automatiseren (lint/checklist per component change).
3. Verdere opsplitsing van resterende grote componenten:
   - `OvernachtingenPlanner.svelte` (nu opgeschoond via `overnachtingen/plannerUtils.ts`, verdere UI-splitsing nog mogelijk)
   - `GerechtenChecklist.svelte` (nu opgeschoond via `gerechten/regionUtils.ts`, foto/check-flow kan nog verder modulair)
   - `wildlife/WildlifeCard.svelte` (nu opgeschoond via `wildlife/locationUtils.ts`, detail-UI nog omvangrijk)

### Middellange termijn (kwaliteit)

1. Testdekking uitbreiden buiten utils:
   - component gedrag
   - service-laag
   - kritische flows (POI CRUD, budget mutaties, filters)
2. Hardcoded kleuren reduceren naar tokens in oudere modules.
3. `PROJECT_EXPORT_SHEET.txt` actualiseren of vervangen door deze handoff als bron.
4. Legacy pad opschonen:
   - oude `pois` collectie usage/documentatie verduidelijken
   - generieke lijstcomponent verder afbakenen vs domeinspecifieke features

### Product doorontwikkeling

1. Grote Kaart (integratie van overnachtingen, POI en zwemplekken) volgens plan in sectie 12.
2. Offline-first doorontwikkeling (Firestore + Service Worker + sync-UX) volgens plan in sectie 12.
3. Routeplanning (afstand/reistijd tussen overnachtingen) volgens plan in sectie 12.
4. Multi-trip model introduceren (`tripId`) voor schaalbare data-isolatie.
5. Auth toevoegen i.p.v. alleen localStorage-identity.
6. POI uitbreiding:
   - optionele afstand/regio hints
   - planning-koppeling met overnachtingen
7. Observability verbeteren (error reporting / runtime logging).

---

## 6) Environment & Secrets

Benodigde env vars (public client config):

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

### Belangrijke runtime-eigenschap

- `src/lib/firebase.ts` gebruikt env vars met een fallback-config.
- Bij ontbrekende `PUBLIC_FIREBASE_*` variabelen logt de app een waarschuwing en gebruikt de fallback-config.
- Geen secrets/tokens hardcoden in code.

---

## 7) Active Context / Pain Points

1. **Security debt**
   - Veel collecties staan open (`allow read, write: if true`).
   - Past bij huidige lokale identity aanpak, maar is niet productiehard voor echte gebruikersaccounts.

2. **UI consistency debt in legacy modules**
   - Nieuwe widgets en POI volgen tokens beter.
   - Oudere onderdelen bevatten nog hardcoded sizing/kleuren en grotere stijlvariatie.

3. **Monolithische componenten**
   - Eerste refactorronde afgerond: helpers verplaatst naar losse modules en budget-UI opgesplitst.
   - Er blijven nog grote Svelte-bestanden over met gecombineerde concerns (state, data, view, interaction).
   - Vertraagt onboarding en verhoogt regressierisico bij wijzigingen.

4. **Test focus nog smal**
   - Nu vooral utils; weinig regressiebescherming op UI/workflowniveau.

---

## 8) UI Norm & Uniformiteit (actieve afspraken)

Bronnen:
- `docs/UI_NORMPROFIEL.txt`
- `src/lib/styles/ui-norm-profile.css`
- `src/app.css`

Kern:
- 1 primaire fontfamilie
- token-based font sizes en spacing
- consistente button-hoogtes (`--ui-btn-height`, `--ui-btn-height-compact`)
- widget-typografie via `--ui-widget-*` tokens
- toegankelijke touch targets en zichtbare focus

Button norm (huidige standaard):
- Primair: `.btn-primary`
- Secundair: `.btn-secondary`
- Ghost/icon/pill varianten via `.btn-ghost`, `.btn-icon`, `.btn-pill`
- Geen ad-hoc afwijkende button-typografie buiten token-systeem

---

## 9) Deploy Context

- Vercel Project ID: `prj_Nw9aSI9x6zUieT4IKuz0jTYD4qPz`
- Vercel Team ID: `team_DscHdNqKIfx1IMjBo1jTHhxk`
- Lokale branch: `main`
- HEAD tijdens deze export: `1f64335`

---

## 10) Fast Start voor Volgende Agent

1. Installeer dependencies: `npm install`
2. Vul `.env` met `PUBLIC_FIREBASE_*`
3. Run lokaal: `npm run dev`
4. Baseline checks:
   - `npm run test`
   - `npm run check`
   - `npm run build`
5. Eerste technische check: security-rules aanscherpen voor productiegebruik.

---

## 11) Samenvatting

De codebase is functioneel, build-stabiel en heeft een duidelijke UI-normalisatiebasis.  
Grootste winst voor de volgende iteratie zit in: security/rules hardening, opsplitsen van grote componenten, en verbreden van testdekking.  
Voor featuregroei is het raadzaam om als volgende architectuurstap `tripId` en echte auth in te voeren.

---

## 12) Implementatieplan Nieuwe Features (Q2 2026)

### 12.1 Doel en randvoorwaarden

Doel:
- Grote Kaart: alle relevante reispunten in 1 overzicht.
- Offline-first: bruikbaar zonder bereik in berggebied.
- Routeplanning: automatische afstand en reistijd tussen overnachtingen.

Niet-onderhandelbare randvoorwaarden:
- UI-conformiteit met `docs/UI_NORMPROFIEL.txt` en tokens in `src/lib/styles/ui-norm-profile.css`.
- Consistente UX-patronen: card-opbouw, action-rows, touch-targets en chip-stijl.
- Mobile-first performance: geen extra server-latentie introduceren (SSR blijft uit voor app-shell).
- Progressieve uitrol: elke fase levert zelfstandig waarde en heeft rollback-optie.

### 12.2 Feature 1: Grote Kaart

Fase 1A - Datamodel en adapters:
- Introduceer `MapItem`-contract in `src/lib/types.ts` (of `src/lib/types/map.ts`) met:
  - `id`, `bron`, `categorie`, `titel`, `subtitel`, `lat`, `lon`, `status`, `links`.
- Voeg adapters toe:
  - `campings` -> `MapItem`
  - `poi_suggesties` -> `MapItem`
  - `zwemplekken` -> `MapItem` (coordinaten uit link of expliciet veld)
- Voeg validatie toe voor ontbrekende coordinaten (items blijven zichtbaar in lijst, niet op kaart).

Fase 1B - Nieuwe route en navigatie:
- Nieuwe pagina `src/routes/kaart/+page.svelte`.
- Voeg entry toe in `src/routes/meer/+page.svelte` en `src/lib/components/Navigation.svelte`.
- Pagina-opbouw volgens UI-profiel:
  - header + filterchips + kaartvlak + detailpaneel/bottom-sheet.

Fase 1C - Kaartengine:
- Start met Leaflet (snelle implementatie, licht en stabiel), met adapterlaag voor latere MapLibre-switch.
- Lazy-load van kaartcomponent in browser (`onMount`) om init-kosten te beperken.
- Marker-clustering en categoriegebonden markerstijlen (token-driven kleuren).

Fase 1D - Interactie en UX-uniformiteit:
- Uniforme filterchips (`.ui-chip` varianten), geen ad-hoc styling.
- Klik op marker opent gestandaardiseerde detailcard (zelfde info-ritme als andere modules).
- Lijst<->kaart synchronisatie (selectie in kaart highlight in lijst en omgekeerd).

Fase 1E - Acceptatie:
- Functioneel:
  - alle punten met geldige coordinaten zichtbaar op kaart;
  - filtering werkt consistent op mobiel en desktop.
- UX:
  - alle controls minimaal `--ui-touch-compact`/`--ui-touch-min`;
  - dark mode en contrast volgens normprofiel.
- Performance:
  - geen regressie op TTFB;
  - kaart init pas na client-hydratatie.

### 12.3 Feature 2: Offline-first

Fase 2A - Baseline en audit:
- Behoud huidige Firestore offline persistence (`persistentLocalCache`) als basis.
- Audit van offline gedrag per kernmodule: budget, campings, POI, wildlife, zwemplekken.

Fase 2B - Service Worker strategie aanscherpen:
- Uitbreid `src/service-worker.js` met duidelijke cache-strategieën:
  - app shell/static: cache-first;
  - eigen API (`/api/*`): network-first + cache fallback;
  - kaarttiles/externen: stale-while-revalidate met harde limiet.
- Cache-limieten per bron instellen om storage-bloat te voorkomen.

Fase 2C - Offline synchronisatie-UX:
- Centrale sync-state store (`online`, `pendingWrites`, `lastSyncAt`, `syncErrors`).
- Uniforme statusindicator in header/nav (token-based chip, geen aparte visuele taal).
- Per formulier duidelijke states:
  - "Lokaal opgeslagen"
  - "Wacht op synchronisatie"
  - "Gesynchroniseerd"

Fase 2D - Conflictbeleid:
- Laatste write wint waar acceptabel; voor kritische velden optioneel merge-notitie.
- Timestamps normaliseren en conflictgeval loggen (runtime observability).

Fase 2E - Acceptatie:
- App bruikbaar voor kernflows zonder netwerk.
- Herconnectie synchroniseert zonder dataverlies.
- UX blijft consistent met bestaande action-rows, chips en feedbackpatronen.

### 12.4 Feature 3: Routeplanning tussen overnachtingen

Fase 3A - Provider-abstraction:
- Introduceer `routeProvider` interface in `src/lib/services/routes/`:
  - `getRoute(from, to) -> { distanceKm, durationMin, polyline }`.
- Start met 1 provider (bijv. OSRM of OpenRouteService) achter adapter.
- Geen provider-lock-in in componentcode.

Fase 3B - Datastroom:
- Gebruik geordende overnachtingen (`startDatum`) als input.
- Bereken segmenten tussen opeenvolgende overnachtingen.
- Cache segmenten lokaal met TTL om API-calls te beperken.

Fase 3C - UI integratie:
- In `campings`:
  - toon per overgang `afstand` + `reistijd` als compacte infochips;
  - toon totaalsom per trajectblok.
- In `kaart`:
  - optionele route-lijn overlay;
  - toggles voor zichtbaarheid (route aan/uit).
- Styling conform UI-profiel, geen losse typografie/kleurpatronen.

Fase 3D - Fallbacks:
- Bij geen routeprovider of timeout: toon rechte-lijn afstand als benadering met duidelijke label.
- Offline: toon laatst bekende routeberekening uit cache.

Fase 3E - Acceptatie:
- Segmenten correct voor alle geplande overnachtingen met coordinaten.
- Duidelijke fout-/fallbackstates zonder UX-breuk.
- Geen TTFB-regressie door routecalls (alles client-side of async achtergrondflow).

### 12.5 Volgorde en delivery-plan

Stap 1 (laag risico, hoog rendement):
- Fase 1A + 1B + 1C (kaart basis met markers).

Stap 2:
- Fase 2A + 2B (offline cachestrategie) parallel met 1D.

Stap 3:
- Fase 3A + 3B (route-engine basis en caching).

Stap 4:
- Fase 2C + 2D + 3C (sync-UX en route in UI).

Stap 5:
- End-to-end QA, performance-check, accessibility-check, gefaseerde rollout.

### 12.6 Test- en kwaliteitsstrategie

- Unit tests:
  - map-adapters, routeberekening, offline cachehelpers.
- Component tests:
  - kaartfilters, routechips, sync-statusweergave.
- Handmatige e2e-checks:
  - mobiel online/offline wissel;
  - koude start + navigatie naar `/kaart`, `/campings`, `/poi`.
- UI-review checklist verplicht per feature PR op basis van UI normprofiel.

---

## 13) Onderhoudslog

### 2026-04-10 14:57:18 +02:00

- UI normprofiel nu repo-breed doorgevoerd op alle hoofdschermen en onderliggende componenten:
  - token-first styling actief voor `/`, `/budget`, `/campings`, `/poi`, `/meer`, `/meer/[id]`;
  - resterende hardcoded hex-kleuren in app/component styles verwijderd (uitzondering: HTML entities zoals `&#9733;` in markup, geen CSS-kleur).
- Globale stylelaag opgeschoond:
  - `src/app.css` verder geharmoniseerd naar semantische tokens;
  - legacy dark-mode overrides teruggebracht naar token-gedreven waarden;
  - overmatige `!important`-overridepatronen verwijderd buiten reduced-motion regels in tokenbestanden.
- Grote componenten extra gemigreerd voor UX-uniformiteit:
  - `OvernachtingenPlanner` + subcomponenten (`overnachtingen/*`),
  - `GerechtenChecklist` + `gerechten/*`,
  - `wildlife/WildlifeCard.svelte` + `wildlife/WildlifeStats.svelte`,
  - `Budget` + `budget/*`,
  - `poi/*`, `Weer*`, `Header`, `Navigation`, `Snackbar`.
- Incident tijdens migratie:
  - agressieve bulk-replace veroorzaakte tijdelijke tekstmutaties in enkele bestanden;
  - getroffen bestanden hersteld en gecontroleerd opnieuw gemigreerd;
  - eindstatus is schoon (geen Svelte-check warnings/errors).
- Validatie:
  - `npm run check` OK (0 errors/warnings)
  - `npm run test` OK (12 tests)
  - `npm run build` OK

### 2026-04-10 14:39:42 +02:00

- Nieuwe UI-token leidraad geactiveerd:
  - `src/app.css` importeert nu expliciet eerst `src/lib/styles/ui-tokens.css` en daarna `ui-norm-profile.css`.
  - Globale basis in `app.css` aangepast naar token-driven defaults (`--font-sans`, `--bg-app`, `--text-primary`, `--leading-normal`) met compatibiliteitsaliasen voor legacy variabelen.
  - Handmatige dark-mode class (`html.dark`) nu afgestemd op semantische tokenwaarden.
- Eerste componentmigratie uitgevoerd (stapsgewijs, conform UX-uniformiteit):
  - `src/lib/components/Budget.svelte` hardcoded kleuren/spacings/radii vervangen door token-variabelen (`--bg-surface`, `--space-*`, `--radius-*`, `--text-*`, `--shadow-*`).
- Tijdelijke token-validatie toegevoegd:
  - DEV-only testkaart in `src/routes/meer/+page.svelte` (`import.meta.env.DEV`) om tokenrendering visueel te controleren zonder productie-UI te vervuilen.
- Validatie:
  - `npm run check` OK (0 errors/warnings)
  - `npm run test` OK (12 tests)

### 2026-04-10 14:22:26 +02:00

- Nieuw, gefaseerd implementatieplan toegevoegd voor:
  - Grote Kaart (Map view overnachtingen + POI + zwemplekken),
  - Offline-first doorontwikkeling,
  - Routeplanning tussen overnachtingen.
- Plan bevat:
  - technische fasering,
  - UX/UI-conformiteitseisen,
  - acceptatiecriteria,
  - test- en rolloutvolgorde.
- Product-roadmap (sectie 5) bijgewerkt met expliciete verwijzing naar plan in sectie 12.

### 2026-04-10 14:17:19 +02:00

- TTFB-optimalisatie voor mobiele Vercel-metrics:
  - SSR uitgeschakeld op layout-niveau via `src/routes/+layout.js` (`export const ssr = false`).
  - `injectSpeedInsights()` alleen nog in browser-context aangeroepen.
  - `static/favicon.ico` toegevoegd om standaard `/favicon.ico` 404-verkeer te reduceren.
- Doel van deze wijziging:
  - server-render vertraging op routes zoals `/` en `/campings` verminderen;
  - pieken in P99 TTFB dempen die passen bij server-side render + cold-start gedrag.
- Observatie uit Vercel runtime logs (laatste 7 dagen):
  - incidentele `500` op `/` en `/campings` gezien vóór deze wijziging;
  - `404` op `/favicon.ico` gezien vóór deze wijziging.
- Validatie na wijziging:
  - `npm run test` OK (12 tests)
  - `npm run check` OK (0 errors/warnings)
  - `npm run build` OK

### 2026-04-10 14:11:52 +02:00

- Firestore-rules aligned met actieve POI-collectie: `poi_suggesties` toegevoegd naast legacy `pois`.
- Documentatie geactualiseerd op fallback Firebase-config gedrag (`README.md` + relevante delen in deze handoff).
- Onderhoudbaarheid-refactor uitgevoerd op grote componenten:
  - `OvernachtingenPlanner.svelte`: pure plannerhelpers verplaatst naar `src/lib/components/overnachtingen/plannerUtils.ts`.
  - `GerechtenChecklist.svelte`: regio/GPS/afstandshelpers verplaatst naar `src/lib/components/gerechten/regionUtils.ts`.
  - `wildlife/WildlifeCard.svelte`: locatie/geocode-links verplaatst naar `src/lib/components/wildlife/locationUtils.ts`.
  - `Budget.svelte`: UI opgesplitst in `src/lib/components/budget/BudgetEntriesList.svelte` en `src/lib/components/budget/BudgetSettlementCard.svelte`.
- Indicatie componentgrootte na refactor:
  - `OvernachtingenPlanner.svelte`: 901 regels (was ~1002)
  - `GerechtenChecklist.svelte`: 724 regels (was ~812)
  - `wildlife/WildlifeCard.svelte`: 666 regels (was ~708)
  - `Budget.svelte`: 401 regels (was ~549)
- Validatie na refactor:
  - `npm run test` OK (12 tests)
  - `npm run check` OK (0 errors/warnings)
  - `npm run build` OK
