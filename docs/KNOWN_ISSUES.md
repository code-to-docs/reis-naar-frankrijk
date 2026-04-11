# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.6]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden of semantische fouten die niet voldoen aan het `UI_NORMPROFIEL`.

### P1 — Core UI risico
* **Button systeem versnipperd**: 126 interactieve knoppen/links; semantische regressies zijn nu getest, maar visuele variantconsolidatie is nog niet volledig afgerond.
* **`src/app.css`**: bevat nog feature-specifieke overrides (dark en component-specifiek) die componentisolatie en voorspelbaarheid verminderen.
* **Dark mode methode-gap**: normprofiel gebruikt `prefers-color-scheme`, implementatie gebruikt `html.dark` + per-user localStorage.

### P1 — High-impact componenten met grootste token-gap
* **`src/lib/features/gerechten/components/GerechtCard.svelte`**: hoogste concentratie hardcoded layout/visual waarden.
* **`src/routes/poi/+page.svelte`**: grote hoeveelheid hardcoded responsive/layout/skeleton waarden.
* **`src/lib/components/wildlife/WildlifeCard.svelte`**: legacy vaste maten en dense interactiepatronen.
* **`src/lib/components/Header.svelte`** en **`src/lib/components/Navigation.svelte`**: shell-level hardcoded maten en inconsistentie met normlayout.

### P2 — Bestaande bekende afwijkingen
* **`src/lib/features/gerechten/components/GerechtenTipCard.svelte`**: meerdere hardcoded `rgba(...)` varianten voor light/dark chips en tip-state.
* **`src/lib/components/GerechtTipWidget.svelte`**: hardcoded accentkleur (`rgba(14, 165, 164, 0.18)`) buiten tokenlaag.
* **`src/lib/poiCategories.ts`**: hardcoded hex-kleuren voor categoriepalet en locatiekleurmapping.

## Semantische Audit Violations ([v1.2.6])
* **Geen openstaande violations**: semantische kleur-audit draait nu als afdwingende test-gate.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; nieuwe media queries moeten literal units gebruiken.
* **Dark-mode FOUC risico**: thema-class wordt client-side gezet; korte mismatch bij initial paint blijft mogelijk.

## Architecturale Schuld
* **Mapping Inconsistentie**: `lib/components/gerechten/` bestaat naast `lib/features/gerechten/`; domeinmigratie niet voltooid.
* **Token Mapping Layer ontbreekt**: normprofiel-variabelen en implementatie-variabelen zijn nog niet volledig geharmoniseerd.

## Resolved Features & Debts ([v1.2.6])
* **Undefined Firestore payload guard**: opgelost door payloadsanitatie in `OvernachtingenService` (`add` + `update`).
* **Cross-feature regressietests**: interactie- en reactietests toegevoegd voor Overnachtingen, POI, Wildlife, Gerechten en Budget-lijstacties.
* **Semantische regressiegate**: `semantic-color-audit` faalt nu op violations; waarschuwing/disabled/destructief-contexten zijn afgedekt.
* **Button-semantiek remediatie**: save-/delete-/close-acties geharmoniseerd in Budget, Overnachtingen, POI, Wildlife en Gerechten tip-refresh.
* **Overnachtingen shortlist save-regressie**: entry-opslagpad afgedekt met service-guard + tests om herintroductie te blokkeren.

