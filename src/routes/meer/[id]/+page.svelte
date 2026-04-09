<script>
  import { page } from '$app/stores';
  import { gebruiker } from '$lib/stores.js';
  import { E } from '$lib/emojis.js';
  import GedeeldeLijst from '$lib/components/GedeeldeLijst.svelte';
  import Noodinfo from '$lib/components/Noodinfo.svelte';
  import WildlifeChecklist from '$lib/components/WildlifeChecklist.svelte';

  let id = $derived($page.params.id);
</script>

<div class="page-transition">
  <div style="padding: 16px 16px 0 16px;">
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
    <GedeeldeLijst titel="Gerechten" emoji={E.ETEN}
      collectie="gerechten" afvinkbaar={true}
      placeholder="Nieuw gerecht..." />
  {:else if id === "paklijst"}
    <GedeeldeLijst titel={"Paklijst (" + $gebruiker + ")"} emoji={E.LIJST}
      collectie={"paklijst_" + $gebruiker.toLowerCase()} afvinkbaar={true}
      placeholder="Wat moet je inpakken..." />
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
    <p style="padding: 16px;">Pagina niet gevonden.</p>
  {/if}
</div>

<style>
  .terug-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; background: var(--blauw);
    color: white; border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
    text-decoration: none;
  }
  .terug-btn:active { opacity: 0.85; }
</style>
