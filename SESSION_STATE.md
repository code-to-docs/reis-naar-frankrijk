# session_state v1.2.8

## current_status
* **version**: [v1.2.8]
* **sprint**: governance hardening via full P1/P2 closure + dark alignment
* **progress**: next steps 1-4 uitgevoerd; kritieke UI-audit scope staat nu onder strict gate
* **last_action**: POI shell/wildlife/nav/header remediatie + dark-mode bootstrap + governance updates

## accomplishments
* **p1_wave2a_done**: `src/routes/poi/+page.svelte` gemigreerd van hardcoded maten/rgba naar token-gedreven waarden; alleen media-breakpoint literals blijven als expliciete uitzondering.
* **p1_wave2b_done**: shell-afwijkingen in `Navigation.svelte` + `+layout.svelte` geharmoniseerd met tokenized sidebar width/spacing; header-fallback tokens geborgd via `app.css` root aliases.
* **p1_ui_gate_done**: `ui-norm-audit.test.ts` omgezet naar strict gate voor kritieke scope met expliciet exceptionbeleid voor media-literals (LightningCSS-constraint).
* **p1_dark_alignment_done**: pre-hydration dark bootstrap toegevoegd in `src/app.html`; store-init volgt nu uservoorkeur met `prefers-color-scheme` fallback; layout hydrateert op bestaande `html.dark` staat.
* **p2_done**: `GerechtTipWidget.svelte` rgba verwijderd; `poiCategories.ts` geconverteerd naar token-kleuren.
* **app_css_cleanup**: feature-specifieke dark overrides in `app.css` sterk teruggesnoeid naar generieke laag; componentspecifieke dark styles blijven per component.
* **regression_status**: `npm test` groen (13 testbestanden, 36 tests), inclusief semantic gate + strict critical UI gate.
* **history_compression**: pre-v1.2.7 foundation- en eerste governance-remediaties gecomprimeerd.

## next_steps
1. **p3_norm_backlog_expansion**: strict gate uitbreiden van kritieke scope naar bredere componentset na batch-migraties.
2. **p3_component_token_pass**: resterende niet-kritieke hardcoded waarden in `WeerDagen`, `GerechtenHeader`, `routes/+page`, `routes/meer/+page` migreren.
3. **p3_arch_consolidation**: `lib/components/gerechten/` en `lib/features/gerechten/` consolideren naar eenduidige domeinmap.

## technical_debt
* **constraint_note**: CSS variabelen blijven onbruikbaar in `@media`; literal breakpoints blijven een technische uitzondering.
* **non_critical_audit_backlog**: global UI audit toont nog niet-kritieke signalen buiten strict scope; gepland voor P3 uitrol.
* **domain_migration_gap**: dubbele gerechtenmap bestaat nog parallel en beïnvloedt onderhoudslast.
