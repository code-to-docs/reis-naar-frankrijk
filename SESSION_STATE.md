# SESSION_STATE.md

## Huidige Status
We zitten op stabiele **v1.1**.  
Wat aantoonbaar in de codebase zit:
- Realtime Firestore flows voor budget, overnachtingen, POI, wildlife en gerechten.
- POI suggestielijst met CRUD, score, filters en sortering.
- Weather alerts via Météo-France endpoint + Open-Meteo forecast.
- Dashboard widgets met token-based styling en uniforme widget-typografie.
- UI tokenmigratie breed doorgevoerd.
- `npm run check`, `npm run test` en `npm run build` waren in de vorige baseline groen.

## Laatste Iteratie (2026-04-10)
- Dashboard UX geharmoniseerd:
  - beperktere fontvariatie
  - consistente spacing tussen `Laatste spotting` en `Proeftip van vandaag`
- Weather-alert widget verbeterd:
  - “Rustig volgens Météo-France ...” staat nu in de widget/cards zelf
  - regio-naam normalisatie voor consistente schrijfwijze
- Wildlife deeplink flow verbeterd:
  - klik op dashboard spotting opent direct de juiste wildlife card
- Filterpatroon doorgetrokken:
  - Wildlife/Gerechten/POI delen nu hetzelfde zoek + filter-toggle patroon
  - filterknophoogte gelijk aan zoekveldhoogte
  - afgeronde inputstandaard toegepast
- Pills/chips uniformer en subtieler gemaakt via centrale tokenstijl.
- Budget donut-kleuren beter onderscheidend gemaakt via nieuwe categorie-tokens.
- Monoliet-splitsing doorgezet:
  - `Budget.svelte` opgesplitst in `BudgetHeroCard` + `BudgetFilters`
  - `WildlifeCard.svelte` opgesplitst met `WildlifeInfoPanel` + `WildlifeFullscreenOverlay`
- Firestore rules aangescherpt met collectie-specifieke veldvalidatie.
- Nieuwe util-tests toegevoegd voor dashboard-gerelateerde logica (`dashboard.test.ts`).

## Openstaande Issues / Debt
- Monolithische componenten blijven groot:
  - `OvernachtingenPlanner.svelte`
  - `GerechtenChecklist.svelte`
- Er resteert nog technische CSS-debt met veel vaste px-regels (laatste bekende audit: ~354 regels).
- Firestore security model is aangescherpt, maar echte auth/identity ontbreekt nog.
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
