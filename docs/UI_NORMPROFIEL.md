# UI_NORMPROFIEL.md

Dit bestand is de markdown-variant van de actieve UI-leidraad.
De bron blijft `docs/UI_NORMPROFIEL.txt`; dit document bevat het praktische spiekbriefje met exacte classnames/tokens die we in code gebruiken.

## Verplichte Tokens
- Kleuren: `--bg-*`, `--text-*`, `--border-*`, `--color-success-*`, `--color-warning-*`, `--color-error-*`
- Typografie: `--font-sans`, `--text-*`, `--leading-*`, `--ui-widget-*`
- Layout: `--space-*`, `--radius-*`, `--shadow-*`
- Touch: `--ui-touch-min`, `--ui-touch-compact`, `--ui-btn-height`, `--ui-btn-height-compact`

## Standaard Component Classes
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.btn-pill`
- Chips/Pills: `.ui-chip`, `.ui-chip--muted`, `.ui-chip--info`, `.ui-chip--success`, `.ui-chip--warning`, `.ui-chip--danger`
- Uniforme pill controls: `.pill`, `.wl-pill`, `.gr-pill`, `.poi-pill`, `.cat-pill`
- Filter patroon: `.ui-filter-input`, `.ui-filter-toggle`, `.ui-filter-badge`

## Budget Categorie Kleuren (token-only)
- `--budget-cat-dining`
- `--budget-cat-boodschappen`
- `--budget-cat-overnachting`
- `--budget-cat-benzine`
- `--budget-cat-tol`
- `--budget-cat-uitjes`
- `--budget-cat-overig`

## Regio-Schrijfwijze
- Lozère
- Ariège
- Pyrénées Ariégeoises

## Harde Verboden
- Geen Tailwind classes
- Geen Shadcn
- Geen inline styles
- Geen hardcoded CSS-waarden in componenten (`px`, `rem`, `hex`, `rgba`, kleurnamen), behalve strikt noodzakelijke layout-geometrie
