<script lang="ts">
  import { E } from "$lib/emojis.js";
  import { formatEuro } from "$lib/utils/formatters.js";

  let {
    franziBetaald,
    dennisBetaald,
    verschil
  } = $props<{
    franziBetaald: number;
    dennisBetaald: number;
    verschil: number;
  }>();
</script>

<div class="card verrekening-card">
  <h3>{E.HANDDRUK} Verrekening</h3>
  <div class="budget-rij">
    <span>Franzi betaald</span>
    <strong>{formatEuro(franziBetaald)}</strong>
  </div>
  <div class="budget-rij">
    <span>Dennis betaald</span>
    <strong>{formatEuro(dennisBetaald)}</strong>
  </div>
  <hr class="verrekening-lijn" />
  {#if franziBetaald > dennisBetaald}
    <div class="verrekening-resultaat">
      <span>Dennis {E.PIJL} Franzi</span>
      <strong>{formatEuro(verschil)}</strong>
    </div>
  {:else if dennisBetaald > franziBetaald}
    <div class="verrekening-resultaat">
      <span>Franzi {E.PIJL} Dennis</span>
      <strong>{formatEuro(verschil)}</strong>
    </div>
  {:else}
    <div class="verrekening-resultaat quitte">
      <span>{E.CHECK} Quitte!</span>
    </div>
  {/if}
</div>

<style>
  .budget-rij {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-1) 0;
  }
  .verrekening-card {
    margin-top: 0;
    border-top: 3px solid var(--border-default);
  }
  .verrekening-lijn {
    border: none;
    border-top: 1px solid var(--border-default);
    margin: var(--space-2) 0;
  }
  .verrekening-resultaat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-1) 0;
    font-size: var(--text-base);
  }
  .verrekening-resultaat.quitte {
    justify-content: center;
    color: var(--groen);
  }
</style>

