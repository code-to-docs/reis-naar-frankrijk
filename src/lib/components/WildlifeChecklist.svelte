<script>
  import { onMount } from "svelte";
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { gebruiker } from "$lib/stores.js";
  import { wildlifeData, categorieLabels, regioLabels } from "$lib/wildlifeData.js";
  import { E } from "$lib/emojis.js";
  import WildlifeStats from "./wildlife/WildlifeStats.svelte";
  import WildlifeCard from "./wildlife/WildlifeCard.svelte";

  let currentUser = $state("");
  let spottings = $state({});
  let fotos = $state({});
  let zoek = $state("");
  let filterStatus = $state("alle");
  let filterRegio = $state("alle");
  let filterCategorie = $state("alle");
  let expandedDier = $state(null);


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
              return { id: dier.id, src: sized };
            }
          }
        } catch (e) {}
        return null;
      })).then((results) => {
        let changed = false;
        results.forEach(res => {
          if (res) {
            fotos[res.id] = res.src;
            changed = true;
          }
        });
        if (changed) fotos = { ...fotos };
        index += batchSize;
        setTimeout(laadBatch, 200);
      });
    }
    laadBatch();
  }
  let toonFilters = $state(false);

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

<WildlifeStats {aantalGespot} {totaal} {gespotPerc} />

<div class="wl-zoek-rij">
  <input type="text" class="wl-zoek" placeholder="{E.ZOEK} Zoek op naam, Frans, info..." bind:value={zoek} />
  <button class="wl-filter-toggle" class:actief={toonFilters || aantalActieveFilters > 0} onclick={() => toonFilters = !toonFilters}>
    {E.FILTER}
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
        <button class="wl-pill" class:active={filterStatus === "gespot"} onclick={() => filterStatus = "gespot"}>{E.CHECK} Gespot</button>
        <button class="wl-pill" class:active={filterStatus === "niet"} onclick={() => filterStatus = "niet"}>{E.KRUIS} Niet gespot</button>
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
    <WildlifeCard 
      {dier} 
      spotting={spottings[dier.id]} 
      foto={fotos[dier.id]} 
      isExpanded={expandedDier === dier.id} 
      {currentUser} 
      onToggle={() => expandedDier = expandedDier === dier.id ? null : dier.id} 
    />
  {/each}
</div>

{#if gefilterd.length === 0}
  <div class="wl-leeg">
    <p>Geen dieren gevonden</p>
    <button class="wl-reset" onclick={resetFilters}>Filters resetten</button>
  </div>
{/if}
