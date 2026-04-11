# session_state v1.2.7

## current_status
* **version**: [v1.2.7]
* **sprint**: governance hardening via audit-remediation and regression gates
* **progress**: p1 token-migratie gestart op hoogste afwijkingscluster binnen gerechtenflow
* **last_action**: hardcoded waarden in `GerechtCard` en `GerechtenTipCard` vervangen door token-gebaseerde varianten

## accomplishments
* **semantic_gate_stable**: semantische regressiegate blijft groen na stylesheetmigratie.
* **gerechten_card_cleanup**: `GerechtCard.svelte` opgeschoond van hardcoded `px`/`rgba` waarden; audit-output voor dit bestand teruggebracht naar breakpoint-only signalen.
* **gerechten_tip_cleanup**: `GerechtenTipCard.svelte` translucent `rgba` waarden vervangen door token-gebaseerde `color-mix` varianten.
* **regression_status**: `npm test` groen (13 testbestanden, 36 tests).
* **history_compression**: pre-v1.2.6 semantische remediation en test-gating afgerond.

## next_steps
1. **p1_token_migration_wave2a**: hardcoded clusters in `routes/poi/+page.svelte` migreren naar tokens.
2. **p1_token_migration_wave2b**: shell-afwijkingen in `Navigation.svelte` en `Header.svelte` migreren.
3. **p1_ui_norm_gate_strategy**: strict-gate regels vastleggen met uitzonderingsbeleid voor media-query literals.
4. **p1_dark_alignment**: normprofiel uitbreiden met expliciete compatibiliteitssectie voor `html.dark` + `prefers-color-scheme` fallback.

## technical_debt
* **ui_norm_backlog**: brede hardcoded-waarde inventaris blijft open buiten de reeds gemigreerde gerechtencomponenten.
* **constraint_note**: CSS variabelen blijven onbruikbaar in `@media`; literal breakpoints blijven voorlopig nodig.
* **domain_migration_gap**: `lib/components/gerechten/` en `lib/features/gerechten/` bestaan parallel; consolidatie nog niet voltooid.
