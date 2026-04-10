<script lang="ts">
  import type { BudgetCategorie } from "$lib/types.js";
  import { E } from "$lib/emojis.js";

  interface Props {
    filterPersoon: string;
    filterCat: string;
    actieveCats: BudgetCategorie[];
    isGefilterd: boolean;
    resultaatTeller: number;
    gefilterdTotaalLabel: string;
    onSetPersoon: (value: string) => void;
    onSetCat: (value: string) => void;
    onReset: () => void;
  }

  let {
    filterPersoon,
    filterCat,
    actieveCats,
    isGefilterd,
    resultaatTeller,
    gefilterdTotaalLabel,
    onSetPersoon,
    onSetCat,
    onReset
  }: Props = $props();
</script>

<div class="filter-section">
  <div class="filter-pills">
    <button class="pill" class:active={filterPersoon === "alle"} onclick={() => onSetPersoon("alle")}>Alle</button>
    <button class="pill" class:active={filterPersoon === "Dennis"} onclick={() => onSetPersoon("Dennis")}>Dennis</button>
    <button class="pill" class:active={filterPersoon === "Franzi"} onclick={() => onSetPersoon("Franzi")}>Franzi</button>
  </div>

  {#if actieveCats.length > 1}
    <div class="filter-pills cat-pills">
      <button class="pill cat-pill" class:active={filterCat === "alle"} onclick={() => onSetCat("alle")}>Alle</button>
      {#each actieveCats as ac (ac.id)}
        <button class="pill cat-pill" class:active={filterCat === ac.id} onclick={() => onSetCat(ac.id)} title={ac.label}>{ac.emoji}</button>
      {/each}
    </div>
  {/if}
</div>

{#if isGefilterd}
  <div class="filter-info">
    <span>{E.ZOEK} {resultaatTeller} resultaten - {gefilterdTotaalLabel}</span>
    <button class="filter-reset" onclick={onReset}>{E.KRUIS} Reset</button>
  </div>
{/if}

<style>
  .filter-section {
    margin-bottom: var(--space-3);
  }
  .filter-pills {
    display: flex;
    gap: var(--space-1-5);
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
  }
  .pill {
    padding: var(--space-1-5) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
    min-height: var(--touch-target-compact);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-default);
  }
  .pill:active {
    transform: scale(0.96);
  }
  .cat-pills {
    gap: var(--space-1);
  }
  .cat-pill {
    padding: var(--space-1) var(--space-2-5);
    font-size: var(--text-base);
    min-width: var(--space-10);
    text-align: center;
  }
  .filter-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-accent-subtle);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    margin-bottom: var(--space-2-5);
    font-size: var(--text-sm);
    color: var(--text-accent);
  }
  .filter-reset {
    background: color-mix(in srgb, var(--card-bg) 86%, var(--color-error-light));
    border: 1px solid color-mix(in srgb, var(--color-error-base) 22%, var(--input-border));
    color: var(--text-error);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    cursor: pointer;
    min-height: var(--btn-height-compact);
    padding: 0 var(--space-2-5);
    border-radius: var(--btn-radius);
  }
</style>
