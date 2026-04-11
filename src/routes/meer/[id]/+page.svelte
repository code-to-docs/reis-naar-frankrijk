<script>
  import { page } from '$app/stores';
  import { appState } from '$lib/stores.svelte.js';
  import { E } from '$lib/emojis.js';
  import Button from '$lib/components/ui/Button.svelte';
  import GedeeldeLijst from '$lib/components/GedeeldeLijst.svelte';
  import Noodinfo from '$lib/components/Noodinfo.svelte';
  import WildlifeChecklist from '$lib/components/WildlifeChecklist.svelte';
  import GerechtenFeature from '$lib/features/gerechten/GerechtenFeature.svelte';

  let id = $derived($page.params.id);
</script>

<div class="page-transition page-shell">
  <div class="terug-wrap">
    <Button href="/meer" variant="secondary" size="sm">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M11 4L6 9L11 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Terug
    </Button>
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
    <p class="not-found">Pagina niet gevonden.</p>
  {/if}
</div>

<style>
  .terug-wrap {
    padding: 0 0 var(--space-2-5) 0;
  }
  .not-found {
    padding: var(--space-4);
  }
</style>


