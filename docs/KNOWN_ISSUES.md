# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.8]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> P1 en P2 uit vorige sprint zijn opgelost. Er zijn geen openstaande P1/P2 violations.

### Openstaande Niet-kritieke Backlog (P3)
* **`src/lib/components/weer/WeerDagen.svelte`**: resterende vaste maatwaarden (`px`) buiten kritieke gate-scope.
* **`src/lib/features/gerechten/components/GerechtenHeader.svelte`**: meerdere vaste layoutwaarden nog niet getokeniseerd.
* **`src/routes/+page.svelte`** en **`src/routes/meer/+page.svelte`**: legacy vaste maten in layout/kaartblokken.

## Semantische Audit Violations ([v1.2.8])
* **Geen openstaande violations**: semantische kleur-audit draait als afdwingende test-gate.

## Governance & CI Status
* **Strict UI gate actief voor kritieke scope**: `routes/poi/+page`, `WildlifeCard`, `Header`, `Navigation`, `GerechtTipWidget`, `poiCategories`.
* **Exception policy actief**: alleen media-breakpoint literals (`640/740/768/880/900/1099/1100px`) toegestaan binnen de gate.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; nieuwe media queries moeten literal units gebruiken.

## Architecturale Schuld
* **Mapping Inconsistentie**: `lib/components/gerechten/` bestaat naast `lib/features/gerechten/`; domeinmigratie niet voltooid.
* **Token Mapping Layer**: volledige harmonisatie van normprofielvariabelen naar alle niet-kritieke componenten loopt nog.

## ✅ Resolved Features & Debts ([v1.2.8])
* **P1 token migration wave2a**: `src/routes/poi/+page.svelte` gemigreerd naar token-gedreven waarden; hardcoded `rgba` en vaste kaartenmaten verwijderd.
* **P1 token migration wave2b**: `Navigation.svelte`, `+layout.svelte` en shell-tokens geharmoniseerd (`--nav-sidebar-width`, spacing aliases, indicator/shadow tokenized).
* **P1 UI gate strategy**: `src/lib/tests/ui-norm-audit.test.ts` omgezet naar strict gate voor kritieke scope met expliciete exception policy.
* **P1 dark alignment**: pre-hydration dark bootstrap in `src/app.html`; `stores.svelte.js` gebruikt user-voorkeur met systeemfallback; layout hydrateert zonder themamismatch.
* **P2 widget kleuren**: `src/lib/components/GerechtTipWidget.svelte` hardcoded dark `rgba` vervangen door tokenized `color-mix`.
* **P2 categoriekleuren**: `src/lib/poiCategories.ts` geconverteerd van hex naar semantische CSS tokens.
* **App.css isolatieverbetering**: feature-specifieke dark overrides opgeschoond naar generieke laag; componenteigen dark gedrag blijft lokaal.
