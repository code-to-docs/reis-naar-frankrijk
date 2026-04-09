<script>
  import { activePagina, gebruiker } from "$lib/stores.js";
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import Budget from "$lib/components/Budget.svelte";
  import Noodinfo from "$lib/components/Noodinfo.svelte";
  import WildlifeChecklist from "$lib/components/WildlifeChecklist.svelte";
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";

  const vertrekDatum = new Date("2025-07-14");
  const dagen = Math.ceil((vertrekDatum - new Date()) / 86400000);

  let meerPagina = $state("");

  // Emoji variabelen
  const E_VLAG = "\u{1F1EB}\u{1F1F7}";
  const E_KAL = "\u{1F5D3}\uFE0F";
  const E_FEEST = "\u{1F389}";
  const E_AUTO = "\u{1F697}";
  const E_DEUR = "\u{1F6AA}";
  const E_CAMPING = "\u{1F3D5}\uFE0F";
  const E_PIN = "\u{1F4CD}";
  const E_TARGET = "\u{1F3AF}";
  const E_ETEN = "\u{1F37D}\uFE0F";
  const E_LIJST = "\u{1F4CB}";
  const E_WINKEL = "\u{1F6D2}";
  const E_ZWEM = "\u{1F3CA}";
  const E_VOGEL = "\u{1F985}";
  const E_BOEK = "\u{1F4D3}";
  const E_WARN = "\u26A0\uFE0F";

  const meerGroepen = [
    {
      label: "Reis",
      items: [
        { id:"activiteiten",  emoji: E_TARGET, label:"Activiteiten" },
        { id:"zwemplekken",   emoji: E_ZWEM,   label:"Zwemplekken" },
        { id:"wildlife",      emoji: E_VOGEL,  label:"Wildlife" },
      ]
    },
    {
      label: "Lijsten",
      items: [
        { id:"boodschappen",  emoji: E_WINKEL, label:"Boodschappen" },
        { id:"paklijst",      emoji: E_LIJST,  label:"Paklijst" },
        { id:"gerechten",     emoji: E_ETEN,   label:"Gerechten" },
      ]
    },
    {
      label: "Overig",
      items: [
        { id:"dagboek",       emoji: E_BOEK,   label:"Dagboek" },
        { id:"noodinfo",      emoji: E_WARN,   label:"Noodinfo" },
      ]
    }
  ];

  $effect(() => {
    if ($activePagina !== "meer") meerPagina = "";
  });
</script>

<div class="header">
  <h1>{E_VLAG} Frankrijk</h1>
  {#if $activePagina === "home"}
    <p>Hoi {$gebruiker}!</p>
  {/if}
</div>

{#if $activePagina === "home"}
  <div class="page-transition">
    <WeerWidget />
    <SpotVanDeDag />
    <div class="card">
      <h2>{dagen > 0 ? E_KAL + " Nog " + dagen + " dagen!" :
           dagen === 0 ? E_FEEST + " Vandaag!" : E_AUTO + " We zijn onderweg!"}</h2>
      <p style="margin-top:8px;">Loz\u00E8re \u2192 Cantal \u2192 Pyr\u00E9n\u00E9es Ari\u00E9geoises</p>
    </div>
  </div>

{:else if $activePagina === "campings"}
  <div class="page-transition">
    <GedeeldeLijst titel="Campings" emoji={E_CAMPING}
      collectie="campings" metLink={true}
      placeholder="Naam camping..." />
  </div>

{:else if $activePagina === "poi"}
  <div class="page-transition">
    <GedeeldeLijst titel="Bezienswaardigheden" emoji={E_PIN}
      collectie="pois" metLink={true}
      placeholder="Naam plek..." />
  </div>

{:else if $activePagina === "budget"}
  <div class="page-transition">
    <Budget />
  </div>

{:else if $activePagina === "meer"}
  {#if !meerPagina}
    <div class="page-transition meer-menu">
      {#each meerGroepen as groep}
        <div class="meer-groep">
          <div class="meer-groep-label">{groep.label}</div>
          <div class="meer-groep-items">
            {#each groep.items as o}
              <button class="meer-item" onclick={() => meerPagina = o.id}>
                <span class="meer-emoji">{o.emoji}</span>
                <span class="meer-label">{o.label}</span>
                <svg class="meer-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            {/each}
          </div>
        </div>
      {/each}

      <button class="meer-uitloggen" onclick={() => { localStorage.removeItem("naam"); location.reload(); }}>
        {E_DEUR} Uitloggen
      </button>
    </div>
  {:else}
    <div class="page-transition">
      <button class="terug-btn" onclick={() => meerPagina = ""}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9L11 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Terug
      </button>

      {#if meerPagina === "activiteiten"}
        <GedeeldeLijst titel="Activiteiten" emoji={E_TARGET}
          collectie="activiteiten" afvinkbaar={true}
          placeholder="Nieuwe activiteit..." />
      {:else if meerPagina === "gerechten"}
        <GedeeldeLijst titel="Gerechten" emoji={E_ETEN}
          collectie="gerechten" afvinkbaar={true}
          placeholder="Nieuw gerecht..." />
      {:else if meerPagina === "paklijst"}
        <GedeeldeLijst titel={"Paklijst (" + $gebruiker + ")"} emoji={E_LIJST}
          collectie={"paklijst_" + $gebruiker.toLowerCase()} afvinkbaar={true}
          placeholder="Wat moet je inpakken..." />
      {:else if meerPagina === "boodschappen"}
        <GedeeldeLijst titel="Boodschappen" emoji={E_WINKEL}
          collectie="boodschappen" afvinkbaar={true}
          placeholder="Wat moet je kopen..." />
      {:else if meerPagina === "zwemplekken"}
        <GedeeldeLijst titel="Zwemplekken" emoji={E_ZWEM}
          collectie="zwemplekken" metLink={true}
          placeholder="Rivier, meer of plek..." />
      {:else if meerPagina === "wildlife"}
        <WildlifeChecklist />
      {:else if meerPagina === "dagboek"}
        <GedeeldeLijst titel="Dagboek" emoji={E_BOEK}
          collectie="dagboek" placeholder="Vandaag..." />
      {:else if meerPagina === "noodinfo"}
        <Noodinfo />
      {/if}
    </div>
  {/if}
{/if}

<style>
  .meer-menu { padding: 16px; }
  .meer-groep { margin-bottom: 16px; }
  .meer-groep-label {
    font-size: 0.72rem; font-weight: 600; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px 6px 4px;
  }
  .meer-groep-items {
    background: white; border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .meer-item {
    width: 100%; display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; background: none; border: none;
    border-bottom: 1px solid #f1f5f9; cursor: pointer;
    text-align: left; transition: background 0.15s ease;
  }
  .meer-item:last-child { border-bottom: none; }
  .meer-item:active { background: #f8fafc; }
  .meer-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .meer-label { flex: 1; font-size: 0.95rem; font-weight: 500; color: #1e293b; }
  .meer-arrow { flex-shrink: 0; }
  .meer-uitloggen {
    width: 100%; padding: 14px; background: none;
    border: 1.5px solid #fecaca; border-radius: 14px;
    color: #ef4444; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; margin-top: 8px;
  }
  .meer-uitloggen:active { background: #fef2f2; }
  .terug-btn {
    display: flex; align-items: center; gap: 6px;
    margin: 16px; padding: 8px 16px; background: #1a5276;
    color: white; border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
  }
  .terug-btn:active { opacity: 0.85; }
</style>