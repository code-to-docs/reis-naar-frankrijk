# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.10]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> Geen openstaande P1/P2/P3/P4-afwijkingen. UI-norm, semantische en a11y-audits staan op afdwingende test-gates.

## Openstaande Issues
* **Geen openstaande functionele of compliance issues in scope van huidige sprint.**

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` faalt op violations.
* **UI gate actief (full scope)**: `ui-norm-audit` faalt op niet-getokeniseerde waarden in `src/`, met expliciete media-breakpoint-exceptions.
* **A11y regressiegate actief**: `a11y-regression-audit` faalt op focus/reduced-motion/tabindex/toetsenbord/contrast regressies.
* **CI pipeline actief**: `.github/workflows/ci.yml` voert `npm ci`, `npm run test` en `npm run audit:trend` uit op `main` en PR's.
* **Trendrapportage actief**: `docs/AUDIT_TREND.json` en `docs/AUDIT_TREND.md` worden per run bijgewerkt.
* **Exception policy**: toegestane media-breakpoint literals zijn `640px`, `740px`, `768px`, `880px`, `900px`, `1099px`, `1100px`.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; breakpoint-literals blijven noodzakelijk.

## Architecturale Schuld
* **Geen kritieke architecturale blokkades open**; resterende punten zijn governance/monitoring en CI-policy-verankering.

## Resolved Features & Debts ([v1.2.10])
* **P4 CI governance**: centrale CI-workflow toegevoegd met verplichte test + audit-trend stappen voor pre-merge signalering.
* **P4 audit trending**: tijdreeks-artefacten voor auditviolations toegevoegd (`AUDIT_TREND.json`, `AUDIT_TREND.md`).
* **P4 a11y regressies**: nieuwe audit-suite toegevoegd voor focus, reduced-motion, keyboard semantics, `tabindex` en contrastchecks.
* **P3 component token pass**: resterende px-signalen weggewerkt in kerncomponenten en route-views.
* **P3 global token pass**: `app.css` resterende vaste px-waarden vervangen door token/calc-varianten.
* **P2 categoriekleuren**: `src/lib/poiCategories.ts` geconverteerd van hex naar semantische CSS tokens.
* **P1 dark alignment**: pre-hydration dark bootstrap en stores-flow geharmoniseerd zonder themamismatch.
