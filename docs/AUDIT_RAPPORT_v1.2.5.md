# AUDIT RAPPORT — Reis naar Frankrijk
Datum: 2026-04-11
Auditor: Codex GPT-5.3

## EXECUTIVE SUMMARY
- De codebase is functioneel stabiel, maar wijkt nog substantieel af van het normprofiel op token-consistentie en button-standaardisatie.
- Het normprofiel is sterk op basisprincipes (kleur, type, spacing, componenten), maar mist meerdere concrete patronen die in deze app vaak voorkomen (snackbar, FAB, toggle, offline indicators).
- De implementatie gebruikt `html.dark` met lokale opslag per gebruiker; het normprofiel verwacht `prefers-color-scheme`, waardoor een structurele methode-gap bestaat.
- Hardcoded waarden zitten vooral in feature-UI (Gerechten, POI, Wildlife, app shell) en in media/layout constants.
- Button-landschap is versnipperd: 126 interactieve knoppen/links, 70 unieke stijlprofielen (geautomatiseerde detectie), waar normprofiel in de praktijk naar ±8 gestandaardiseerde varianten zou moeten.

## FASE 1: NORMPROFIEL COMPLETENESS

### 1A. Ontbrekende definities
- Snackbar / Toast component: [MISSING]
- Toggle / Switch component: [PARTIAL] vaag/incompleet (geen expliciete specs in sectie 10)
- Checkbox styling: [PARTIAL] vaag/incompleet (wel touch-target guidance, geen component-spec)
- Radio button styling: [MISSING]
- Progress bar / voortgangsbalk: [MISSING] (geen sectie/spec)
- Search/filter input: [PARTIAL] vaag/incompleet (filter patroon genoemd in markdown cheat sheet, geen volledige spec in txt)
- FAB: [MISSING]
- Swipe-to-delete / undo pattern: [MISSING]
- Pull-to-refresh pattern: [MISSING]
- Tab / Pill filter component: [PARTIAL] deels (chips wel, tabs/pills als navigatiefilter niet volledig)
- Accordion / expandable sections: [MISSING]
- Image placeholder / skeleton voor foto's: [PARTIAL] deels (skeleton algemeen, niet image-specifiek)
- Avatar / gebruiker indicator: [MISSING]
- Datum/tijd weergave formaat: [MISSING]
- Emoji gebruik: [MISSING]
- Offline state indicator: [MISSING]
- Header component: [MISSING]
- Terug-navigatie pattern: [MISSING]
- Groepslabels boven secties: [MISSING]
- Haptic feedback patterns: [MISSING]
- Kaart-varianten (standaard, accent, status-gebaseerd, gradient): [MISSING]
- Link styling (inline tekst links vs navigatie links): [PARTIAL] vaag/incompleet
- Destructieve actie bevestiging (direct vs confirmatie): [MISSING]
- Lege staat per collectie (tekst, emoji, CTA): [PARTIAL] deels (alleen generieke empty-state)
- Maximaal aantal nesting levels in UI: [MISSING]
- Z-index systeem (welke lagen, volgorde): [MISSING]
- Safe area handling (notch, home indicator): [PARTIAL] deels
- Scroll behavior binnen secties vs pagina: [PARTIAL] vaag/incompleet

### 1B. Tegenstrijdigheden
- Button border-radius (sectie 6 vs 10.1): [OK] geen directe tegenspraak in normprofiel; beide wijzen naar `--radius-button`.
- Card padding (sectie 5 vs 10.2): [OK] consistent (`--padding-card`).
- Font sizes (sectie 4 vs 10.x): [OK] grotendeels consistent; componentspecs gebruiken tokens uit schaal.
- Input border width: [PARTIAL] normprofiel 10.3 specificeert `1px`; implementatie gebruikt `1.5px` in `src/app.css`.
- Dark mode methode: [CONFLICT] structureel conflict. Normprofiel gebruikt `@media (prefers-color-scheme: dark)`, implementatie gebruikt handmatige `html.dark` class + per-user localStorage.
- Responsive breakpoints: [PARTIAL] normprofiel noemt 1024/1280; implementatie gebruikt op veel plekken 1100px-literals i.v.m. LightningCSS-beperking.

