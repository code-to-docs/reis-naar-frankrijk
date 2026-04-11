<script lang="ts">
  import { getGerechtenContext } from "../context.svelte";
  import { gerechtenSoortLabels, gerechtenStreekLabels } from "$lib/gerechtenData.js";
  import { TIP_MAX_AFSTAND_KM } from "../utils/regionUtils.js";

  const { gps, isFranzi } = getGerechtenContext();

  function getSoortLabel(soort: string) {
    return (gerechtenSoortLabels as Record<string, { label: string }>)[soort]?.label || soort;
  }

  function getStreekLabel(streek: string) {
    return (gerechtenStreekLabels as Record<string, { label: string }>)[streek]?.label || streek;
  }
</script>

<div class="gr-tip-card">
  <div class="gr-tip-top">
    <div class="gr-tip-label">Proef-tip van vandaag</div>
    <button class="gr-tip-refresh" onclick={gps.refreshGpsTip} disabled={gps.gpsBezig} data-disabled-opacity="0.7">
      {gps.gpsBezig ? "GPS..." : "GPS verversen"}
    </button>
  </div>

  {#if gps.dagTip}
    <div class="gr-tip-name">{gps.dagTip.emoji} {gps.dagTip.naam}</div>
    <div class="gr-tip-sub">{gps.dagTip.frans} · {getSoortLabel(gps.dagTip.soort)}</div>
    <div class="gr-tip-meta">
      <span class="gr-tip-chip ui-chip ui-chip--muted">Regio: {gps.huidigeRegio ? getStreekLabel(gps.huidigeRegio) : "Onbekend"}</span>
      <span class="gr-tip-chip ui-chip ui-chip--muted">Binnen {TIP_MAX_AFSTAND_KM} km</span>
      {#if gps.regioAfstand !== null}
        <span class="gr-tip-chip ui-chip ui-chip--muted">GPS match: {gps.regioAfstand.toFixed(1)} km</span>
      {/if}
      {#if isFranzi}
        <span class="gr-tip-chip ui-chip ui-chip--muted">Franzi-filter: vegetarisch of vis</span>
      {/if}
    </div>
  {:else}
    <div class="gr-tip-empty">{gps.dagTipStatus}</div>
  {/if}
</div>

<style>
  .gr-tip-card {
    background: linear-gradient(135deg, var(--bg-accent-subtle), var(--bg-surface));
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
  }

  .gr-tip-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .gr-tip-label {
    font-size: var(--text-xs);
    color: var(--text-accent);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .gr-tip-refresh {
    width: auto;
    min-height: var(--ui-touch-compact);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-accent);
    background: color-mix(in srgb, var(--bg-surface) 70%, var(--bg-accent-subtle));
    color: var(--text-accent);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    padding: 0 var(--space-3);
  }

  .gr-tip-refresh:disabled {
    opacity: 0.7;
  }

  .gr-tip-name {
    margin-top: var(--space-1-5);
    font-size: var(--text-lg);
    font-weight: var(--ui-weight-heavy);
    color: var(--text-primary);
  }

  .gr-tip-sub {
    margin-top: 2px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--ui-line-compact);
  }

  .gr-tip-meta {
    margin-top: var(--space-2);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1-5);
  }

  .gr-tip-chip {
    background: color-mix(in srgb, var(--bg-surface) 66%, var(--bg-accent-subtle));
    color: var(--text-accent);
    border: 1px solid var(--border-default);
  }

  .gr-tip-empty {
    margin-top: var(--space-2);
    padding: var(--space-2-5);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--bg-surface) 66%, var(--bg-accent-subtle));
    color: var(--text-accent);
    border: 1px dashed var(--border-accent);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
  }

  @media (min-width: 1100px) {
    .gr-tip-card {
      padding: var(--ui-space-4);
    }
    .gr-tip-name {
      font-size: var(--text-xl);
    }
    .gr-tip-sub {
      font-size: var(--text-base);
    }
  }

  :global(html.dark) .gr-tip-card {
    background: linear-gradient(135deg, var(--bg-surface), var(--bg-surface-raised));
    border-color: var(--border-strong);
  }

  :global(html.dark) .gr-tip-label {
    color: var(--text-accent);
  }

  :global(html.dark) .gr-tip-name {
    color: var(--text-primary);
  }

  :global(html.dark) .gr-tip-sub {
    color: var(--text-secondary);
  }

  :global(html.dark) .gr-tip-refresh {
    background: color-mix(in srgb, var(--bg-surface-raised) 50%, var(--bg-surface-sunken));
    border-color: var(--border-strong);
    color: var(--text-accent);
  }

  :global(html.dark) .gr-tip-chip {
    background: color-mix(in srgb, var(--bg-surface-raised) 50%, var(--bg-surface-sunken));
    border-color: var(--border-strong);
    color: var(--text-accent);
  }

  :global(html.dark) .gr-tip-empty {
    background: color-mix(in srgb, var(--bg-surface-raised) 50%, var(--bg-surface-sunken));
    border-color: var(--border-strong);
    color: var(--text-accent);
  }
</style>
