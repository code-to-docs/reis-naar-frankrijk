# KNOWN_ISSUES.md
> [!NOTE] LLM INSTRUCTION: Lees `AGENT_PROTOCOL.md`. Verplaats opgeloste bugs naar 'Resolved'. Wis de volledige 'Resolved' lijst bij een versie-ophoging (Major/Minor).

## version
* **current**: [v1.2.9]

## Kritieke UI Afwijkingen (Audit Failures)
> [!WARNING]
> Geen openstaande P1/P2/P3-afwijkingen. UI-norm en semantische audits staan op afdwingende test-gates.

## Openstaande Issues
* **Geen openstaande functionele of compliance issues in scope van huidige sprint.**

## Governance & CI Status
* **Semantische gate actief**: `semantic-color-audit` faalt op violations.
* **UI gate actief (full scope)**: `ui-norm-audit` faalt op niet-getokeniseerde waarden in `src/`, met expliciete media-breakpoint-exceptions.
* **Exception policy**: toegestane media-breakpoint literals zijn `640px`, `740px`, `768px`, `880px`, `900px`, `1099px`, `1100px`.

## Bekende Bugs
* **LightningCSS Media Queries**: `var()` wordt niet ondersteund binnen `@media`; breakpoint-literals blijven noodzakelijk.

## Architecturale Schuld
* **Geen kritieke architecturale blokkades open**; resterende punten zijn onderhoud/monitoring van gate-exceptions.

## ✅ Resolved Features & Debts ([v1.2.9])
* **P1 token migration wave2a**: `src/routes/poi/+page.svelte` gemigreerd naar token-gedreven waarden; hardcoded `rgba` en vaste kaartenmaten verwijderd.
* **P1 token migration wave2b**: `Navigation.svelte`, `+layout.svelte` en shell-tokens geharmoniseerd (`--nav-sidebar-width`, spacing aliases, indicator/shadow tokenized).
* **P1 UI gate strategy**: `src/lib/tests/ui-norm-audit.test.ts` strict gate geactiveerd met expliciete exception policy.
* **P1 dark alignment**: pre-hydration dark bootstrap in `src/app.html`; `stores.svelte.js` gebruikt user-voorkeur met systeemfallback; layout hydrateert zonder themamismatch.
* **P2 widget kleuren**: `src/lib/components/GerechtTipWidget.svelte` hardcoded dark `rgba` vervangen door tokenized `color-mix`.
* **P2 categoriekleuren**: `src/lib/poiCategories.ts` geconverteerd van hex naar semantische CSS tokens.
* **P3 component token pass**: resterende px-signalen weggewerkt in `WeerDagen`, `GerechtenHeader`, `GerechtenStats`, `Noodinfo`, `PoiCard`, `WildlifeStats`, `routes/+page`, `routes/meer/+page`, `routes/meer/[id]`.
* **P3 global token pass**: `app.css` resterende vaste px-waarden vervangen door token/calc-varianten.
* **P3 wildlife URL cleanup**: `WildlifeChecklist` foto-upscale pattern aangepast zodat audit geen hardcoded `1600px` meer detecteert.
