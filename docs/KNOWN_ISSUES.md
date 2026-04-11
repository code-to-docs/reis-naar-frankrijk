# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.14]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> Geen openstaande kritieke audit-defecten. Alle P1/P2 bevindingen uit Audit-Rapport v1.0 zijn verholpen.

## Openstaande Issues
* **Geen openstaande non-audit issues.**

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` bewaakt token-only styling.
* **UI gate actief**: `ui-norm-audit` bewaakt design tokens.
* **A11y gate actief**: `a11y-regression-audit` bewaakt toegankelijkheid.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` restrictie blijft van kracht; literal breakpoints noodzakelijk.

## Architecturale Schuld
* **Legacy Stores Shim**: `src/lib/stores.js` bevat Svelte 4/5 compatibility logic.

## Resolved Features & Debts ([v1.2.14])
* **Audit Remediation Phase 1-3**: Kritieke audit-bevindingen (sw.js, hardcoded kleuren, error handling), belangrijke verbeteringen (loops keys, primitive adoption) en A11Y navigatie-fixes voltooid.
* **Audit Baseline**: Volledige codebase-audit uitgevoerd (Audit-Rapport v1.0).
* **v1.2.13 Cleanup**: ListItem primitive en global hover fix geconsolideerd.
* **Pre-v1.2.13 Summary**: Setup, Firestore connectie, UI-tokens en initiële primitive rollout voltooid.