### 1C. TOP 10 ontbrekende definities (impact op deze app)
1. Snackbar/toast patroon (app-breed feedbackkanaal)
2. Destructieve actie-confirmatie patroon (verwijderen in lijsten)
3. FAB-specificatie (budget quick add)
4. Toggle/switch-specificatie (dark mode)
5. Header + back-navigation patroon (route-consistentie)
6. Datum/tijd-format standaard (budget, wildlife, overnachtingen)
7. Offline-state patroon (PWA-verwachting)
8. Tab/Pill filter-spec (wildlife/gerechten/POI filters)
9. Accordion/expandable gedrag (wildlife/gerechten cards)
10. Z-index/layering systeem (modals, overlays, nav, snackbar)

## FASE 2: CODEBASE COMPLIANCE

### 2A. Token compliance per bestand
Meetmethode:
- Geautomatiseerde scan op hardcoded waarden in `src/**/*.svelte|css|ts`.
- Token-definitiebestanden (`ui-tokens.css`, `ui-norm-profile.css`) buiten deze tabel gehouden.
- Totaal (scan): 28 hardcoded kleurwaarden, 337 hardcoded spacing/layout waarden, 1 hardcoded shadow, 17 hardcoded font-sizes buiten tokens.

| Bestand | Hardcoded kleuren | Hardcoded spacing | Hardcoded radius | Hardcoded shadows | Hardcoded font-sizes |
|---|---:|---:|---:|---:|---:|
| src/app.css | 2 | 39 | 0 | 1 | 0 |
| src/lib/features/gerechten/components/GerechtCard.svelte | 5 | 28 | 0 | 0 | 2 |
| src/routes/poi/+page.svelte | 7 | 23 | 0 | 0 | 2 |
| src/lib/components/Header.svelte | 0 | 13 | 0 | 0 | 3 |
| src/lib/components/overnachtingen/OvernachtingenCalendarBoard.svelte | 0 | 16 | 0 | 0 | 0 |
| src/lib/components/Navigation.svelte | 0 | 15 | 0 | 0 | 0 |
| src/lib/components/wildlife/WildlifeCard.svelte | 0 | 15 | 0 | 0 | 0 |
| src/lib/components/wildlife/WildlifeStats.svelte | 1 | 10 | 0 | 0 | 2 |
| src/lib/features/gerechten/components/GerechtenTipCard.svelte | 6 | 7 | 0 | 0 | 0 |
| src/lib/components/WildlifeChecklist.svelte | 0 | 12 | 0 | 0 | 0 |
| src/lib/features/gerechten/components/GerechtenHeader.svelte | 0 | 12 | 0 | 0 | 0 |
| src/lib/components/Noodinfo.svelte | 0 | 8 | 0 | 0 | 3 |
| src/lib/components/poi/PoiCard.svelte | 0 | 11 | 0 | 0 | 0 |
| src/lib/features/gerechten/components/GerechtenStats.svelte | 0 | 10 | 0 | 0 | 1 |
| src/routes/+layout.svelte | 0 | 10 | 0 | 0 | 1 |
| src/routes/meer/+page.svelte | 0 | 9 | 0 | 0 | 1 |
| src/lib/components/budget/BudgetEntriesList.svelte | 0 | 7 | 0 | 0 | 2 |
| src/lib/components/BudgetForm.svelte | 0 | 9 | 0 | 0 | 0 |
| src/lib/components/poi/PoiFormModal.svelte | 0 | 9 | 0 | 0 | 0 |
| src/lib/components/weer/WeerDagen.svelte | 0 | 8 | 0 | 0 | 0 |
| src/lib/components/overnachtingen/OvernachtingenListsSection.svelte | 0 | 7 | 0 | 0 | 0 |
| src/routes/+page.svelte | 0 | 7 | 0 | 0 | 0 |
| src/lib/components/WeerWidget.svelte | 0 | 6 | 0 | 0 | 0 |
| src/lib/poiCategories.ts | 6 | 0 | 0 | 0 | 0 |
| src/lib/components/GedeeldeLijst.svelte | 0 | 5 | 0 | 0 | 0 |
| src/lib/components/overnachtingen/OvernachtingenFormPanel.svelte | 0 | 5 | 0 | 0 | 0 |
| src/lib/components/wildlife/WildlifeInfoPanel.svelte | 0 | 5 | 0 | 0 | 0 |
| src/lib/components/SpotVanDeDag.svelte | 0 | 4 | 0 | 0 | 0 |
| src/lib/features/gerechten/components/GerechtenList.svelte | 0 | 4 | 0 | 0 | 0 |
| src/lib/components/Budget.svelte | 0 | 3 | 0 | 0 | 0 |
| src/lib/components/overnachtingen/OvernachtingenTabs.svelte | 0 | 3 | 0 | 0 | 0 |
| src/lib/components/weer/WeerAlerts.svelte | 0 | 3 | 0 | 0 | 0 |
| src/lib/components/budget/BudgetFilters.svelte | 0 | 2 | 0 | 0 | 0 |
| src/lib/components/budget/BudgetHeroCard.svelte | 0 | 2 | 0 | 0 | 0 |
| src/lib/components/GerechtTipWidget.svelte | 1 | 1 | 0 | 0 | 0 |
| src/routes/meer/[id]/+page.svelte | 0 | 2 | 0 | 0 | 0 |
| src/lib/components/budget/BudgetSettlementCard.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/components/BudgetChart.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/components/overnachtingen/OvernachtingenEmptyState.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/components/overnachtingen/OvernachtingenHeader.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/components/OvernachtingenPlanner.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/components/Snackbar.svelte | 0 | 1 | 0 | 0 | 0 |
| src/lib/features/gerechten/GerechtenFeature.svelte | 0 | 1 | 0 | 0 | 0 |


