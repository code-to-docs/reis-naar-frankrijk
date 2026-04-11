# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.15]

## Kritieke UI Afwijkingen (Audit Failures)
* **Geen openstaande kritieke audit-defecten.**

## Openstaande Issues
* **Geen openstaande functionele issues.**

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` bewaakt token-only styling.
* **UI gate actief**: `ui-norm-audit` bewaakt design tokens en detecteert 'Broken Tokens'.
* **A11y gate actief**: `a11y-regression-audit` bewaakt toegankelijkheid.
* **Integrity gate actief**: `budget-integrity` bewaakt Firebase-connectiviteit.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` restrictie blijft van kracht; literal breakpoints noodzakelijk.

## Architecturale Schuld
* **Legacy Stores Shim**: `src/lib/stores.js` bevat Svelte 4/5 compatibility logic.

## Resolved Features & Debts ([v1.2.15])
* **Recovery & Hardening**: Herstel van Firebase initialisatie en FAB styling.
* **Broken Token Monitoring**: Audit-suite uitgebreid met detectie van niet-bestaande variabelen.
* **Runtime Diagnostic**: Watchdog toegevoegd aan `Budget.svelte`.
* **v1.2.14 Audit Remediation**: PWA shell, token-cleanup en A11Y fixes.
