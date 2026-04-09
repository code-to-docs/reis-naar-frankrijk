<script>
  import { activePagina, gebruiker, darkMode, toggleDarkMode } from "$lib/stores.js";
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import Budget from "$lib/components/Budget.svelte";
  import Noodinfo from "$lib/components/Noodinfo.svelte";
  import WildlifeChecklist from "$lib/components/WildlifeChecklist.svelte";
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";

  const vertrekDatum = new Date("2025-07-14");
  const dagen = Math.ceil((vertrekDatum - new Date()) / 86400000);

  let meerPagina = $state("");

  import { E } from "$lib/emojis.js";

  // Route tekst als JS variabele (unicode fix)
  const routeTekst = "Loz\u00E8re " + "\u2192" + " Cantal " + "\u2192" + " Pyr\u00E9n\u00E9es Ari\u00E9geoises";

  // Aftelling tekst
  function getAftelTekst() {
    if (dagen > 1) return E.KALENDER + " Nog " + dagen + " dagen";
    if (dagen === 1) return E.KALENDER + " Nog 1 dag!";
    if (dagen === 0) return E.FEEST + " Vandaag vertrekken we!";
    return E.AUTO + " We zijn onderweg!";
  }

  const meerGroepen = [
    {
      label: "Reis",
      items: [
        { id:"activiteiten",  emoji: E.TARGET, label:"Activiteiten" },
        { id:"zwemplekken",   emoji: E.ZWEM,   label:"Zwemplekken" },
        { id:"wildlife",      emoji: E.VOGEL,  label:"Wildlife" },
      ]
    },
    {
      label: "Lijsten",
      items: [
        { id:"boodschappen",  emoji: E.WINKEL, label:"Boodschappen" },
        { id:"paklijst",      emoji: E.LIJST,  label:"Paklijst" },
        { id:"gerechten",     emoji: E.ETEN,   label:"Gerechten" },
      ]
    },
    {
      label: "Overig",
      items: [
        { id:"dagboek",       emoji: E.BOEK,   label:"Dagboek" },
        { id:"noodinfo",      emoji: E.WARN,   label:"Noodinfo" },
      ]
    }
  ];

  $effect(() => {
    if ($activePagina !== "meer") meerPagina = "";
  });

  function handleToggleDark() {
    toggleDarkMode($gebruiker);
  }
</script>

<div class="header">
  <h1>{E.VLAG} Frankrijk</h1>
  {#if $activePagina === "home"}
    <p>Hoi {$gebruiker}!</p>
  {/if}
</div>

{#if $activePagina === "home"}
  <div class="page-transition">
    <WeerWidget />
    <SpotVanDeDag />

    <div class="card aftelling-card">
      <div class="aftelling-tekst">{getAftelTekst()}</div>
      <div class="aftelling-route">{routeTekst}</div>
    </div>
  </div>

{:else if $activePagina === "campings"}
  <div class="page-transition">
    <GedeeldeLijst titel="Campings" emoji={E.CAMPING}
      collectie="campings" metLink={true}
      placeholder="Naam camping..." />
  </div>

{:else if $activePagina === "poi"}
  <div class="page-transition">
    <GedeeldeLijst titel="Bezienswaardigheden" emoji={E.PIN}
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
                  <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            {/each}
          </div>
        </div>
      {/each}

      <div class="meer-groep">
        <div class="meer-groep-label">Instellingen</div>
        <div class="meer-groep-items">
          <button class="dark-toggle-item" onclick={handleToggleDark}>
            <span class="dark-toggle-emoji">{$darkMode ? "\u2600\uFE0F" : "\u{1F319}"}</span>
            <span class="dark-toggle-label">{$darkMode ? "Light mode" : "Dark mode"}</span>
            <div class="toggle-track" class:active={$darkMode}>
              <div class="toggle-thumb">
                {$darkMode ? "\u{1F319}" : "\u2600\uFE0F"}
              </div>
            </div>
          </button>
        </div>
      </div>

      <button class="meer-uitloggen" onclick={() => { localStorage.removeItem("naam"); location.reload(); }}>
        {E.DEUR} Uitloggen
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
        <GedeeldeLijst titel="Activiteiten" emoji={E.TARGET}
          collectie="activiteiten" afvinkbaar={true}
          placeholder="Nieuwe activiteit..." />
      {:else if meerPagina === "gerechten"}
        <GedeeldeLijst titel="Gerechten" emoji={E.ETEN}
          collectie="gerechten" afvinkbaar={true}
          placeholder="Nieuw gerecht..." />
      {:else if meerPagina === "paklijst"}
        <GedeeldeLijst titel={"Paklijst (" + $gebruiker + ")"} emoji={E.LIJST}
          collectie={"paklijst_" + $gebruiker.toLowerCase()} afvinkbaar={true}
          placeholder="Wat moet je inpakken..." />
      {:else if meerPagina === "boodschappen"}
        <GedeeldeLijst titel="Boodschappen" emoji={E.WINKEL}
          collectie="boodschappen" afvinkbaar={true}
          placeholder="Wat moet je kopen..." />
      {:else if meerPagina === "zwemplekken"}
        <GedeeldeLijst titel="Zwemplekken" emoji={E.ZWEM}
          collectie="zwemplekken" metLink={true}
          placeholder="Rivier, meer of plek..." />
      {:else if meerPagina === "wildlife"}
        <WildlifeChecklist />
      {:else if meerPagina === "dagboek"}
        <GedeeldeLijst titel="Dagboek" emoji={E.BOEK}
          collectie="dagboek" placeholder="Vandaag..." />
      {:else if meerPagina === "noodinfo"}
        <Noodinfo />
      {/if}
    </div>
  {/if}
{/if}

<style>
  /* Aftelling kaart */
  .aftelling-card {
    text-align: center;
    padding: 20px 16px;
  }
  .aftelling-tekst {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading);
  }
  .aftelling-route {
    margin-top: 6px;
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--nav-text);
    letter-spacing: 0.3px;
  }

  /* Meer menu */
  .meer-menu { padding: 16px; }
  .meer-groep { margin-bottom: 16px; }
  .meer-groep-label {
    font-size: 0.72rem; font-weight: 600; color: var(--nav-text);
    text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px 6px 4px;
  }
  .meer-groep-items {
    background: var(--card-bg); border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px var(--card-shadow);
  }
  .meer-item {
    width: 100%; display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; background: none; border: none;
    border-bottom: 1px solid var(--border-subtle); cursor: pointer;
    text-align: left; transition: background 0.15s ease;
    color: var(--nav-text);
  }
  .meer-item:last-child { border-bottom: none; }
  .meer-item:active { background: var(--hover-bg); }
  .meer-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .meer-label { flex: 1; font-size: 0.95rem; font-weight: 500; color: var(--tekst); }
  .meer-arrow { flex-shrink: 0; }
  .meer-uitloggen {
    width: 100%; padding: 14px; background: none;
    border: 1.5px solid #fecaca; border-radius: 14px;
    color: #ef4444; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; margin-top: 8px;
  }
  .meer-uitloggen:active { background: var(--hover-bg); }
  .terug-btn {
    display: flex; align-items: center; gap: 6px;
    margin: 16px; padding: 8px 16px; background: var(--blauw);
    color: white; border: none; border-radius: 10px;
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
  }
  .terug-btn:active { opacity: 0.85; }
</style>