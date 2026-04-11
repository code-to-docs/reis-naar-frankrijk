# ARCHITECTURE.md

## 1. Mappenstructuur
* `.github/workflows/`: CI-automatisering voor tests en auditrapportage.
* `scripts/`: onderhouds- en governance-scripts (o.a. audit-trending).
* `src/`
* `src/routes/`: SvelteKit file-based routing (`+layout`, home, budget, campings, poi, meer, api).
* `src/lib/api/`: externe API-adapters (weer, wiki).
* `src/lib/components/`: domeincomponenten voor budget, overnachtingen, poi, weer en wildlife.
* `src/lib/features/gerechten/`: modulaire gerechten-feature (context, composables, UI-componenten).
* `src/lib/services/`: Firestore service-laag (`overnachtingenService`, `poiService`).
* `src/lib/utils/`: pure helperlogica en datatransformaties.
* `src/lib/tests/`: auditgerichte kwaliteitstests (UI norm + semantische kleurchecks + a11y regressies).
* `docs/`: projectdocumentatie, auditrapportages en sprintadministratie.

## 2. Testarchitectuur
* **Service-tests**: `src/lib/services/overnachtingenService.test.ts`, `src/lib/services/poiService.test.ts`.
* **Utility-tests**: `src/lib/utils/budget.test.ts`, `src/lib/utils/dashboard.test.ts`, `src/lib/utils/poi.test.ts`.
* **Component-interactietests**:
* `src/lib/components/overnachtingen/OvernachtingenTabs.test.ts`
* `src/lib/components/overnachtingen/OvernachtingenFormPanel.test.ts`
* `src/lib/components/poi/PoiFormModal.test.ts`
* `src/lib/components/wildlife/WildlifeCard.test.ts`
* `src/lib/components/budget/BudgetEntriesList.test.ts`
* `src/lib/features/gerechten/components/GerechtCard.test.ts`
* **Audit-tests**: `src/lib/tests/ui-norm-audit.test.ts`, `src/lib/tests/semantic-color-audit.test.ts`, `src/lib/tests/a11y-regression-audit.test.ts`.

## 3. Data Flow
* **Persistence**: realtime synchronisatie via Firebase Firestore snapshots.
* **Domeinmodellen**: gecentraliseerd in `src/lib/types.ts`.
* **Koppeling**: entiteiten zijn gekoppeld via `door` (gebruiker), zonder relationele `tripId`.
* **State**: Svelte 5 Runes + context en globale app-state (`stores.svelte.js`).

## 4. Recente Architecturale Beslissingen
* **[v1.2.10] CI-kwaliteitspoort**: `.github/workflows/ci.yml` maakt test- en audit-trendstappen standaard voor `main` en PR's.
* **[v1.2.10] Audit-trending**: `scripts/audit-trend.mjs` levert persistente trendartefacten in `docs/` voor sprint-over-sprint governance.
* **[v1.2.10] A11y-regressiegate**: extra audit-suite borgt focus/reduced-motion/toetsenbord/contrast-invarianten.
* **[v1.2.4] Firestore payloadsanitatie**: overnachtingen-service verwijdert `undefined` waarden vóór writes om runtime Firestore errors te voorkomen.
* **[v1.2.4] Regressie-eerst kwaliteitspoort**: featureknoppen en reactiepaden zijn expliciet afgedekt in componenttests om pre-build regressies sneller te detecteren.
* **[v1.2.x] Media-query constraint**: breakpoints blijven literal (`px`) vanwege LightningCSS-beperking op `var()` in `@media`.
