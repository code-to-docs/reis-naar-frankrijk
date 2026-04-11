# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.5]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden of semantische fouten die niet voldoen aan het `UI_NORMPROFIEL`.

### P1 — Core UI risico
* **Button systeem versnipperd**: 126 interactieve knoppen/links met te veel custom varianten; normprofiel-consistentie ontbreekt in meerdere modules.
* **`src/app.css`**: bevat feature-specifieke overrides (dark en component-specifiek) die componentisolatie en voorspelbaarheid verminderen.
* **Dark mode methode-gap**: normprofiel gebruikt `prefers-color-scheme`, implementatie gebruikt `html.dark` + per-user localStorage.

### P1 — High-impact componenten met grootste token-gap
* **`src/lib/features/gerechten/components/GerechtCard.svelte`**: hoogste concentratie hardcoded layout/visual waarden.
* **`src/routes/poi/+page.svelte`**: grote hoeveelheid hardcoded responsive/layout/skeleton waarden.
* **`src/lib/components/wildlife/WildlifeCard.svelte`**: legacy vaste maten en dense interactiepatronen.
* **`src/lib/components/Header.svelte`** en **`src/lib/components/Navigation.svelte`**: shell-level hardcoded maten en inconsistentie met normlayout.

### P2 — Bestaande bekende afwijkingen
* **OvernachtingenFormPanel.svelte**: hardcoded `52px` en `840px` waarden.
* **WildlifeChecklist.svelte**: legacy `108px` en `42px` dimensies.
* **plannerUtils.ts**: hardcoded hex-kleuren voor locatiekleurmapping.
* **Snackbar.svelte**: hardcoded margins/shadows volgens auditdefinitie.

## Semantische Audit Violations ([v1.2.5])
* **Bevestigingsacties**: save-acties gebruiken op meerdere plekken onjuiste token (`btn-danger`) i.p.v. success-semantiek.
* **Disabled states**: ontbrekende disabled-semantiek in `BudgetForm.svelte`, `WildlifeCard.svelte`, `PoiFormModal.svelte`, `OvernachtingenFormPanel.svelte`.
* **Destructieve acties**: delete-acties missen error/destructive semantiek in `PoiCard.svelte` en `OvernachtingenListsSection.svelte`.
* **Waarschuwingsstaten**: waarschuwingselementen in `WeerAlerts.svelte` missen consistente warning-semantiektokens.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; nieuwe media queries moeten literal units gebruiken.
* **Dark-mode FOUC risico**: thema-class wordt client-side gezet; korte mismatch bij initial paint blijft mogelijk.

## Architecturale Schuld
* **Mapping Inconsistentie**: `lib/components/gerechten/` bestaat naast `lib/features/gerechten/`; domeinmigratie niet voltooid.
* **Token Mapping Layer ontbreekt**: normprofiel-variabelen en implementatie-variabelen zijn nog niet volledig geharmoniseerd.

## ✅ Resolved Features & Debts ([v1.2.5])
* **Undefined Firestore payload guard**: opgelost door payloadsanitatie in `OvernachtingenService` (`add` + `update`).
* **Cross-feature regressietests**: interactie- en reactietests toegevoegd voor Overnachtingen, POI, Wildlife, Gerechten en Budget-lijstacties.
* **Governance-audit assets**: volledige auditrapportage en CSV-inventarissen toegevoegd voor planmatige migratie.



