<script lang="ts">
  import { getGerechtenContext } from "../context.svelte";
  import GerechtCard from "$lib/components/gerechten/GerechtCard.svelte";
  import { appState } from "$lib/stores.svelte.js";

  const { filters, checks, wiki } = getGerechtenContext();

  let expandedGerecht = $state<string | null>(null);
</script>

<div class="gr-resultaten">{filters.gefilterd.length} {filters.gefilterd.length === 1 ? "gerecht" : "gerechten"} gevonden</div>

<div class="gr-lijst">
  {#each filters.gefilterd as gerecht (gerecht.id)}
    <GerechtCard
      {gerecht}
      checks={checks.checksByDish[gerecht.id]}
      currentUser={appState.gebruiker}
      foto={wiki.fotos[gerecht.id]}
      groteFoto={wiki.fotosGroot[gerecht.id]}
      fotoStatus={wiki.fotoStatusById[gerecht.id] || "loading"}
      isExpanded={expandedGerecht === gerecht.id}
      onToggle={() => (expandedGerecht = expandedGerecht === gerecht.id ? null : gerecht.id)}
    />
  {/each}
</div>

{#if filters.gefilterd.length === 0}
  <div class="gr-leeg">
    <p>Geen gerechten gevonden met deze filters.</p>
    <button class="gr-reset" onclick={filters.resetFilters}>Filters resetten</button>
  </div>
{/if}

<style>
  .gr-resultaten {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: 0 2px;
  }

  .gr-lijst {
    display: flex;
    flex-direction: column;
    gap: var(--space-2-5);
  }

  .gr-leeg {
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    text-align: center;
    background: var(--card-bg);
    color: var(--text-secondary);
    box-shadow: 0 2px var(--space-2-5) var(--card-shadow);
  }

  .gr-reset {
    margin-top: 2px;
    width: 100%;
    min-height: var(--ui-touch-min);
    border-radius: var(--radius-md);
    background: var(--color-error-light);
    color: var(--text-error);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
  }

  @media (min-width: 1100px) {
    .gr-resultaten {
      font-size: var(--text-base);
    }
  }

  :global(html.dark) .gr-resultaten,
  :global(html.dark) .gr-leeg {
    color: var(--text-tertiary);
  }
</style>
