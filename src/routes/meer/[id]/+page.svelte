<script>
  import { page } from '$app/stores';
  import { appState } from '$lib/stores.svelte.js';
  import { E } from '$lib/emojis.js';
  import GedeeldeLijst from '$lib/components/GedeeldeLijst.svelte';
  import Noodinfo from '$lib/components/Noodinfo.svelte';
  import WildlifeChecklist from '$lib/components/WildlifeChecklist.svelte';
  import GerechtenFeature from '$lib/features/gerechten/GerechtenFeature.svelte';

  let id = $derived($page.params.id);
</script>

<div class="page-transition page-shell">
  <div class="terug-wrap">
    <a href="/meer" class="terug-btn">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M11 4L6 9L11 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Terug
    </a>
  </div>

  {#if id === "activiteiten"}
    <GedeeldeLijst titel="Activiteiten" emoji={E.TARGET}
      collectie="activiteiten" afvinkbaar={true}
      placeholder="Nieuwe activiteit..." />
  {:else if id === "gerechten"}
    <GerechtenFeature />
  {:else if id === "paklijst"}
    <GedeeldeLijst 
      titel={"Paklijst (" + appState.gebruiker + ")"} 
      emoji={E.LIJST}
      collectie={"paklijst_" + appState.gebruiker.toLowerCase()} 
      afvinkbaar={true}
      placeholder="Wat moet je inpakken..." 
    />
  {:else if id === "boodschappen"}
    <GedeeldeLijst titel="Boodschappen" emoji={E.WINKEL}
      collectie="boodschappen" afvinkbaar={true}
      placeholder="Wat moet je kopen..." />
  {:else if id === "zwemplekken"}
    <GedeeldeLijst titel="Zwemplekken" emoji={E.ZWEM}
      collectie="zwemplekken" metLink={true}
      placeholder="Rivier, meer of plek..." />
  {:else if id === "wildlife"}
    <WildlifeChecklist />
  {:else if id === "dagboek"}
    <GedeeldeLijst titel="Dagboek" emoji={E.BOEK}
      collectie="dagboek" placeholder="Vandaag..." />
  {:else if id === "noodinfo"}
    <Noodinfo />
  {:else}
    <p style="padding: var(--space-4);">Pagina niet gevonden.</p>
  {/if}
</div>

<style>
  .terug-wrap {
    padding: 0 0 var(--space-2-5) 0;
  }
  .terug-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    min-height: var(--btn-height-compact);
    padding: 0 14px;
    background: color-mix(in srgb, var(--card-bg) 86%, var(--bg-accent-subtle));
    color: var(--blauw);
    border: 1px solid color-mix(in srgb, var(--input-border) 82%, var(--border-default));
    border-radius: var(--btn-radius);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    cursor: pointer;
    text-decoration: none;
  }
  .terug-btn:active { opacity: 0.85; }
</style>


