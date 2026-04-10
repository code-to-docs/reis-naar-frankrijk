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

- `npm run test` ✅ (10 tests)
- `npm run check` ✅ (0 errors/warnings)
- `npm run build` ✅

---

## 5) Pending Tasks & Roadmap

### Korte termijn (stabiliteit / basis)

1. Firestore rules alignen met huidige collecties (met name `poi_suggesties`).
2. Security model aanscherpen (nu grotendeels `allow read, write: if true`).
3. UI norm handhaving verder automatiseren (lint/checklist per component change).
4. Grote componenten opdelen voor onderhoudbaarheid:
   - `OvernachtingenPlanner.svelte`
   - `WildlifeChecklist.svelte`
   - `Budget.svelte`

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

1. Multi-trip model introduceren (`tripId`) voor schaalbare data-isolatie.
2. Auth toevoegen i.p.v. alleen localStorage-identity.
3. POI uitbreiding:
   - optionele afstand/regio hints
   - planning-koppeling met overnachtingen
4. Observability verbeteren (error reporting / runtime logging).

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

- `src/lib/firebase.ts` gebruikt **strict env-only** initialisatie.
- Ontbrekende `PUBLIC_FIREBASE_*` variabelen veroorzaken directe init-fout.
- Geen secrets/tokens hardcoden in code.

---

## 7) Active Context / Pain Points

1. **Firestore Rules mismatch-risico**
   - `poiService` schrijft naar `poi_suggesties`
   - `firestore.rules` bevat wel `pois` maar geen expliciete `poi_suggesties` match
   - kan leiden tot permission errors zodra rules strikt worden toegepast.

2. **Security debt**
   - Veel collecties staan open (`allow read, write: if true`).
   - Past bij huidige lokale identity aanpak, maar is niet productiehard voor echte gebruikersaccounts.

3. **UI consistency debt in legacy modules**
   - Nieuwe widgets en POI volgen tokens beter.
   - Oudere onderdelen bevatten nog hardcoded sizing/kleuren en grotere stijlvariatie.

4. **Monolithische componenten**
   - Enkele Svelte-bestanden zijn groot, met veel gecombineerde concerns (state, data, view, interaction).
   - Vertraagt onboarding en verhoogt regressierisico bij wijzigingen.

5. **Test focus nog smal**
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
5. Eerste technische check: Firestore rules vs actieve collecties synchroniseren.

---

## 11) Samenvatting

De codebase is functioneel, build-stabiel en heeft een duidelijke UI-normalisatiebasis.  
Grootste winst voor de volgende iteratie zit in: security/rules hardening, opsplitsen van grote componenten, en verbreden van testdekking.  
Voor featuregroei is het raadzaam om als volgende architectuurstap `tripId` en echte auth in te voeren.
