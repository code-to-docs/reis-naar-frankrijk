# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

Dit document bevat de actuele lijst met defecten, architecturale schuld en visuele afwijkingen gedetecteerd door de automatische UI Audit.

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> De volgende bestanden bevatten hardcoded CSS-waarden (pixels, hex, rgba) of semantische fouten die niet voldoen aan het `UI_NORMPROFIEL`. Deze moeten systematisch worden vervangen door tokens uit `ui-tokens.css`.

### Overnachtingen (Plural)
- **OvernachtingenFormPanel.svelte**: Nog steeds diverse hardcoded `52px` en `840px` waarden.
- **plannerUtils.ts**: Bevat een set hardcoded hex-codes (`#1d4ed8`, `#0284c7`, etc.) voor kaart-markers. Dit moet via CSS variabelen.

### Wildlife
- **WildlifeChecklist.svelte**: Heeft nog legacy `108px` en `42px` dimensies.

### Algemeen
- **Snackbar.svelte**: Hardcoded schaduwen en margins.

## Semantische Audit Violations (v1.2.3)
*Gedetecteerd door `semantic-color-audit.test.ts`*
- **Bevestigingsacties**: Ontbrekende `--color-success` bij save-acties in `PoiFormModal.svelte`.
- **Disabled states**: Ontbrekende `--color-disabled` tokens in `BudgetForm.svelte`, `WildlifeCard.svelte`, `PoiFormModal.svelte`, `OvernachtingenFormPanel.svelte`.

## ✅ Resolved Features & Debts (v1.2.3)
* **Build Failure (v1.2.2):** Opgelost door syntax-correctie in `BudgetEntriesList.svelte`.
* **Systematic @media Violations (v1.2.2):** Reverted CSS variables in media queries naar literal pixel values (`1100px`, `768px`) voor LightningCSS compatibiliteit.
* **Budget Module Tokenization:** `BudgetChart.svelte`, `BudgetEntriesList.svelte`, `BudgetForm.svelte` en `BudgetSettlementCard.svelte` zijn nu 100% tokenized.
* **Global Styles (Partieel):** ~50% van `app.css` is nu gemigreerd naar tokens.
* **Semantic Colors:** `GedeeldeLijst.svelte` en `WeerAlerts.svelte` zijn bijgewerkt naar status tokens.

## Bekende Bugs
* **LightningCSS Media Queries:** Browser/Compiler ondersteunt GEEN `var()` binnen `@media` regels. Nieuwe media queries MOETEN literal units gebruiken.

## Architecturale Schuld
- **Mapping Inconsistentie:** `lib/components/gerechten/` bestaat naast `lib/features/gerechten/`. De feature mapping moet worden opgeschoond.