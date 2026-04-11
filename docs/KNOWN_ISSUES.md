# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.12]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> Geen openstaande P1/P2/P3/P4/P5-afwijkingen. UI-norm, semantische en a11y-audits staan op afdwingende test-gates.

## Openstaande Issues
* **Geen openstaande non-feature issues of backlogpunten.**

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` faalt op violations.
* **UI gate actief (full scope)**: `ui-norm-audit` faalt op niet-getokeniseerde waarden in `src/`, met expliciete media-breakpoint-exceptions.
* **A11y regressiegate actief**: `a11y-regression-audit` faalt op focus/reduced-motion/tabindex/toetsenbord/contrast regressies.
* **Primitive contract gate actief**: `ui-primitives.test.ts` bewaakt kerncontracten voor `Button`, `Card` en `Input`.
* **Typecheck gate schoon**: `npm run check` geeft 0 errors en 0 warnings.
* **CI pipeline actief**: `.github/workflows/ci.yml` voert `npm ci`, `npm run test` en `npm run audit:trend` uit op `main` en PR's.
* **Trendrapportage actief**: `docs/AUDIT_TREND.json` en `docs/AUDIT_TREND.md` worden per run bijgewerkt.
* **Semantic-audit exception**: `Disabled states` rule negeert `src/lib/components/ui/` om false positives op generieke primitives te voorkomen.
* **Exception policy**: toegestane media-breakpoint literals zijn `640px`, `740px`, `768px`, `880px`, `900px`, `1099px`, `1100px`.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; breakpoint-literals blijven noodzakelijk.

## Architecturale Schuld
* **Geen openstaande architecturale schuld buiten featureontwikkeling.**

## Resolved Features & Debts ([v1.2.12])
* **P5 primitive rollout**: `GedeeldeLijst`, `Budget` en `WildlifeChecklist` gemigreerd naar `Button/Input/Card` primitives.
* **P5 primitive contract testing**: regressiesuite toegevoegd voor UI-primitives (`src/lib/components/ui/ui-primitives.test.ts`).
* **P5 typecheck closure**: alle bekende `npm run check` fouten opgelost; codebase is typecheck-schoon.
* **P5 overnachtingen cleanup**: onmount listener leak in `OvernachtingenPlanner.svelte` opgelost.
* **P5 audit trend alignment**: trendscript gealigneerd met semantic gate zodat false positives op UI-primitives niet meer in trenddata landen.
* **P4 UI primitive foundation**: `Button`, `Card` en `Input` componenten toegevoegd onder `src/lib/components/ui/`.
* **P4 CI governance**: centrale CI-workflow met verplichte test + audit-trend stappen actief.
* **P4 a11y regressies**: audit-suite actief voor focus, reduced-motion, keyboard semantics, `tabindex` en contrastchecks.
