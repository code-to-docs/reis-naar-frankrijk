# KNOWN_ISSUES.md

Dit document bevat de actuele lijst met defecten, architecturale schuld en visuele afwijkingen gedetecteerd door de automatische UI Audit.

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden (pixels, hex, rgba) of semantische fouten die niet voldoen aan het `UI_NORMPROFIEL`. Deze moeten systematisch worden vervangen door tokens uit `ui-tokens.css`.

### Dashboard & Navigatie
- **Header.svelte**: Veel hardcoded `rgba` schaduwen en `px` breedtes (1100px, 640px).
- **Navigation.svelte**: Gebruikt `#eac` (debug color) en veel hardcoded `14px` fonts.

### Overnachtingen (Plural)
- **OvernachtingenCalendarBoard.svelte**: Bevat `#eac` debug kleuren en `760px` max-widths.
- **OvernachtingenListsSection.svelte**: Bevat `rgba` blauw/rood overlays die niet via tokens lopen.
- **OvernachtingenTabs.svelte**: Gebruikt een hardcoded `640px` breakpoint.
- **plannerUtils.ts**: Bevat een set hardcoded hex-codes (`#1d4ed8`, `#0284c7`, etc.) voor kaart-markers. Dit moet via CSS variabelen.

### POI & Wildlife
- **PoiFormModal.svelte**: Veel hardcoded `px` waarden voor breedte en spacing.
- **WildlifeCard.svelte**: Grote hoeveelheid legacy `px` waarden en hardcoded `rgba` overlays.

### Algemeen
- **Snackbar.svelte**: Hardcoded schaduwen en margins.
- **SpotVanDeDag.svelte**: Veel hardcoded layout-geometrie.

## Semantische Audit Violations (v1.1.2)
*Gedetecteerd door `semantic-color-audit.test.ts`*
- **Destructieve acties**: Ontbrekende `--color-error` bij delete-acties in `GedeeldeLijst.svelte`, `PoiCard.svelte`, `OvernachtingenListsSection.svelte`.
- **Bevestigingsacties**: Ontbrekende `--color-success` bij save-acties in `BudgetForm.svelte`, `Budget.svelte`, `WildlifeCard.svelte`, `PoiFormModal.svelte`.
- **Disabled states**: Ontbrekende `--color-disabled` tokens in `BudgetForm.svelte`, `WildlifeCard.svelte`, `PoiFormModal.svelte`, `OvernachtingenFormPanel.svelte`.
- **Waarschuwingen**: Ontbrekende `--color-warning` in `WeerAlerts.svelte`.

## ✅ Resolved Features & Debts

### 1. GerechtenChecklist Monoliet (Refactored v1.1.2)
*De monoliet van 780+ regels is opgesplitst in een modulaire architectuur (`src/lib/features/gerechten/`) met Svelte 5 Composables en Context.*

### 2. Vitest Svelte 5 Lifecycle Issues (Resolved v1.1.1)
*Configuratie van `vitest.config.ts` met `svelteTesting()` plugin loste de `lifecycle_function_unavailable` errors op.*

### 3. Kalender Svelte 5 Hydration
*Hydration issues in `OvernachtingenCalendarBoard` zijn opgelost door browser-only guards.*

## Bekende Bugs
*Momenteel geen kritieke functionele bugs bekend.*
