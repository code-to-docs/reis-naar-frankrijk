<script>
  import { onMount } from "svelte";
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { gebruiker, toonSnackbar } from "$lib/stores.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from "$lib/wildlifeData.js";

  let currentUser = $state("");
  let spottings = $state({});
  let fotos = $state({});
  let zoek = $state("");
  let filterStatus = $state("alle");
  let filterRegio = $state("alle");
  let filterCategorie = $state("alle");
  let expandedDier = $state(null);
  let spotNotitie = $state("");
  let spotLocatie = $state("");
  let toonFilters = $state(false);

  const E_ZOEK = "\u{1F50D}";
  const E_CHECK = "\u2705";
  const E_KRUIS = "\u274C";
  const E_PIN = "\u{1F4CD}";
  const E_NOTITIE = "\u{1F4DD}";
  const E_KALENDER = "\u{1F4C5}";
  const E_TIP = "\u{1F4A1}";
  const E_WIKI = "\u{1F4D6}";
  const E_GELUID = "\u{1F50A}";
  const E_UNDO = "\u21A9\uFE0F";
  const E_FILTER = "\u{1F3AF}";
  const E_POOT = "\u{1F43E}";

  let unsubUser;
  onMount(() => {
    unsubUser = gebruiker.subscribe(v => currentUser = v);
    return () => unsubUser?.();
  });

  let unsubFirestore;
  onMount(() => {
    const ref = collection(db, "wildlife");
    unsubFirestore = onSnapshot(ref, (snapshot) => {
      const data = {};
      snapshot.forEach((d) => { data[d.id] = d.data(); });
      spottings = data;
    });
    return () => unsubFirestore?.();
  });

  onMount(() => {
    const CACHE_KEY = "wildlife_fotos_v2";
    const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < CACHE_MAX_AGE) {
          fotos = parsed.data || {};
          const missing = wildlifeData.filter(d => !fotos[d.id]);
          if (missing.length === 0) return;
          laadFotos(missing);
          return;
        }
      }
    } catch (e) {}
    laadFotos(wildlifeData);
  });

  function laadFotos(dieren) {
    const CACHE_KEY = "wildlife_fotos_v2";
    let index = 0;
    const batchSize = 5;
    function laadBatch() {
      const batch = dieren.slice(index, index + batchSize);
      if (batch.length === 0) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: fotos })); } catch (e) {}
        return;
      }
      Promise.all(batch.map(async (dier) => {
        try {
          const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(dier.wiki));
          if (res.ok) {
            const data = await res.json();
            if (data.thumbnail && data.thumbnail.source) {
              const src = data.thumbnail.source;
              const sized = src.replace(/\/\d+px-/, "/300px-");
              fotos[dier.id] = sized;
              fotos = { ...fotos };
            }
          }
        } catch (e) {}
      })).then(() => {
        index += batchSize;
        setTimeout(laadBatch, 200);
      });
    }
    laadBatch();
  }

  async function saveSpottingDetails(dierId) {
    const dier = wildlifeData.find(d => d.id === dierId);
    await setDoc(doc(db, "wildlife", dierId), {
      gespot: true,
      door: currentUser,
      datum: new Date().toISOString(),
      notitie: spotNotitie,
      locatie: spotLocatie,
    });
    haptic("success");
    const emoji = dier ? (categorieLabels[dier.categorie]?.emoji || E_POOT) : E_POOT;
    toonSnackbar(dier ? dier.naam + " gespot!" : "Gespot!", "success", emoji);
    spotNotitie = "";
    spotLocatie = "";
    expandedDier = null;
  }

  async function verwijderSpotting(dierId) {
    await deleteDoc(doc(db, "wildlife", dierId));
    haptic("light");
    toonSnackbar("Spotting ongedaan gemaakt", "warning", E_UNDO);
  }

  let gefilterd = $derived.by(() => {
    return wildlifeData.filter((dier) => {
      const zoekMatch = zoek === "" ||
        dier.naam.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.frans.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.info.toLowerCase().includes(zoek.toLowerCase());
      const statusMatch = filterStatus === "alle" ||
        (filterStatus === "gespot" && spottings[dier.id]) ||
        (filterStatus === "niet" && !spottings[dier.id]);
      const regioMatch = filterRegio === "alle" || dier.regios.includes(filterRegio);
      const catMatch = filterCategorie === "alle" || dier.categorie === filterCategorie;
      return zoekMatch && statusMatch && regioMatch && catMatch;
    });
  });

  let aantalGespot = $derived(wildlifeData.filter(d => spottings[d.id]).length);
  let totaal = $derived(wildlifeData.length);
  let gespotPerc = $derived(totaal > 0 ? Math.round((aantalGespot / totaal) * 100) : 0);

  let isGefilterd = $derived(filterStatus !== "alle" || filterRegio !== "alle" || filterCategorie !== "alle" || zoek !== "");
  let aantalActieveFilters = $derived(
    (filterStatus !== "alle" ? 1 : 0) + (filterRegio !== "alle" ? 1 : 0) + (filterCategorie !== "alle" ? 1 : 0)
  );

  function resetFilters() {
    zoek = "";
    filterStatus = "alle";
    filterRegio = "alle";
    filterCategorie = "alle";
  }
