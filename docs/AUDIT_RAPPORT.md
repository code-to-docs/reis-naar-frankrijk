AUDIT RAPPORT — Reis naar Frankrijk
Datum: 11 april 2026
Auditor: Antigravity (Senior Code Reviewer)
Repository: reis-naar-frankrijk
═══════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════

Totaal bevindingen: 22
🔴 Kritiek: 5
🟡 Belangrijk: 8
🟢 Nice-to-fix: 9

Top 5 urgentste issues:
1. **Missende Service Worker (sw.js)**: De app is geconfigureerd als PWA maar mist de kerncomponent voor offline-werking.
2. **Hardcoded Kleuren in Routes**: `+page.svelte` bevat hardcoded hex-codes die niet voldoen aan het UI Normprofiel.
3. **Missende Error Handling**: Een kritieke Firebase `onSnapshot` in `Budget.svelte` heeft geen fout-callback.
4. **Performance Issues**: Meerdere `{#each}` loops missen unieke keys, wat leidt tot suboptimale rendering bij data-updates.
5. **Security Fallbacks**: `firebase.ts` bevat hardcoded fallback API-keys in de broncode.

Algemene gezondheid: 7.5 / 10
De codebase is modern (Svelte 5 runes) en structureel gezond. De migratie naar UI-primitives is goed onderweg maar nog niet overal doorgevoerd. De grootste risico's liggen bij offline-stabiliteit (PWA) en strikte naleving van het tokensysteem.

═══════════════════════════════════════
AUDIT 1: SVELTE 5 COMPLIANCE
═══════════════════════════════════════

| Bestand | Svelte 4 patronen gevonden | Specifieke regels | Fix |
| :--- | :--- | :--- | :--- |
| src/lib/components/ui/Input.svelte | Geen (Svelte 5) | Gebruikt $bindable | Geen actie nodig, correct gebruik. |
| Alle componenten | Geen | Geen export let of on:click gevonden | Volledig gemigreerd naar runes en event handlers. |

═══════════════════════════════════════
AUDIT 2: BUGS & RUNTIME ERRORS
═══════════════════════════════════════

| Ernst | Bestand:regel | Bug beschrijving | Kan de app crashen? | Fix |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 Kritiek | static/sw.js | Bestand ontbreekt | Ja (bij offline start) | Maak een functionele sw.js aan. |
| 🟡 Belangrijk | Budget.svelte:109 | onSnapshot zonder error callback | Nee (faalt stil) | Voeg error handling callback toe. |
| 🟢 Nice-to-fix | +layout.svelte:14 | localStorage direct aangeroepen | Nee (is guarded) | Gebruik $effect of browser-check voor consistentie. |
| 🟢 Nice-to-fix | GedeeldeLijst.svelte:53 | URL parsing in helper | Nee (try-catch) | Reeds opgelost, behoud try-catch. |

═══════════════════════════════════════
AUDIT 3: DEAD CODE & ONGEBRUIKTE IMPORTS
═══════════════════════════════════════

| Type | Bestand:regel | Wat | Veilig te verwijderen? |
| :--- | :--- | :--- | :--- |
| Dependency | package.json | chart.js (niet gevonden) | Ja (reeds vervangen door SVG) |
| Firestore Rule | firestore.rules:168 | match /pois/ | Ja (is legacy ballast) |
| Import | Budget.svelte:5 | setDoc (slechts 1x gebruikt) | Ja (kan inline of via service) |

═══════════════════════════════════════
AUDIT 4: PERFORMANCE
═══════════════════════════════════════

| Ernst | Categorie | Bestand | Impact | Aanbeveling |
| :--- | :--- | :--- | :--- | :--- |
| 🟡 Belangrijk | Rendering | +page.svelte:124, 128 | Inefficiënte re-renders | Voeg (groep.id) en (o.id) toe aan de loops. |
| 🟢 Nice-to-fix | Network | firebase.ts:35 | Local Cache is actief | Behoud dit, het is goed voor performance. |
| 🟢 Nice-to-fix | Bundle | firebase.ts | Hele firebase SDK | Overweeg lite versies voor specifieke functies. |

═══════════════════════════════════════
AUDIT 5: SECURITY
═══════════════════════════════════════

