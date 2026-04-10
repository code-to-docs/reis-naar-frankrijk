<script lang="ts">
  import { E } from "$lib/emojis.js";
  import type { Wildlife, WildlifeProfile } from "$lib/types.js";

  interface Props {
    dier: Wildlife;
    profiel: WildlifeProfile;
    categorieLabel: string;
  }

  let { dier, profiel, categorieLabel }: Props = $props();
</script>

<div class="wl-names">
  <div class="wl-name-row"><strong>NL</strong> {dier.naam}</div>
  <div class="wl-name-row"><strong>DE</strong> {dier.duits}</div>
  <div class="wl-name-row"><strong>LAT</strong> <i>{dier.latijn}</i></div>
  <div class="wl-name-row"><strong>TYPE</strong> {categorieLabel}</div>
</div>

<div class="wl-insights">
  <div class="wl-fact-card">
    <strong>{E.TIP} Interessant feitje</strong>
    <p class="wl-beschrijving">{profiel.feitje}</p>
  </div>
  <div class="wl-metrics-grid">
    <div class="wl-metric">
      <span class="wl-metric-label">Gewicht</span>
      <span class="wl-metric-value">{profiel.gewicht}</span>
    </div>
    <div class="wl-metric">
      <span class="wl-metric-label">Lengte</span>
      <span class="wl-metric-value">{profiel.lengte}</span>
    </div>
    <div class="wl-metric">
      <span class="wl-metric-label">Leeftijd</span>
      <span class="wl-metric-value">{profiel.leeftijd}</span>
    </div>
    <div class="wl-metric">
      <span class="wl-metric-label">Actief</span>
      <span class="wl-metric-value">{profiel.actief}</span>
    </div>
    <div class="wl-metric wl-metric--wide">
      <span class="wl-metric-label">Voeding</span>
      <span class="wl-metric-value">{profiel.voeding}</span>
    </div>
  </div>
</div>

<div class="wl-section">
  <strong>{E.TIP} Herkenningspunten</strong>
  <p class="wl-beschrijving">{dier.kenmerken}</p>
</div>

<div class="wl-section">
  <strong>{E.PIN} Waar & Wanneer</strong>
  <p class="wl-beschrijving">{dier.waar_wanneer}</p>
</div>

<style>
  .wl-names {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--bg-surface-sunken);
    padding: var(--space-3);
    border-radius: var(--radius-md);
  }
  .wl-name-row {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    display: flex;
    line-height: var(--ui-line-compact);
  }
  .wl-name-row strong {
    width: var(--space-10);
    color: var(--text-primary);
  }
  .wl-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
  }
  .wl-section strong {
    font-size: var(--text-base);
    color: var(--text-primary);
  }
  .wl-insights {
    display: grid;
    gap: var(--space-3);
  }
  .wl-fact-card {
    display: grid;
    gap: var(--space-1-5);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    background: color-mix(in srgb, var(--color-primary-100) 45%, var(--bg-surface));
  }
  .wl-fact-card strong {
    font-size: var(--text-sm);
    color: var(--heading);
  }
  .wl-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }
  .wl-metric {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-2-5) var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    background: var(--bg-surface-sunken);
  }
  .wl-metric--wide {
    grid-column: 1 / -1;
  }
  .wl-metric-label {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .wl-metric-value {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--ui-weight-semibold);
    line-height: var(--ui-line-compact);
  }
  .wl-beschrijving {
    font-size: var(--text-sm);
    line-height: var(--ui-line-body);
    color: var(--text-secondary);
    margin: 0;
  }

  @media (min-width: 900px) {
    .wl-name-row strong {
      width: var(--space-12);
    }
    .wl-insights {
      gap: var(--space-4);
    }
  }

  @media (min-width: 1100px) {
    .wl-beschrijving {
      font-size: var(--text-base);
    }
    .wl-metric-value {
      font-size: var(--text-base);
    }
  }

  :global(html.dark) .wl-names {
    background: var(--bg-surface-raised);
  }
  :global(html.dark) .wl-fact-card {
    background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary-700) 30%, transparent), var(--bg-surface-raised));
    border-color: var(--border-strong);
  }
  :global(html.dark) .wl-metric {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
  }
  :global(html.dark) .wl-name-row strong {
    color: var(--text-secondary);
  }
  :global(html.dark) .wl-name-row {
    color: var(--text-tertiary);
  }
  :global(html.dark) .wl-fact-card strong,
  :global(html.dark) .wl-section strong {
    color: var(--text-secondary);
  }
  :global(html.dark) .wl-metric-label {
    color: var(--text-tertiary);
  }
  :global(html.dark) .wl-metric-value,
  :global(html.dark) .wl-beschrijving {
    color: var(--text-tertiary);
  }
</style>