### 2B. Button audit
Kernresultaat:
- Gedetecteerde interactieve knoppen/links: 126
- Unieke stijlprofielen (geautomatiseerd): 70
- Richting volgens normprofiel: ~8 (primary, secondary, tertiary/ghost, destructive, icon, pill, compact, large)

Gegroepeerd op type:
- `Custom`: 73 [NON-CONFORM] (buiten standaard button set)
- `Pill/Chip`: 22 ? ?? deels conform (mix van filter en actie-semantieken)
- `Primary`: 8 ? ?? deels conform
- `Secondary`: 5 ? ?? deels conform
- `Destructive`: 8 ? ?? deels conform (semantiek inconsistente class/token mix)
- `Save`: 5 ? ?? deels conform (soms gekoppeld aan `btn-danger` context)
- `Ghost`: 2 ? ?? deels conform
- `FAB`: 2 [MISSING-SPEC]
- `Icon`: 1 expliciete gestandaardiseerde variant, plus custom icon-buttons

Belangrijkste afwijkingen:
- Veel actieknoppen gebruiken context-specifieke classes i.p.v. de norm-set (`btn-primary|secondary|ghost|danger`).
- Touch-target check is vaak niet direct afleidbaar door token-driven `min-height`; handmatige review blijft nodig per component.
- A11y labels zijn meestal aanwezig bij icon/destructieve knoppen, maar niet uniform voor alle icon-only interacties.

### 2C. Component-voor-component check
Volledige matrix:
- `docs/AUDIT_COMPONENT_MATRIX_v1.2.5.csv`
- `docs/AUDIT_COMPONENT_MATRIX_v1.2.5.csv` bevat de volledige componentinventaris

Samenvatting op componentniveau:
- src/lib/components/Budget.svelte: spacing:1px, 1100px; darkOverride=nee; runes=ja
- src/lib/components/budget/BudgetEntriesList.svelte: spacing:2px, 1px, 1.4rem; darkOverride=nee; runes=ja
- src/lib/components/budget/BudgetFilters.svelte: spacing:1px; darkOverride=nee; runes=ja
- src/lib/components/budget/BudgetHeroCard.svelte: spacing:0.03em, 1px; darkOverride=nee; runes=ja
- src/lib/components/budget/BudgetSettlementCard.svelte: spacing:1px; darkOverride=nee; runes=ja
- src/lib/components/BudgetChart.svelte: spacing:1px; darkOverride=ja; runes=ja
- src/lib/components/BudgetForm.svelte: spacing:1px, 76dvh, 0.01em ; aria:1; darkOverride=ja; runes=ja
- src/lib/components/GedeeldeLijst.svelte: spacing:1.55rem, 4.2vw, 0.02em; darkOverride=nee; runes=ja
- src/lib/components/GerechtTipWidget.svelte: colors:rgba(14, 165, 164, 0.18) ; spacing:1px; darkOverride=ja; runes=ja
- src/lib/components/Header.svelte: spacing:2px, 1.75rem, 4.8vw; darkOverride=ja; runes=ja
- src/lib/components/Navigation.svelte: spacing:2px, 14px, 1px ; touch<44:color: var(--nav-active);
    font-weight: var(--weight-bold);
  }

  .nav-indicator => 3px; darkOverride=nee; runes=ja