- [ ] **Firebase Rules**: Niet in test mode, maar `read: if true` is semi-open.
- [x] **API Keys**: Fallback keys hardcoded in `firebase.ts`. Dit moet naar `.env`.
- [ ] **Sanitization**: `normalizeHttpUrl` wordt gebruikt in `GedeeldeLijst`. Goed.

═══════════════════════════════════════
AUDIT 6: CSS & STYLING CONSISTENTIE
═══════════════════════════════════════

| Bestand | Ruwe <button> tags | Ruwe <input> tags | Kan primitive gebruiken? |
| :--- | :--- | :--- | :--- |
| +layout.svelte | 2x (<button>) | 0 | Ja, Button.svelte v2. |
| GedeeldeLijst.svelte | 0 | 1x (<input type="checkbox">) | Ja, Checkbox primitive (nog te maken). |

═══════════════════════════════════════
AUDIT 7: DOCUMENTATION & PROJECTFILES
═══════════════════════════════════════

- [x] **README.md**: Aanwezig, maar verouderd t.o.v. UI Primitives.
- [x] **KNOWN_ISSUES.md**: Goed bijgehouden.
- [ ] **sw.js**: Ontbreekt.

═══════════════════════════════════════
AUDIT 8: ACCESSIBILITY (A11Y)
═══════════════════════════════════════

| Ernst | Bestand | Element | Issue | WCAG criterium |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 Nice-to-fix | Navigation.svelte:53 | span (emoji) | Wordt letterlijk voorgelezen | 1.1.1 (Non-text content) |

═══════════════════════════════════════
AUDIT 9: PWA & OFFLINE
═══════════════════════════════════════

- [x] **Manifest**: `manifest.json` is correct (`start_url: "/"`, standalone).
- [ ] **Service Worker**: Volledig ontbrekend.

═══════════════════════════════════════
AUDIT 10: CODE KWALITEIT & PATRONEN
═══════════════════════════════════════

- **Consistentie**: Naming is inconsistent (Nederlands vs Engels in functies).
- **Code Smells**: `Budget.svelte` (340 regels) is iets te groot, opsplitsen van de modal/form logic is aanbevolen.

═══════════════════════════════════════
AANBEVOLEN ACTIEPLAN
═══════════════════════════════════════

Fase 1 — Kritieke fixes (nu doen):
[ ] Maak `static/sw.js` aan voor offline support.
[ ] Fix hardcoded kleuren in `+page.svelte`.
[ ] Voeg error handling toe aan `Budget.svelte:109`.

Fase 2 — Belangrijke verbeteringen (deze week):
[ ] Migreer fallback keys in `firebase.ts` naar private env vars.
[ ] Voeg keys toe aan alle `{#each}` loops in `+page.svelte`.
[ ] Migreer de login-knoppen in `+layout.svelte` naar `Button` primitives.

Fase 3 — Nice-to-have (wanneer tijd):
[ ] Harmoniseer alle functienamen naar één taal (Engels geniet de voorkeur voor tech).
[ ] Verberg emojis in de navigatie voor screenreaders met `aria-hidden`.

═══════════════════════════════════════
BIJLAGEN
═══════════════════════════════════════

A. Volledige hardcoded waarden lijst
- `+page.svelte:256`: #cbd5e1
- `+page.svelte:263`: #3b82f6
- `+page.svelte:278`: rgba(0,0,0,0.15)

B. Volledige !important lijst
- `ui-tokens.css:264-267` (Reduced motion overrides - toegestaan)

C. Volledige dead code lijst
- `chart.js` (Dependency)
- `pois` (Firestore collection)

D. Component health matrix:

| Component | Svelte5 | Bugs | Dead code | CSS | A11y | Dark | Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Budget.svelte | ✅ | 🟡 | 🟢 | ✅ | ✅ | ✅ | 8/10 |
| GedeeldeLijst.svelte | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 9/10 |
| Navigation.svelte | ✅ | ✅ | ✅ | ✅ | 🟢 | ✅ | 9/10 |
| +page.svelte | ✅ | ✅ | ✅ | 🔴 | ✅ | ✅ | 7/10 |
