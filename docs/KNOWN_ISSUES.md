# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.4]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden of semantische fouten die niet voldoen aan het `UI_NORMPROFIEL`.

### Overnachtingen
* **OvernachtingenFormPanel.svelte**: hardcoded `52px` en `840px` waarden aanwezig.
* **plannerUtils.ts**: hardcoded hex-kleuren voor locatiekleurmapping.

### Wildlife
* **WildlifeChecklist.svelte**: legacy `108px` en `42px` dimensies aanwezig.

### Algemeen
* **Snackbar.svelte**: hardcoded schaduwen en margins.

## Semantische Audit Violations ([v1.2.4])
* **Bevestigingsacties**: save-acties gebruiken op meerdere plekken onjuiste token (`btn-danger`) in plaats van success-semantiek.
* **Disabled states**: ontbrekende disabled-semantiek in `BudgetForm.svelte`, `WildlifeCard.svelte`, `PoiFormModal.svelte`, `OvernachtingenFormPanel.svelte`.
* **Destructieve acties**: delete-acties missen error/destructive semantiek in `PoiCard.svelte` en `OvernachtingenListsSection.svelte`.
* **Waarschuwingsstaten**: waarschuwingsblokken in `WeerAlerts.svelte` missen warning-semantiektokens.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; nieuwe media queries moeten literal units gebruiken.

## Architecturale Schuld
* **Mapping Inconsistentie**: `lib/components/gerechten/` bestaat naast `lib/features/gerechten/`; mapping moet verder opgeschoond worden.

## ✅ Resolved Features & Debts ([v1.2.4])
* **Undefined Firestore payload guard**: opgelost door payloadsanitatie in `OvernachtingenService` (`add` + `update`).
* **Regressiepreventie shortlist-save**: tests toegevoegd die `undefined`-velden blokkeren en write-payload valideren.
* **Feature-interactie regressies**: actieknoppen en reacties nu afgedekt in tests voor Overnachtingen, POI, Wildlife, Gerechten en Budget-lijsten.