- src/lib/components/Noodinfo.svelte: spacing:1.4rem, 0.01em, 14px; darkOverride=ja; runes=nee
- src/lib/components/overnachtingen/OvernachtingenCalendarBoard.svelte: spacing:1px, 2px, 768px; darkOverride=ja; runes=ja
- src/lib/components/overnachtingen/OvernachtingenEmptyState.svelte: spacing:640px; darkOverride=nee; runes=ja
- src/lib/components/overnachtingen/OvernachtingenFormPanel.svelte: spacing:5px, 0.03em, 1px; darkOverride=ja; runes=ja
- src/lib/components/overnachtingen/OvernachtingenHeader.svelte: spacing:640px; darkOverride=nee; runes=ja
- src/lib/components/overnachtingen/OvernachtingenListsSection.svelte: spacing:1px, 768px; darkOverride=ja; runes=ja
- src/lib/components/overnachtingen/OvernachtingenTabs.svelte: spacing:1px, 768px; darkOverride=nee; runes=ja
- src/lib/components/OvernachtingenPlanner.svelte: spacing:640px; darkOverride=nee; runes=ja
- src/lib/components/poi/PoiCard.svelte: spacing:5px, 1px, 28px ; touch<44:display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--nav-text);
    font-weight: var(--ui-weight-medium);
  }

  .poi-priority => 34px; darkOverride=ja; runes=ja
- src/lib/components/poi/PoiFormModal.svelte: spacing:1px, 82dvh, 768px; darkOverride=ja; runes=ja
- src/lib/components/Snackbar.svelte: spacing:2px; darkOverride=nee; runes=ja
- src/lib/components/SpotVanDeDag.svelte: spacing:1px, 2px, 768px; darkOverride=nee; runes=ja
- src/lib/components/weer/WeerAlerts.svelte: spacing:1px, 0.08em, 0.01em; darkOverride=nee; runes=ja
- src/lib/components/weer/WeerDagen.svelte: spacing:3px, 14px, 1px; darkOverride=nee; runes=ja
- src/lib/components/WeerWidget.svelte: spacing:2px, 0.02em, 1px; darkOverride=nee; runes=ja
- src/lib/components/wildlife/WildlifeCard.svelte: spacing:1px, 2px, 260px; darkOverride=ja; runes=ja
- src/lib/components/wildlife/WildlifeFullscreenOverlay.svelte: geen directe hardcoded/a11y flags via scan; darkOverride=nee; runes=ja
- src/lib/components/wildlife/WildlifeInfoPanel.svelte: spacing:1px, 0.03em, 900px; darkOverride=ja; runes=ja
- src/lib/components/wildlife/WildlifeStats.svelte: colors:rgba(0,0,0,0.08) ; spacing:2px, 2.1rem, 5vw; darkOverride=ja; runes=ja
- src/lib/components/WildlifeChecklist.svelte: spacing:2px, 1px, 18px ; touch<44:margin-top: var(--space-3);
    }
    .wl-pill => 42px; darkOverride=ja; runes=ja
- src/lib/features/gerechten/components/GerechtCard.svelte: colors:rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.2) ; spacing:2px, 1px, 52px ; touch<44:margin-top: var(--space-1-5);
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .gr-tag => 26px | font-size: var(--text-base);
    }
    .gr-user-pill => 42px; darkOverride=ja; runes=ja
- src/lib/features/gerechten/components/GerechtenHeader.svelte: spacing:92px, 18px, 5px ; touch<44:min-height: var(--space-12);
      min-width: 108px;
      font-size: var(--text-base);
    }
    .gr-pill => 42px; darkOverride=ja; runes=ja
- src/lib/features/gerechten/components/GerechtenList.svelte: spacing:2px, 1100px; darkOverride=ja; runes=ja
- src/lib/features/gerechten/components/GerechtenStats.svelte: spacing:2px, 1px, 60px; darkOverride=ja; runes=ja
- src/lib/features/gerechten/components/GerechtenTipCard.svelte: colors:rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.66) ; spacing:1px, 0.4px, 2px; darkOverride=ja; runes=nee
- src/lib/features/gerechten/GerechtenFeature.svelte: spacing:1100px; darkOverride=nee; runes=ja
- src/routes/+layout.svelte: spacing:100dvh, 3.2rem, 11vw; darkOverride=nee; runes=ja
- src/routes/+page.svelte: spacing:1px, 110px, 0.01em; darkOverride=ja; runes=nee
- src/routes/budget/+page.svelte: geen directe hardcoded/a11y flags via scan; darkOverride=nee; runes=nee
- src/routes/campings/+page.svelte: geen directe hardcoded/a11y flags via scan; darkOverride=nee; runes=nee
- src/routes/meer/[id]/+page.svelte: spacing:14px, 1px; darkOverride=nee; runes=ja
- src/routes/meer/+page.svelte: spacing:0.04em, 1px, 14px; darkOverride=nee; runes=nee
- src/routes/poi/+page.svelte: colors:rgba(148, 163, 184, 0.16), rgba(148, 163, 184, 0.32) ; spacing:0.04em, 1.65rem, 5vw ; touch<44:display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin: 0;
    color: var(--nav-text);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
  }

  .poi-filter-count => 26px; darkOverride=ja; runes=ja


