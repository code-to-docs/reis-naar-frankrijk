# SESSION_STATE.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md` voor de levenscyclus-regels. Geef voldoende detail over de actuele status, maar COMPRIMEER oudere changelogs tot 1 overkoepelende regel. Verwijder To-Do's direct zodra ze af zijn.

## Huidige Status
* **Versie:** v1.1.2
* **UI Normprofiel:** v2.0.0 (2025-01-09)
* **Focus:** Overgang van Quality Sprint naar Phase 1 Map Integration
* **Architectuur:** Modulair (Composables + Context), Svelte 5 Runes
* **Testing:** Vitest 3 (23 unit/integration tests, 100% pass) + Playwright opgezet,
  baselines nog NIET gegenereerd

## Laatste Iteratie (Changelog)
* **v1.1.2:** Semantic Color Audit geïmplementeerd. Playwright visual regression
  framework opgezet (geen baselines). `GerechtenChecklist` monoliet gerefactored
  (+600 regels → composables).
* **v1.1.1:** Vitest Svelte 5 lifecycle issues en kalender hydration issues opgelost.

## Volgende Stappen (To-Do)
1. **Visual Baseline:** Playwright baselines genereren via `npm run test:visual:update`
   — vereiste voor To-Do #2.
2. **Phase 1 Map Integration:** Leaflet kaart bouwen volgens modulaire patronen.
3. **Tokenization Sprint:** Token violations wegwerken — zie `KNOWN_ISSUES.md`.
4. **Refactor Phase 2:** `WildlifeChecklist.svelte` — volg patroon van GerechtenChecklist.

## Aantekeningen
* **GerechtenChecklist = architecturaal template** voor alle nieuwe feature-modules:
  * Bestand: `src/lib/features/gerechten/`
  * State toegankelijk via `getGerechtenContext()`
  * Patroon: composable voor logica, context voor distributie, component voor UI
* **Nieuwe features:** volg altijd het gerechten-patroon. Geen monolithische bestanden
  (signaal: >400 regels).