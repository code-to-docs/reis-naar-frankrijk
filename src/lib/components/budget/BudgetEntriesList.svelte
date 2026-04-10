<script lang="ts">
  import { budgetCatMap } from "$lib/budgetCategories.js";
  import { E } from "$lib/emojis.js";
  import { formatEuro, formatTime } from "$lib/utils/formatters.js";
  import type { DagGroep, UitgaveItem } from "$lib/utils/budget.js";

  let {
    uitgavenCount,
    gegroepeerdeUitgaven,
    gefilterdeUitgaven,
    isGefilterd,
    onDelete
  } = $props<{
    uitgavenCount: number;
    gegroepeerdeUitgaven: DagGroep[];
    gefilterdeUitgaven: UitgaveItem[];
    isGefilterd: boolean;
    onDelete: (id: string) => void;
  }>();

  function getDagTotaalLabel(label: string): string {
    const trimmed = label.trim();
    if (!trimmed) return "Totaal";
    if (trimmed.toLowerCase() === "vandaag") return "Totaal vandaag";
    return `Totaal ${trimmed}`;
  }
</script>

<div class="entries-header">
  <h3>Uitgaven ({uitgavenCount})</h3>
</div>

{#each gegroepeerdeUitgaven as groep (groep.key)}
  <div class="dag-groep">
    <div class="dag-header">
      <span class="dag-label">{E.KALENDER} {groep.label}</span>
    </div>
    {#each groep.items as u (u.id)}
      <div class="entry-item">
        <span class="entry-emoji">{budgetCatMap[u.categorie]?.emoji || E.LEEG}</span>
        <div class="entry-info">
          <strong>{u.omschrijving}</strong>
          <small>{u.door} {formatTime(u.datum)}</small>
        </div>
        <div class="entry-right">
          <strong class="entry-bedrag">{formatEuro(u.bedrag)}</strong>
          <button class="entry-delete" onclick={() => onDelete(u.id)}>{E.PRULLENBAK}</button>
        </div>
      </div>
    {/each}
    <div class="dag-subtotaal">
      <span>{getDagTotaalLabel(groep.label)}</span>
      <strong>{formatEuro(groep.totaal)}</strong>
    </div>
  </div>
{/each}

{#if gefilterdeUitgaven.length === 0 && isGefilterd}
  <div class="empty-state">
    <span class="empty-icon">{E.ZOEK}</span>
    <p>Geen uitgaven voor dit filter</p>
  </div>
{/if}

<style>
  .entries-header {
    margin: var(--space-4) 0 var(--space-2) 0;
  }
  .entries-header h3 {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }
  .dag-groep {
    margin-bottom: 14px;
  }
  .dag-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 4px 4px 8px;
    margin-bottom: 2px;
  }
  .dag-label {
    font-weight: 700;
    font-size: var(--font-size-sm);
    color: var(--text-accent);
  }
  .dag-subtotaal {
    --entry-actions-offset: calc(var(--ui-touch-compact) + 10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    border-top: 1px solid var(--border-default);
    margin-top: 4px;
    padding: 10px calc(12px + var(--entry-actions-offset)) 2px 12px;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-medium);
  }
  .dag-subtotaal strong {
    color: var(--heading);
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-bold);
  }
  .entry-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    padding: 11px 12px;
    margin-bottom: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .entry-emoji {
    font-size: 1.4rem;
    flex-shrink: 0;
  }
  .entry-info {
    flex: 1;
    min-width: 0;
  }
  .entry-info strong {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entry-info small {
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
  }
  .entry-right {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    justify-self: end;
  }
  .entry-bedrag {
    font-size: var(--font-size-md);
    color: var(--text-primary);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .entry-delete {
    background: color-mix(in srgb, var(--card-bg) 92%, var(--bg-surface-sunken));
    border: 1px solid var(--input-border);
    font-size: 0.9rem;
    min-height: var(--btn-height-compact);
    min-width: var(--btn-height-compact);
    padding: 0;
    border-radius: var(--radius-sm);
    cursor: pointer;
    opacity: 0.5;
    flex-shrink: 0;
  }
  .entry-delete:active {
    opacity: 1;
  }
  .empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    color: var(--text-tertiary);
  }
  .empty-icon {
    font-size: 2.5rem;
  }
  .empty-state p {
    margin-top: var(--space-2);
    font-size: var(--font-size-sm);
  }

  @media (max-width: 760px) {
    .entry-item {
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      row-gap: 4px;
    }
    .entry-emoji {
      grid-row: 1 / span 2;
      align-self: center;
    }
    .entry-right {
      grid-column: 2;
      justify-self: end;
      gap: 8px;
    }
    .dag-subtotaal {
      padding-top: 8px;
    }
  }
</style>