Observaties op basis van de volledige componentscan:
- Hardcoded waarden clusteren in: `GerechtCard.svelte`, `routes/poi/+page.svelte`, `Header.svelte`, `Navigation.svelte`, `WildlifeCard.svelte`.
- Svelte 5 runes worden breed gebruikt; geen actieve `export let` regressiepatronen gedetecteerd.
- Enkele componenten zonder lokale dark-overrides vertrouwen op globale tokens; dat is acceptabel als kleuren token-based blijven.
- Compacte controls onder 44px bestaan als expliciet dense pattern (o.a. pills), maar niet altijd als `touch-target-compact` gedocumenteerde keuze.

### 2D. Dark mode integriteit
1. `html.dark` selectors in `app.css`:
- 47 selectors/selectorblokken.

2. Component-specifieke kleuren zonder dark override:
- Geen directe kritieke gevallen gevonden waar hardcoded kleur in component staat zonder dark pad.
- Wel meerdere componenten die op globale dark-overrides leunen i.p.v. lokale override.

3. Zijn er visueel "gebroken" combinaties?
- Potentieel risico bij custom gradients/rgba overlays in `GerechtenTipCard.svelte`, `SpotVanDeDag` dark-varianten en `fab-form` shadow.
- Geen automatische contrastberekening uitgevoerd; handmatige visuele QA nodig.

4. Klopt de dark mode toggle flow?
- Ja. Flow: `stores.svelte.js` (`toggleDarkMode`/`applyDarkMode`) ? localStorage key `darkmode_<gebruiker>` => `html.dark` class.

5. Is er een FOUC bij page load in dark mode?
- Risico aanwezig: dark class wordt client-side toegepast; bij eerste paint kan korte mismatch zichtbaar zijn.

6. Wordt de dark mode class verwijderd bij uitloggen?
- Indirect ja via reload + init-flow.
- Opmerking: `darkmode_<user>` localStorage entries blijven bestaan als historische keys.

### 2E. CSS architectuur
1. Hoeveel `!important` declarations zijn er?
- 8 totaal
- `src/lib/styles/ui-norm-profile.css`: regels 73-76
- `src/lib/styles/ui-tokens.css`: regels 264-267
- Context: `prefers-reduced-motion` reset (gerechtvaardigd)

2. Zijn er specificity conflicten tussen `app.css` en component `<style>`?
- Ja, mogelijk op gedeelde selectors (`.pill`, `.wl-pill`, `.gr-pill`, `.poi-pill`, `.entry-item`, `.wl-card`, `.gr-card`, `.ov-item`).

3. Welke component styles overschrijven global styles onnodig?
- `app.css` bevat feature-specifieke dark/global overrides voor meerdere componenten (weer, spot, hero, filters) die lokaal componentbeheer doorkruisen.

4. Zijn er ongebruikte CSS regels?
- Niet met 100% zekerheid statisch aantoonbaar zonder runtime coverage.
- Verdachte regels: dev-only `test-card` pad en meerdere legacy alias-variabelen.

5. Hoeveel van de CSS variabelen uit `:root` worden daadwerkelijk gebruikt?
- Gedefinieerd in `src/app.css :root`: 39
- Gebruikt in codebase: 29
- Ongebruikt: 10

6. Hoeveel CSS variabelen uit normprofiel ontbreken in implementatie?
- Normvariabelen gedetecteerd: 197
- Ontbrekend in implementatie: 86

## FASE 3: GAP ANALYSE & PLAN

