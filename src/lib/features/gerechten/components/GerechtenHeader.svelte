<script lang="ts">
  import { getGerechtenContext } from "../context.svelte";
  import {
    gerechtenDieetLabels,
    gerechtenSmaakLabels,
    gerechtenSoortLabels,
    gerechtenStreekLabels
  } from "$lib/gerechtenData.js";

  const { filters } = getGerechtenContext();
  
  let toonFilters = $state(false);
</script>

<div class="gr-zoek-rij">
  <input
    type="text"
    class="gr-zoek ui-filter-input"
    placeholder="Zoek op naam, Frans of omschrijving..."
    bind:value={filters.zoek}
  />
  <button
    class="gr-filter-toggle ui-filter-toggle"
    class:actief={toonFilters || filters.activeFilterCount > 0}
    onclick={() => (toonFilters = !toonFilters)}
    aria-label="Toon filters"
  >
    Filters
    {#if filters.activeFilterCount > 0}
      <span class="gr-filter-badge ui-filter-badge">{filters.activeFilterCount}</span>
    {/if}
  </button>
</div>

{#if toonFilters}
  <div class="gr-filters-card">
    <div class="gr-filter-block">
      <div class="gr-filter-title">Dieet</div>
      <div class="gr-pills">
        {#each Object.entries(gerechtenDieetLabels) as [key, val] (key)}
          <button class="gr-pill" class:active={filters.filterDieet === key} onclick={() => (filters.filterDieet = key)}>
            {val.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="gr-filter-block">
      <div class="gr-filter-title">Smaak</div>
      <div class="gr-pills">
        {#each Object.entries(gerechtenSmaakLabels) as [key, val] (key)}
          <button class="gr-pill" class:active={filters.filterSmaak === key} onclick={() => (filters.filterSmaak = key)}>
            {val.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="gr-filter-block">
      <div class="gr-filter-title">Soort</div>
      <div class="gr-pills">
        {#each Object.entries(gerechtenSoortLabels) as [key, val] (key)}
          <button class="gr-pill" class:active={filters.filterSoort === key} onclick={() => (filters.filterSoort = key)}>
            {val.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="gr-filter-block">
      <div class="gr-filter-title">Streek</div>
      <div class="gr-pills">
        {#each Object.entries(gerechtenStreekLabels) as [key, val] (key)}
          <button class="gr-pill" class:active={filters.filterStreek === key} onclick={() => (filters.filterStreek = key)}>
            {val.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="gr-filter-block">
      <div class="gr-filter-title">Status</div>
      <div class="gr-pills">
        <button class="gr-pill" class:active={filters.filterStatus === "alle"} onclick={() => (filters.filterStatus = "alle")}>
          Alles
        </button>
        <button class="gr-pill" class:active={filters.filterStatus === "ik_geproefd"} onclick={() => (filters.filterStatus = "ik_geproefd")}>
          Ik geproefd
        </button>
        <button class="gr-pill" class:active={filters.filterStatus === "ik_niet"} onclick={() => (filters.filterStatus = "ik_niet")}>
          Nog niet
        </button>
      </div>
    </div>

    {#if filters.activeFilterCount > 0 || filters.zoek}
      <button class="gr-reset" onclick={filters.resetFilters}>Filters resetten</button>
    {/if}
  </div>
{/if}

<style>
  .gr-zoek-rij {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-2);
    align-items: stretch;
  }

  .gr-zoek {
    margin: 0;
    padding-inline: var(--space-3);
    align-self: stretch;
  }

  .gr-filter-toggle {
    min-width: calc(var(--space-16) + var(--space-6) + var(--space-1));
    position: relative;
    align-self: stretch;
  }

  .gr-filter-badge {
    position: absolute;
    top: -var(--space-1-5);
    right: -var(--space-1-5);
    min-width: calc(var(--space-4) + var(--space-0-5));
    height: calc(var(--space-4) + var(--space-0-5));
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--bg-accent) 60%, var(--color-error-base));
    color: var(--text-inverse);
    font-size: var(--text-xs);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-1);
  }

  .gr-filters-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    box-shadow: 0 var(--space-0-5) var(--space-2-5) var(--card-shadow);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2-5);
  }

  .gr-filter-title {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    margin-bottom: var(--space-1-5);
  }

  .gr-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .gr-pill {
    min-height: var(--ui-touch-compact);
    padding: 0 var(--space-3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    line-height: 1;
    font-weight: var(--ui-weight-semibold);
  }

  .gr-reset {
    margin-top: var(--space-0-5);
    width: 100%;
    min-height: var(--ui-touch-min);
    border-radius: var(--radius-md);
    background: var(--color-error-light);
    color: var(--text-error);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
  }

  @media (min-width: 1100px) {
    .gr-filters-card {
      padding: var(--ui-space-4);
    }
    .gr-zoek {
      min-height: var(--space-12);
      font-size: var(--text-base);
      padding-inline: var(--space-3-5);
    }
    .gr-filter-toggle {
      min-height: var(--space-12);
      min-width: calc(var(--space-16) + var(--space-6) + var(--space-5));
      font-size: var(--text-base);
    }
    .gr-pill {
      min-height: var(--ui-touch-min);
      padding-inline: var(--space-3-5);
      font-size: var(--text-base);
    }
  }

  :global(html.dark) .gr-filters-card {
    border-color: var(--border-strong);
  }

  :global(html.dark) .gr-filter-title {
    color: var(--text-tertiary);
  }
</style>
