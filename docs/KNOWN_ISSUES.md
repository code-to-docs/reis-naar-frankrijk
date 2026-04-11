# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.11]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> Geen openstaande P1/P2/P3/P4-afwijkingen. UI-norm, semantische en a11y-audits staan op afdwingende test-gates.

## Openstaande Issues
* **Typecheck backlog buiten actieve gates**: `npm run check` faalt nog op bestaande typefouten in `src/lib/components/wildlife/WildlifeCard.test.ts`, `src/lib/features/gerechten/composables/useGerechtenGps.svelte.ts`, `src/lib/components/OvernachtingenPlanner.svelte`.

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` faalt op violations.
* **UI gate actief (full scope)**: `ui-norm-audit` faalt op niet-getokeniseerde waarden in `src/`, met expliciete media-breakpoint-exceptions.
* **A11y regressiegate actief**: `a11y-regression-audit` faalt op focus/reduced-motion/tabindex/toetsenbord/contrast regressies.
* **CI pipeline actief**: `.github/workflows/ci.yml` voert `npm ci`, `npm run test` en `npm run audit:trend` uit op `main` en PR's.
* **Trendrapportage actief**: `docs/AUDIT_TREND.json` en `docs/AUDIT_TREND.md` worden per run bijgewerkt.
* **Semantic-audit exception**: `Disabled states` rule negeert `src/lib/components/ui/` om false positives op generieke primitives te voorkomen.
* **Exception policy**: toegestane media-breakpoint literals zijn `640px`, `740px`, `768px`, `880px`, `900px`, `1099px`, `1100px`.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; breakpoint-literals blijven noodzakelijk.

## Architecturale Schuld
* **Primitive rollout nog incompleet**: primitives bestaan, maar migratie in kernfeatures (`GedeeldeLijst`, `Budget`, `WildlifeChecklist`) staat nog open.

## Resolved Features & Debts ([v1.2.11])
* **P4 UI primitive foundation**: `Button`, `Card` en `Input` componenten toegevoegd onder `src/lib/components/ui/`.
* **P4 meer-menu POC**: uitlogactie in `src/routes/meer/+page.svelte` gemigreerd naar `Button variant="destructive"`.
* **P4 meer-detail POC**: terugnavigatie in `src/routes/meer/[id]/+page.svelte` gemigreerd naar `Button` met `href`.
* **P4 semantic gate alignment**: false positives op `Disabled states` voor primitives opgeheven via gerichte test-exception.
* **P4 CI governance**: centrale CI-workflow met verplichte test + audit-trend stappen actief.
* **P4 audit trending**: tijdreeks-artefacten voor auditviolations actief (`AUDIT_TREND.json`, `AUDIT_TREND.md`).
* **P4 a11y regressies**: audit-suite actief voor focus, reduced-motion, keyboard semantics, `tabindex` en contrastchecks.
