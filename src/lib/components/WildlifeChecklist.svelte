<script lang="ts">
  import { onMount } from "svelte";
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState } from "$lib/stores.svelte.js";
  import { wildlifeData, categorieLabels, regioLabels } from "$lib/wildlifeData.js";
  import { E } from "$lib/emojis.js";
  import WildlifeStats from "./wildlife/WildlifeStats.svelte";
  import WildlifeCard from "./wildlife/WildlifeCard.svelte";

  let spottings: Record<string, any> = $state({}); // Firestore data lookup
  let fotos: Record<string, string> = $state({}); // Wiki thumbnail lookup
  let fotosGroot: Record<string, string> = $state({}); // Wiki high-res lookup
  let zoek = $state("");
  let filterStatus = $state("alle");
  let filterRegio = $state("alle");
  let filterCategorie = $state("alle");
  let expandedDier: string | null = $state(null);

  let unsubFirestore: (() => void) | undefined;
  onMount(() => {
    const ref = collection(db, "wildlife");
    unsubFirestore = onSnapshot(ref, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach((d) => { data[d.id] = d.data(); });
      spottings = data;
    });
    return () => unsubFirestore?.();
  });

  onMount(() => {
    const CACHE_KEY = "wildlife_fotos_v3";
    const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 uur
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < CACHE_MAX_AGE) {
          const parsedThumbs = parsed.data?.thumb || parsed.data || {};
          const parsedFull = parsed.data?.full || {};
          fotos = parsedThumbs;
          fotosGroot = parsedFull;
          const missing = wildlifeData.filter(d => !fotos[d.id] || !fotosGroot[d.id]);
          if (missing.length === 0) return;
          laadFotos(missing);
          return;
        }
      }
    } catch (e) {}
    laadFotos(wildlifeData);
  });

  function laadFotos(dieren: any[]) {
    const CACHE_KEY = "wildlife_fotos_v3";
    let index = 0;
    const batchSize = 3;
    let retries = 0;

    function maakGrotereThumbUrl(url: string) {
      if (!url) return url;
      return url.replace(/\/\d+px-/, "/1600px-");
    }

    async function laadEnkel(dier: any) {
      try {
        const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(dier.wiki), {
          headers: { "Api-User-Agent": "ReisNaarFrankrijkApp/1.0 (travel-app; contact@example.com)" }
        });
        if (res.status === 429) return { id: dier.id, retry: true };
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail && data.thumbnail.source) {
            return {
              id: dier.id,
              thumb: data.thumbnail.source,
              full: data.originalimage?.source || maakGrotereThumbUrl(data.thumbnail.source)
            };
          }
        }
      } catch (e) {}
      return null;
    }

    function laadBatch() {
      const batch = dieren.slice(index, index + batchSize);
      if (batch.length === 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: { thumb: fotos, full: fotosGroot }
          }));
        } catch (e) {}
        return;
      }
      Promise.all(batch.map(laadEnkel)).then((results) => {
        let changed = false;
        let gotRateLimited = false;
        results.forEach(res => {
          if (res && res.retry) {
            gotRateLimited = true;
          } else if (res && res.thumb) {
            fotos[res.id] = res.thumb;
            if (res.full) fotosGroot[res.id] = res.full;
            changed = true;
          }
        });
        
        if (changed) {
          fotos = { ...fotos };
          fotosGroot = { ...fotosGroot };
          // Save incrementally so progress isn't lost if user navigates away
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: { thumb: fotos, full: fotosGroot }
            }));
          } catch (e) {}
        }

        if (gotRateLimited && retries < 5) {
          retries++;
          setTimeout(laadBatch, 2500 * retries);
        } else {
          retries = 0;
          index += batchSize;
          setTimeout(laadBatch, 800);
        }
      });
    }
    laadBatch();
  }
  let toonFilters = $state(false);

  let gefilterd = $derived.by(() => {
    return wildlifeData.filter((dier) => {
      const zoekMatch = zoek === "" ||
        dier.naam.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.duits.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.latijn.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.kenmerken.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.waar_wanneer.toLowerCase().includes(zoek.toLowerCase());
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
      groteFoto={fotosGroot[dier.id]} 
      isExpanded={expandedDier === dier.id} 
      currentUser={appState.gebruiker} 
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
