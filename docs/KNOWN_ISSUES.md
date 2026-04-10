# KNOWN_ISSUES.md

Dit document bevat de actuele lijst met defecten, architecturale schuld en visuele afwijkingen gedetecteerd door de automatische UI Audit.

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden (pixels, hex, rgba) die niet voldoen aan het `UI_NORMPROFIEL`. Deze moeten systematisch worden vervangen door tokens uit `ui-tokens.css`.

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

## Architecturale Schuld
1. **GerechtenChecklist Monoliet**: De component `src/lib/components/GerechtenChecklist.svelte` is momenteel de grootste monolithische component in de app. Moet gesplitst worden.
2. **Vitest Svelte 5 Lifecycle Error**: Component tests voor Svelte 5 Runes falen momenteel in de Vitest environment door een `lifecycle_function_unavailable` error (SSR vs Client mismatch).

## Bekende Bugs
*Momenteel geen kritieke functionele bugs bekend.*
