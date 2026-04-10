# POI Suggestielijst v1 Implementatieplan

Dit document beschrijft de eerste echte implementatie van de POI-feature als suggestielijst. Het vervangt de huidige generieke lijst op `/poi` en is afgestemd op de bestaande architectuur, realtime Firestore-patronen en UI-normen van de app.

## Doel van v1

- Een rustige, premium suggestielijst voor optionele stops, uitjes en plekken onderweg.
- Prioriteit bepalen met een eenvoudige score van 1 t/m 3.
- Lichtgewicht locatieaanpak via deeplinks naar kaartenapps.
- Een codebase die eenvoudig uit te bouwen is met extra metadata, planning of route-intelligentie.

## Kaders voor deze implementatie

- Nieuwe collectie: `poi_suggesties`
- Oude collectie `pois` blijft ongemoeid
- Realtime laden via `subscribe` patroon, in lijn met andere delen van de app
- UI moet meeliften op de bestaande tokens in `src/lib/styles/ui-norm-profile.css` en `src/app.css`
- Geen zware kaartenbibliotheken in v1

## Datamodel

Belangrijkste keuzes:

- `Poi` als centrale interface, niet `POI`
- `toegevoegdOp` en `bijgewerktOp` los vastgelegd
- `mapsLink` wordt automatisch afgeleid uit naam + locatie als de gebruiker geen losse kaartlink opgeeft
- `bezocht` blijft onderdeel van het model, maar compact gehouden in de UI

## Bestandsstructuur

- `src/lib/types.ts`
  - `PoiCategorieId`
  - `PoiScore`
  - `PoiCategorie`
  - `Poi`
- `src/lib/poiCategories.ts`
  - categorieconfig
  - score-meta
- `src/lib/utils/poi.ts`
  - normaliseren
  - sorteren
  - filteren
  - deeplink/url helpers
- `src/lib/utils/poi.test.ts`
  - tests voor de kernlogica
- `src/lib/services/poiService.ts`
  - realtime subscribe
  - add/update/delete/toggle bezocht
- `src/lib/components/poi/PoiCard.svelte`
- `src/lib/components/poi/PoiFormModal.svelte`
- `src/routes/poi/+page.svelte`

## UI Norm voor POI v1

De POI-feature volgt nadrukkelijk de bestaande UI-norm:

- Typografie uitsluitend via bestaande tokens
- Kaarten gebruiken bestaande `card`-stijl en border/radius-ritme
- Filters als pill- of chip-varianten, niet als losse custom knopfamilie
- Primaire actie is kaart-openen, secundaire acties zijn edit/bezocht/delete
- Kleurvariatie zit in categorie-accenten, niet in afwijkende fonts of losse componentmaten

## Niet in v1

- Embedded kaart
- Geocoding/autocomplete
- Foto’s per POI
- Dagplanning / routeoptimalisatie
- Externe POI imports

## Uitvoeringsvolgorde

1. Types en categorieconfig toevoegen
2. Utils + tests schrijven
3. Realtime service bouwen
4. POI card en modal bouwen
5. `/poi` route vervangen door nieuwe feature
6. Headertekst en pagina-intro afstemmen op suggestie-focus
7. Check, build en tests draaien

## Doorontwikkeling na v1

Logische vervolgstappen:

- Afstand tot huidige regio of verblijf
- “Opslaan voor later” versus “must-see vandaag”
- Foto, openingstijden en prijsindicatie
- Slimme clustering per streek of dag
- Integratie met overnachtingen of dagplanning
