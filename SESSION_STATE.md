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
- **Architectuur:** `OvernachtingenPlanner.svelte` (monoliet) refactored naar moderne SaaS UI.
- **Typing & Build:** `svelte-check` en `npm run build` zijn volledig groen; kritieke CSS build-errors hersteld.
- **Regions:** Ariège (en subregio's) zijn canoniek geintegreerd.
- **UX/A11y:** Kritieke icon-buttons voorzien van `aria-label`, offline-indicators hebben `aria-live`, en contrast in Dark Mode is verbeterd.

### Laatste Iteratie: Test-Infrastructuur & UI Audit (2026-04-10)
1. **Testing Setup:** `@testing-library/svelte` en `jsdom` geconfigureerd. Component testing voor Svelte 5 (Runes) nu mogelijk.
2. **UI Norm Audit:** Geautomatiseerde test (`ui-norm-audit.test.ts`) die de codebase scant op hardcoded CSS-waarden.
3. **Issue Tracking:** `docs/KNOWN_ISSUES.md` geïntroduceerd voor het scheiden van defecten/debt van de roadmap.

### Openstaande Punten (Roadmap)
- **Feature 1:** Start setup voor "Grote Kaart" (MapItem contract). De tab is al aanwezig als placeholder.
- **Security:** Firebase Auth integratie voorbij de huidige lokale identity.
- **Test-coverage**: Uitbreiden van component-tests naar Budget en POI widgets.

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
