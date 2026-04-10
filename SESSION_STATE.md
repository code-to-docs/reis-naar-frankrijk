# SESSION_STATE.md

## Huidige Status
We zitten op stabiele **v1.1**.  
Wat aantoonbaar in de codebase zit:
- Realtime Firestore flows voor budget, overnachtingen, POI, wildlife en gerechten.
- POI suggestielijst met CRUD, score, filters en sortering.
- Weather alerts via Météo-France endpoint + Open-Meteo forecast.
- Dashboard widgets met token-based styling en uniforme widget-typografie.
- **UI audit en tokenmigratie voltooid:** over 50+ hardcoded waarden vervangen door tokens in `app.css` en kerncomponenten.
- `npm run check`, `npm run test` en `npm run build` zijn groen.

## Status Quo (2026-04-10)
- **UI_NORMPROFIEL:** 100% compliance op core UI en tokenisatie.
- **Architectuur:** `OvernachtingenPlanner.svelte` (monoliet) succesvol opgesplitst in subcomponenten (`Header`, `Stats`, `ViewSwitcher`).
- **Data:** Wildlife dataset verrijkt met Ariège-specifieke regio's en de Grijze wolf toegevoegd.
- **UX/A11y:** Kritieke icon-buttons voorzien van `aria-label`, offline-indicators hebben `aria-live`, en contrast in Dark Mode is verbeterd.

### Laatste Iteratie: SaaS UI Refactor & Modularisering (2026-04-10)
1. **SaaS UI Overhaul:** `OvernachtingenPlanner` voorzien van een moderne SaaS-layout conform mockup:
    - Compacte header met primaire/secundaire acties.
    - KPI-geïntegreerde Tab-navigatie (Overzicht, Kalender, Kaart).
    - Gecentraliseerde `EmptyState` component met SVG.
2. **Design System:** Nieuwe Tab-standaard (sectie 10.10) en .empty-state classes toegevoegd aan `UI_NORMPROFIEL`.
3. **Hardened Types:** `WildlifeRegio` uitgebreid met `ariege` en `pyrenees_ariegeoises` om data-alignmentfouten te voorkomen.

### Openstaande Punten
- **Component splitting:** `GerechtenChecklist.svelte` is nu de laatste grote monoliet.
- **Feature 1:** Start setup voor "Grote Kaart" (MapItem contract). De tab is al aanwezig als placeholder.
- **Security:** Firebase Auth integratie voorbij de huidige lokale identity. model is aangescherpt, maar echte auth/identity ontbreekt nog.
- Testdekking op component/workflow-niveau kan verder omhoog.

## Volgende Stappen (Target: v1.2)
1. Grote Kaart - Fase 1:
   - `MapItem` contract vastleggen
   - Leaflet integratie op nieuwe `/kaart` route
   - uniforme filterchips en kaart/lijst-synchronisatie
2. Monolieten verder modulair maken:
   - splits op subflows (filter, lijst, detail, acties)
3. CSS debt reduceren:
   - resterende hardcoded geometrie systematisch tokeniseren
4. Security hardening:
   - Firestore rules aanscherpen per collectie en gebruiker/actie.