</script>

<div class="wl-stats-card">
  <div class="wl-stats-top">
    <div class="wl-stats-nummer">
      <span class="wl-stats-groot">{aantalGespot}</span>
      <span class="wl-stats-van">/ {totaal}</span>
    </div>
    <div class="wl-stats-rechts">
      <div class="wl-stats-perc">{gespotPerc}%</div>
      <div class="wl-stats-label">gespot</div>
    </div>
  </div>
  <div class="wl-stats-bar">
    <div class="wl-stats-fill" style="width:{gespotPerc}%"></div>
  </div>
</div>

<div class="wl-zoek-rij">
  <input type="text" class="wl-zoek" placeholder="{E_ZOEK} Zoek op naam, Frans, info..." bind:value={zoek} />
  <button class="wl-filter-toggle" class:actief={toonFilters || aantalActieveFilters > 0} onclick={() => toonFilters = !toonFilters}>
    {E_FILTER}
    {#if aantalActieveFilters > 0}
      <span class="wl-filter-badge">{aantalActieveFilters}</span>
    {/if}
  </button>
</div>

{#if toonFilters}
  <div class="wl-filters-card">
    <div class="wl-filter-rij">
      <div class="wl-pills">
        <button class="wl-pill" class:active={filterStatus === "alle"} onclick={() => filterStatus = "alle"}>Alle</button>
        <button class="wl-pill" class:active={filterStatus === "gespot"} onclick={() => filterStatus = "gespot"}>{E_CHECK} Gespot</button>
        <button class="wl-pill" class:active={filterStatus === "niet"} onclick={() => filterStatus = "niet"}>{E_KRUIS} Niet gespot</button>
      </div>
    </div>
    <div class="wl-filter-rij">
      <div class="wl-pills">
        <button class="wl-pill" class:active={filterRegio === "alle"} onclick={() => filterRegio = "alle"}>Alle</button>
        {#each Object.entries(regioLabels) as [key, val]}
          <button class="wl-pill" class:active={filterRegio === key} onclick={() => filterRegio = key}>{val.emoji} {val.label}</button>
        {/each}
      </div>
    </div>
    <div class="wl-filter-rij">
      <div class="wl-pills">
        <button class="wl-pill" class:active={filterCategorie === "alle"} onclick={() => filterCategorie = "alle"}>Alle</button>
        {#each Object.entries(categorieLabels) as [key, val]}
          <button class="wl-pill" class:active={filterCategorie === key} onclick={() => filterCategorie = key}>{val.emoji} {val.label}</button>
        {/each}
      </div>
    </div>
    {#if isGefilterd}
      <button class="wl-reset" onclick={resetFilters}>Filters resetten</button>
    {/if}
  </div>
{/if}

{#if isGefilterd}
  <div class="wl-resultaten">{gefilterd.length} {gefilterd.length === 1 ? "soort" : "soorten"} gevonden</div>
{/if}

<div class="wl-lijst">
  {#each gefilterd as dier (dier.id)}
    <div class="wl-card" class:gespot={spottings[dier.id]}>
      <button type="button" class="wl-hoofd" onclick={() => expandedDier = expandedDier === dier.id ? null : dier.id}>
        <div class="wl-foto-wrap">
          {#if fotos[dier.id]}
            <img src={fotos[dier.id]} alt={dier.naam} class="wl-foto" loading="lazy" decoding="async" />
          {:else}
            <div class="wl-foto-ph">{categorieLabels[dier.categorie]?.emoji || E_POOT}</div>
          {/if}
          {#if spottings[dier.id]}
            <div class="wl-gespot-dot"></div>
          {/if}
        </div>
        <div class="wl-info">
          <div class="wl-naam-rij">
            <strong class="wl-naam">{dier.naam}</strong>
            <span class="wl-ster" style="color:{zeldzaamheidLabels[dier.zeldzaamheid].kleur}">{zeldzaamheidLabels[dier.zeldzaamheid].emoji}</span>
          </div>
          <div class="wl-frans">{dier.frans}</div>
          <div class="wl-tags">
            {#each dier.regios as regio}
              <span class="wl-tag">{regioLabels[regio]?.emoji} {regioLabels[regio]?.label}</span>
            {/each}
          </div>
        </div>
        <svg class="wl-chevron" class:open={expandedDier === dier.id} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 8L10 12L14 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      {#if expandedDier === dier.id}
        <div class="wl-detail">
          <p class="wl-beschrijving">{dier.info}</p>
          {#if dier.tip}
            <div class="wl-tip">
              <span class="wl-tip-icon">{E_TIP}</span>
              <span class="wl-tip-tekst">{dier.tip}</span>
            </div>
          {/if}
          {#if spottings[dier.id]}
            <div class="wl-spotting">
              <div class="wl-spotting-head">{E_CHECK} Gespot door {spottings[dier.id].door}</div>
              {#if spottings[dier.id].datum}
                <div class="wl-spotting-row">{E_KALENDER} {new Date(spottings[dier.id].datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</div>
              {/if}
              {#if spottings[dier.id].locatie}
                <div class="wl-spotting-row">{E_PIN} {spottings[dier.id].locatie}</div>
              {/if}
              {#if spottings[dier.id].notitie}
                <div class="wl-spotting-row">{E_NOTITIE} {spottings[dier.id].notitie}</div>
              {/if}
            </div>
          {/if}
          {#if !spottings[dier.id]}
            <div class="wl-spot-form">
              <input type="text" class="wl-spot-input" placeholder="{E_PIN} Locatie (optioneel)" bind:value={spotLocatie} />
              <input type="text" class="wl-spot-input" placeholder="{E_NOTITIE} Notitie (optioneel)" bind:value={spotNotitie} />
              <button class="wl-spot-btn" onclick={() => saveSpottingDetails(dier.id)}>
                {E_CHECK} {dier.naam} gespot!
              </button>
            </div>
          {:else}
            <button class="wl-unspot" onclick={() => verwijderSpotting(dier.id)}>
              {E_UNDO} Spotting ongedaan maken
            </button>
          {/if}
          <div class="wl-links">
            <a href={"https://en.wikipedia.org/wiki/" + dier.wiki} target="_blank" rel="noopener" class="wl-link wiki">{E_WIKI} Wikipedia</a>
            {#if dier.geluid}
              <a href={dier.geluid} target="_blank" rel="noopener" class="wl-link geluid">{E_GELUID} Geluid</a>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

{#if gefilterd.length === 0}
  <div class="wl-leeg">
    <p>Geen dieren gevonden</p>
    <button class="wl-reset" onclick={resetFilters}>Filters resetten</button>
  </div>
{/if}

<style>
  .wl-stats-card {
    background: white; border-radius: 16px; padding: 16px;
    margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }
  .wl-stats-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
  .wl-stats-nummer { display: flex; align-items: baseline; gap: 4px; }
  .wl-stats-groot { font-size: 2rem; font-weight: 800; color: #1a5276; line-height: 1; }
  .wl-stats-van { font-size: 1rem; color: #94a3b8; font-weight: 500; }
  .wl-stats-rechts { text-align: right; }
  .wl-stats-perc { font-size: 1.1rem; font-weight: 700; color: #10b981; }
  .wl-stats-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .wl-stats-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .wl-stats-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 4px; transition: width 0.4s ease; }

  .wl-zoek-rij { display: flex; gap: 8px; margin-bottom: 12px; }
  .wl-zoek {
    flex: 1; padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .wl-zoek:focus { border-color: #1a5276; }
  .wl-filter-toggle {
    width: 44px; height: 44px; border-radius: 12px; border: 2px solid #e2e8f0;
    background: white; font-size: 1.1rem; cursor: pointer; position: relative;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .wl-filter-toggle.actief { background: #1a5276; border-color: #1a5276; }
  .wl-filter-badge {
    position: absolute; top: -5px; right: -5px; width: 18px; height: 18px;
    background: #ef4444; color: white; border-radius: 50%; font-size: 0.65rem;
    font-weight: 700; display: flex; align-items: center; justify-content: center;
  }

  .wl-filters-card {
    background: white; border-radius: 14px; padding: 14px;
    margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    animation: wlSlideUp 0.2s ease-out;
  }
  @keyframes wlSlideUp {
    from { transform: translateY(8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .wl-filter-rij { margin-bottom: 8px; }
  .wl-filter-rij:last-of-type { margin-bottom: 0; }
  .wl-pills { display: flex; flex-wrap: wrap; gap: 5px; }
  .wl-pill {
    padding: 5px 12px; border-radius: 20px; border: 1.5px solid #e2e8f0;
    background: white; color: #64748b; font-size: 0.78rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
  }
  .wl-pill:active { transform: scale(0.96); }
  .wl-pill.active { background: #1a5276; color: white; border-color: #1a5276; }
  .wl-reset {
    width: 100%; padding: 8px; margin-top: 8px; background: none;
    border: 1.5px solid #e2e8f0; border-radius: 10px; color: #94a3b8;
    font-size: 0.8rem; cursor: pointer;
  }
  .wl-reset:active { background: #f1f5f9; }
  .wl-resultaten { font-size: 0.8rem; color: #94a3b8; margin-bottom: 10px; font-style: italic; }

  .wl-lijst { display: flex; flex-direction: column; gap: 8px; }
  .wl-card {
    background: white; border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .wl-card.gespot { border-color: #10b981; background: #f0fdf4; }
  .wl-hoofd { display: flex; width: 100%; background: none; border: none; text-align: left; align-items: center; gap: 12px; padding: 12px; cursor: pointer; }
  .wl-foto-wrap { position: relative; flex-shrink: 0; }
  .wl-foto { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
  .wl-foto-ph {
    width: 56px; height: 56px; border-radius: 12px; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  }
  .wl-gespot-dot {
    position: absolute; top: -3px; right: -3px; width: 14px; height: 14px;
    background: #10b981; border: 2px solid white; border-radius: 50%;
  }
  .wl-info { flex: 1; min-width: 0; }
  .wl-naam-rij { display: flex; align-items: center; gap: 6px; }
  .wl-naam { font-size: 0.95rem; color: #1e293b; }
  .wl-ster { font-size: 0.7rem; letter-spacing: -1px; }
  .wl-frans { font-size: 0.78rem; color: #94a3b8; font-style: italic; }
  .wl-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .wl-tag { font-size: 0.68rem; background: #f1f5f9; padding: 2px 7px; border-radius: 8px; color: #64748b; }
  .wl-chevron { flex-shrink: 0; transition: transform 0.2s ease; }
  .wl-chevron.open { transform: rotate(180deg); }

  .wl-detail { padding: 0 14px 14px 14px; border-top: 1px solid #f1f5f9; }
  .wl-beschrijving { font-size: 0.85rem; line-height: 1.5; color: #475569; margin: 12px 0; }
  .wl-tip {
    display: flex; gap: 8px; align-items: flex-start;
    background: #EBF5FB; padding: 10px 12px; border-radius: 10px; margin-bottom: 12px;
  }
  .wl-tip-icon { font-size: 1rem; flex-shrink: 0; }
  .wl-tip-tekst { font-size: 0.82rem; line-height: 1.4; color: #1a5276; }
  .wl-spotting { background: #f0fdf4; padding: 12px; border-radius: 10px; margin-bottom: 12px; }
  .wl-spotting-head { font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; color: #166534; }
  .wl-spotting-row { font-size: 0.82rem; color: #475569; padding: 2px 0; }
  .wl-spot-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
  .wl-spot-input {
    padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 0.85rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .wl-spot-input:focus { border-color: #10b981; }
  .wl-spot-btn {
    padding: 12px; background: #10b981; color: white; border: none;
    border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
  }
  .wl-spot-btn:active { background: #059669; }
  .wl-unspot {
    padding: 8px 16px; background: none; border: 1.5px solid #e2e8f0;
    border-radius: 10px; font-size: 0.8rem; color: #94a3b8; cursor: pointer; margin-bottom: 12px;
  }
  .wl-unspot:active { border-color: #ef4444; color: #ef4444; }
  .wl-links { display: flex; gap: 8px; flex-wrap: wrap; }
  .wl-link {
    padding: 7px 14px; border-radius: 20px; font-size: 0.78rem;
    text-decoration: none; font-weight: 500;
  }
  .wl-link.wiki { background: #EBF5FB; color: #1565C0; }
  .wl-link.geluid { background: #FFF7ED; color: #c2410c; }
  .wl-link:active { opacity: 0.7; }
  .wl-leeg { text-align: center; padding: 32px 16px; color: #94a3b8; }
  .wl-leeg p { font-size: 0.95rem; margin-bottom: 12px; }
</style>