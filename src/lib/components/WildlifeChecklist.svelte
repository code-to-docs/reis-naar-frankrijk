<script lang="ts">
  import { onMount } from "svelte";
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState } from "$lib/stores.svelte.js";
  import type { Spotting, Wildlife, WildlifeCategorie, WildlifeRegio } from "$lib/types.js";
  import { wildlifeData, categorieLabels, regioLabels } from "$lib/wildlifeData.js";
  import { E } from "$lib/emojis.js";
  import WildlifeStats from "./wildlife/WildlifeStats.svelte";
  import WildlifeCard from "./wildlife/WildlifeCard.svelte";

  type WildlifePhotoResult = { id: string; thumb: string; full: string } | { id: string; retry: true } | null;

  let spottings: Record<string, Spotting> = $state({}); // Firestore data lookup
  let fotos: Record<string, string> = $state({}); // Wiki thumbnail lookup
  let fotosGroot: Record<string, string> = $state({}); // Wiki high-res lookup
  let zoek = $state("");
  let filterStatus = $state("alle");
  let filterRegio = $state<"alle" | WildlifeRegio>("alle");
  let filterCategorie = $state<"alle" | WildlifeCategorie>("alle");
  let expandedDier: string | null = $state(null);
  let stopFotoLoading = false;
  let fotoBatchTimer: ReturnType<typeof setTimeout> | null = null;
  const regioEntries = Object.entries(regioLabels) as Array<[WildlifeRegio, (typeof regioLabels)[WildlifeRegio]]>;
  const categorieEntries = Object.entries(categorieLabels) as Array<[WildlifeCategorie, (typeof categorieLabels)[WildlifeCategorie]]>;

  let unsubFirestore: (() => void) | undefined;
  onMount(() => {
    const ref = collection(db, "wildlife");
    unsubFirestore = onSnapshot(ref, (snapshot) => {
      const data: Record<string, Spotting> = {};
      snapshot.forEach((d) => { data[d.id] = d.data() as Spotting; });
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

  function laadFotos(dieren: Wildlife[]) {
    const CACHE_KEY = "wildlife_fotos_v3";
    let index = 0;
    const batchSize = 3;
    let retries = 0;

    function maakGrotereThumbUrl(url: string) {
      if (!url) return url;
      return url.replace(/\/\d+px-/, "/1600px-");
    }

    async function laadEnkel(dier: Wildlife): Promise<WildlifePhotoResult> {
      try {
        const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(dier.wiki), {
          headers: { "Api-User-Agent": "ReisNaarFrankrijkApp/1.0 (travel-app; contact@example.com)" }
        });
        if (res.status === 429) return { id: dier.id, retry: true };
        if (res.ok) {
          const data = await res.json() as {
            thumbnail?: { source?: string };
            originalimage?: { source?: string };
          };
          if (data.thumbnail && data.thumbnail.source) {
            return {
              id: dier.id,
              thumb: data.thumbnail.source,
              full: data.originalimage?.source || maakGrotereThumbUrl(data.thumbnail.source)
            };
          }
        }
        } catch {}
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
        results.forEach((res) => {
          if (res && "retry" in res) {
            gotRateLimited = true;
          } else if (res && "thumb" in res) {
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
      Filters
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
          {#each regioEntries as [key, val]}
            <button class="wl-pill" class:active={filterRegio === key} onclick={() => filterRegio = key}>{val.emoji} {val.label}</button>
          {/each}
        </div>
      </div>
      <div class="wl-filter-rij">
        <div class="wl-pills">
          <button class="wl-pill" class:active={filterCategorie === "alle"} onclick={() => filterCategorie = "alle"}>Alle</button>
          {#each categorieEntries as [key, val]}
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
    gap: var(--ui-space-3);
    overflow-x: clip;
  }
  .wl-zoek-rij {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: stretch;
  }
  .wl-zoek {
    min-height: var(--ui-touch-min);
    margin: 0;
    border: 1.5px solid var(--input-border);
    border-radius: 12px;
    background: var(--input-bg);
    padding-inline: 12px;
    align-self: stretch;
  }
  .wl-filter-toggle {
    min-height: var(--ui-touch-min);
    min-width: 92px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1.5px solid var(--input-border);
    background: var(--card-bg);
    color: var(--tekst);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-bold);
    line-height: 1;
    align-self: stretch;
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
    font-size: var(--font-size-xs);
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
    min-height: var(--ui-touch-compact);
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
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
    min-height: var(--ui-touch-min);
    border-radius: 10px;
    background: #fee2e2;
    color: #991b1b;
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-bold);
  }
  .wl-resultaten {
    font-size: var(--font-size-sm);
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
      gap: var(--ui-space-4);
    }
    .wl-filter-toggle { padding-inline: 14px; }
  }

  @media (min-width: 1100px) {
    .wl-page {
      gap: var(--ui-space-5);
    }
    .wl-zoek-rij {
      gap: var(--ui-space-3);
    }
    .wl-zoek {
      min-height: 48px;
      font-size: var(--font-size-md);
      padding-inline: 14px;
    }
    .wl-filter-toggle {
      min-height: 48px;
      min-width: 108px;
      padding-inline: 16px;
      font-size: var(--font-size-md);
    }
    .wl-filters-card {
      padding: var(--ui-space-4);
    }
    .wl-filter-rij + .wl-filter-rij {
      margin-top: 12px;
    }
    .wl-pill {
      min-height: 42px;
      padding-inline: 14px;
      font-size: var(--font-size-md);
    }
    .wl-resultaten {
      font-size: var(--font-size-md);
    }
    .wl-lijst {
      gap: 12px;
    }
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
