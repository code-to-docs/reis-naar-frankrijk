# session_state v1.2.6

## current_status
* **version**: [v1.2.6]
* **sprint**: governance hardening via audit-remediation and regression gates
* **progress**: semantische kleurafwijkingen weggewerkt; regressiecheck is nu build-blocking
* **last_action**: componenten en tests gemigreerd naar consistente button/disabled/warning-semantiek

## accomplishments
* **semantic_gate_enforced**: `src/lib/tests/semantic-color-audit.test.ts` faalt nu bij iedere semantische violation (`expect(...).toBe(0)`).
* **warning_semantics_fixed**: `WeerAlerts.svelte` warning-cards gemigreerd naar semantische warning-context zonder audit-violations.
* **disabled_semantics_fixed**: ontbrekende disabled-tokencontext opgelost in `OvernachtingenCalendarBoard.svelte` en `GerechtenTipCard.svelte`.
* **button_alignment_batch**: bevestig-/destructieve/neutral-knoppen verder geharmoniseerd in Budget, Overnachtingen, POI en Wildlife componenten.
* **regression_status**: `npm test` groen (13 testbestanden, 36 tests), inclusief semantische gate.
* **history_compression**: pre-v1.2.5 setup, Firestore-integratie en eerste audit-inventaris afgerond.

## next_steps
1. **p1_token_migration_wave2**: grote hardcoded clusters migreren in `GerechtCard.svelte`, `routes/poi/+page.svelte`, `Navigation.svelte`, `Header.svelte`.
2. **p1_ui_norm_gate_strategy**: beslissen welke UI-normregels strict gate worden en welke als tijdelijke uitzonderingslijst blijven (met name media-query literals).
3. **p1_dark_alignment**: normprofiel uitbreiden met expliciete compatibiliteitssectie voor `html.dark` + `prefers-color-scheme` fallback.
4. **p2_css_isolation**: feature-specifieke overrides uit `app.css` verder terugbrengen naar componentniveau.

## technical_debt
* **ui_norm_backlog**: brede hardcoded-waarde inventaris staat nog open over meerdere modules; audit rapporteert dit nog bewust als backlog-signaal.
* **constraint_note**: CSS variabelen blijven onbruikbaar in `@media`; literal breakpoints blijven voorlopig nodig.
* **domain_migration_gap**: `lib/components/gerechten/` en `lib/features/gerechten/` bestaan parallel; consolidatie nog niet voltooid.

