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
  let stopFotoLoading = false;
  let fotoBatchTimer: ReturnType<typeof setTimeout> | null = null;

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
    stopFotoLoading = false;
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
          return () => {
            stopFotoLoading = true;
            if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
          };
        }
      }
    } catch (e) {}
    laadFotos(wildlifeData);

    return () => {
      stopFotoLoading = true;
      if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
    };
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
      if (stopFotoLoading) return;
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
        if (stopFotoLoading) return;
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
          fotoBatchTimer = setTimeout(laadBatch, 2500 * retries);
        } else {
          retries = 0;
          index += batchSize;
          fotoBatchTimer = setTimeout(laadBatch, 800);
        }
      });
    }
    laadBatch();
  }
  let toonFilters = $state(false);

  let gefilterd = $derived.by(() => {
    const zoekLower = zoek.trim().toLowerCase();
    return wildlifeData.filter((dier) => {
      const zoekMatch = zoekLower === "" ||
        dier.naam.toLowerCase().includes(zoekLower) ||
        dier.duits.toLowerCase().includes(zoekLower) ||
        dier.latijn.toLowerCase().includes(zoekLower) ||
        dier.kenmerken.toLowerCase().includes(zoekLower) ||
        dier.waar_wanneer.toLowerCase().includes(zoekLower);
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

<section class="wl-page">
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
</section>

<style>
  .wl-page {
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-x: clip;
  }
  .wl-zoek-rij {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
  }
  .wl-zoek {
    min-height: 44px;
    margin: 0;
    border: 1.5px solid var(--input-border);
    border-radius: 12px;
    background: var(--input-bg);
  }
  .wl-filter-toggle {
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1.5px solid var(--input-border);
    background: var(--card-bg);
    color: var(--tekst);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
  }
  .wl-filter-toggle.actief {
    background: #1a5276;
    border-color: #1a5276;
    color: #fff;
  }
  .wl-filter-badge {
    min-width: 20px;
    height: 20px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    padding: 0 6px;
  }
  .wl-filters-card {
    background: var(--card-bg);
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 2px 10px var(--card-shadow);
    border: 1px solid var(--border-subtle);
  }
  .wl-filter-rij + .wl-filter-rij { margin-top: 10px; }
  .wl-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .wl-pill {
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1;
  }
  .wl-pill.active {
    background: #1a5276;
    border-color: #1a5276;
    color: #fff;
  }
  .wl-reset {
    margin-top: 12px;
    width: 100%;
    border-radius: 10px;
    background: #fee2e2;
    color: #991b1b;
    font-weight: 700;
  }
  .wl-resultaten {
    font-size: 0.88rem;
    color: #64748b;
    padding: 0 2px;
  }
  .wl-lijst {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .wl-leeg {
    background: var(--card-bg);
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    color: #64748b;
    box-shadow: 0 2px 10px var(--card-shadow);
  }
  .wl-leeg p { margin-bottom: 10px; }

  @media (min-width: 768px) {
    .wl-page {
      gap: 14px;
    }
    .wl-filter-toggle { padding-inline: 14px; }
  }

  :global(html.dark) .wl-filters-card { background: var(--card-bg); border-color: #334155; }
  :global(html.dark) .wl-zoek { border-color: #334155; }
  :global(html.dark) .wl-filter-toggle { background: var(--card-bg); border-color: #334155; color: #e2e8f0; }
  :global(html.dark) .wl-filter-toggle.actief { background: #1a5276; border-color: #1a5276; }
  :global(html.dark) .wl-pill { background: var(--card-bg); border-color: #334155; color: #94a3b8; }
  :global(html.dark) .wl-pill.active { background: #1a5276; border-color: #1a5276; color: #fff; }
  :global(html.dark) .wl-leeg { background: var(--card-bg); color: #94a3b8; }
  :global(html.dark) .wl-resultaten { color: #94a3b8; }
</style>