### 3A. Gap matrix
| Normprofiel sectie | Status implementatie | Gap grootte | Prioriteit |
|---------------------|----------------------|-------------|------------|
| 3. Kleursysteem | ?? Deels | L | P1 |
| 4. Typografie | ?? Deels | M | P2 |
| 5. Spacing | ?? Deels | XL | P1 |
| 6. Border radius | ?? Deels | M | P2 |
| 7. Schaduwen | ?? Deels | M | P2 |
| 8. Motion | ?? Deels | M | P2 |
| 9. Iconografie | ?? Deels | M | P3 |
| 10.1 Buttons | ? Niet conform | XL | P1 |
| 10.2 Cards | ?? Deels | L | P1 |
| 10.3 Form inputs | ?? Deels | L | P1 |
| 10.4 Navigation | ?? Deels | M | P2 |
| 10.5 Modals | ?? Deels | M | P2 |
| 10.6 Lists | ?? Deels | M | P2 |
| 10.7 Badges & Chips | ?? Deels | L | P1 |
| 10.8 Empty states | ?? Deels | M | P3 |
| 10.9 Loading states | ?? Deels | M | P3 |
| 11. Toegankelijkheid | ?? Deels | L | P1 |
| 12. Responsive | ?? Deels | L | P1 |

### 3B. Migratieplan

#### Fase 1 — Foundation (tokens)
- Doel: variabelelandschap harmoniseren met normprofiel zonder UI-breaks.
- Acties:
  1. Introduceer ontbrekende semantische families: `--color-info-*`, `--color-warm-*`, `--gap-*`, `--padding-*`, `--radius-button`, `--radius-input`.
  2. Mappinglaag toevoegen i.p.v. direct renamen.
  3. Verwijder pas ongebruikte aliases na 2 sprints groene tests.
- Mapping (huidig => norm):
  - `--btn-radius` ? `--radius-button`
  - `--btn-height` ? `--ui-touch-min`
  - `--btn-height-compact` ? `--ui-touch-compact`
  - `--input-border` ? `--border-default`
  - `--input-focus` ? `--border-focus`

#### Fase 2 — Global styles (`app.css`)
- Doel: globale stijl terugbrengen naar shell/base/tokens.
- Verwachte impact: ~180-260 regels wijzigen/verplaatsen.
- Acties:
  1. Feature-specifieke blokken uit `app.css` naar componenten.
  2. Dark overrides centraliseren op tokenniveau.
  3. Input border consistent maken met norm (1px) of normprofiel expliciet bijstellen.

#### Fase 3 — Component migratie (per component)
- L: `GerechtCard.svelte`, `routes/poi/+page.svelte`, `WildlifeCard.svelte`
- M: `Header.svelte`, `Navigation.svelte`, `WildlifeChecklist.svelte`, `Overnachtingen*`, `PoiCard.svelte`
- S: `Budget*` modules
- Werkwijze per component:
  1. Hardcoded waarden => tokens
  2. Buttons normaliseren op normvarianten
  3. A11y check
  4. Visual + interaction tests

#### Fase 4 — Dark mode alignment
- Huidige `html.dark` aanpak is functioneel voor per-user thema en compatibel met de app.
- Aanpak:
  1. `prefers-color-scheme` als default bootstrap
  2. `html.dark` als expliciete user override
  3. Minder component-level dark selectors, meer token-shifts

#### Fase 5 — Toegankelijkheid
- Quick wins:
  1. Uniforme `:focus-visible` op custom controls
  2. Icon-only knoppen verplicht `aria-label`
  3. CI-check op touch target en semantische button class
- Structureel:
  1. Keyboard flows per feature
  2. Contrast-audit automation
  3. Component contract met vaste a11y checklist

### 3C. Risico's
- Hoogste regressierisico:
  1. `app.css` opschonen (globale side effects)
  2. Button-normalisatie
  3. Dark-mode refactor
- Meest fragiele componenten:
  - `GerechtCard.svelte`, `WildlifeCard.svelte`, `routes/poi/+page.svelte`, `OvernachtingenFormPanel.svelte`
- Afhankelijkheden in volgorde:
  1. Tokenmapping
  2. Global styles
  3. Componentmigraties
  4. Dark-mode consolidatie
  5. Strengere CI-gates

## BIJLAGE: Volledige button inventaris
- `docs/AUDIT_BUTTON_INVENTARIS_v1.2.5.csv`

## BIJLAGE: Volledige hardcoded waarden lijst
- `docs/AUDIT_HARDCODED_VALUES_v1.2.5.csv`

## BIJLAGE: Voorgestelde CSS variabelen mapping
- Zie sectie `3B` in dit rapport
- Aanvullende machine-output: `audit-token-table.csv`


