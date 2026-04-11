<script>
  import { activePagina, gebruiker, darkMode, toggleDarkMode } from "$lib/stores.js";
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import Budget from "$lib/components/Budget.svelte";
  import Noodinfo from "$lib/components/Noodinfo.svelte";
  import WildlifeChecklist from "$lib/components/WildlifeChecklist.svelte";
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import ListItem from "$lib/components/ui/ListItem.svelte";

  const vertrekDatum = new Date("2025-07-14");
  const dagen = Math.ceil((vertrekDatum.getTime() - Date.now()) / 86400000);

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
  const E_MAAN = "\u{1F319}";
  const E_ZON = "\u2600\uFE0F";

  const routeTekst = "Loz\u00E8re " + "\u2192" + " Cantal " + "\u2192" + " Pyr\u00E9n\u00E9es Ari\u00E9geoises";

  function getAftelTekst() {
    if (dagen > 1) return E_KAL + " Nog " + dagen + " dagen";
    if (dagen === 1) return E_KAL + " Nog 1 dag!";
    if (dagen === 0) return E_FEEST + " Vandaag vertrekken we!";
    return E_AUTO + " We zijn onderweg!";
  }

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

  function handleToggleDark() {
    toggleDarkMode($gebruiker);
  }

  function handleUitloggen() {
    localStorage.removeItem("naam");
    location.reload();
  }
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
    <div class="card aftelling-card">
      <div class="aftelling-tekst">{getAftelTekst()}</div>
      <div class="aftelling-route">{routeTekst}</div>
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
      {#each meerGroepen as groep (groep.label)}
        <div class="meer-groep">
          <div class="meer-groep-label">{groep.label}</div>
          <div class="meer-groep-items">
            {#each groep.items as o (o.id)}
              <ListItem
                emoji={o.emoji}
                label={o.label}
                onclick={() => meerPagina = o.id}
              />
            {/each}
          </div>
        </div>
      {/each}

      <div class="meer-groep">
        <div class="meer-groep-label">Instellingen</div>
        <div class="meer-groep-items">
          <ListItem
            emoji={$darkMode ? E_ZON : E_MAAN}
            label={$darkMode ? "Light mode" : "Dark mode"}
            arrow={false}
            onclick={handleToggleDark}
          >
            <div class="toggle-track" class:active={$darkMode}>
              <div class="toggle-thumb">
                {$darkMode ? E_MAAN : E_ZON}
              </div>
            </div>
          </ListItem>
        </div>
      </div>

      <div class="uitloggen-wrapper">
        <Button variant="destructive" fullWidth onclick={handleUitloggen}>
          {E_DEUR} Uitloggen
        </Button>
      </div>
    </div>

  {:else}
    <div class="page-transition">
      <div class="terug-wrapper">
        <Button variant="primary" size="sm" onclick={() => meerPagina = ""}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Terug
        </Button>
      </div>

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

  /* Meer menu — alleen layout, geen component styling */
  .meer-menu { padding: 16px; }
  .meer-groep { margin-bottom: 16px; }
  .meer-groep-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--nav-text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 4px 6px 4px;
  }
  .meer-groep-items {
    background: var(--card-bg);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px var(--card-shadow);
  }

  /* Primitive wrappers — alleen positie */
  .uitloggen-wrapper {
    margin-top: 8px;
  }
  .terug-wrapper {
    padding: 16px 16px 0 16px;
  }

  /* Toggle track — past in ListItem accessory slot */
  .toggle-track {
    width: 48px;
    height: 28px;
    background: var(--color-neutral-300);
    border-radius: var(--radius-full);
    position: relative;
    transition: background var(--duration-normal) var(--ease-default);
    flex-shrink: 0;
  }
  .toggle-track.active {
    background: var(--color-primary-500);
  }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: var(--color-neutral-0);
    border-radius: var(--radius-full);
    transition: transform var(--duration-normal) var(--ease-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    box-shadow: var(--shadow-sm);
  }
  .toggle-track.active .toggle-thumb {
    transform: translateX(20px);
  }
</style>