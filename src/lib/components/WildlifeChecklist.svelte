<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState } from "$lib/stores.svelte.js";
  import { fetchWikipediaSummaryImage } from "$lib/api/wikiApi.js";
  import type { Spotting, Wildlife, WildlifeCategorie, WildlifeRegio } from "$lib/types.js";
  import { wildlifeData, categorieLabels, regioLabels } from "$lib/wildlifeData.js";
  import { E } from "$lib/emojis.js";
  import WildlifeStats from "./wildlife/WildlifeStats.svelte";
  import WildlifeCard from "./wildlife/WildlifeCard.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Input from "$lib/components/ui/Input.svelte";

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
      const targetWidth = "1600";
      return url.replace(/\/\d+px-/, `/${targetWidth}px-`);
    }

    async function laadEnkel(dier: Wildlife): Promise<WildlifePhotoResult> {
      try {
        const image = await fetchWikipediaSummaryImage(dier.wiki);
        if (image && "retry" in image) return { id: dier.id, retry: true };
        if (image && "thumb" in image) {
          return {
            id: dier.id,
            thumb: image.thumb,
            full: image.full || maakGrotereThumbUrl(image.thumb)
          };
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
  let openFromQuery = $derived.by(() => $page.url.searchParams.get("open")?.trim() || "");

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

  function openFromDashboardQuery(id: string) {
    if (!id) return;
    if (!wildlifeData.some((dier) => dier.id === id)) return;
    expandedDier = id;
    requestAnimationFrame(() => {
      const target = document.getElementById(`wildlife-card-${id}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  $effect(() => {
    if (!openFromQuery) return;
    openFromDashboardQuery(openFromQuery);
  });
</script>

<section class="wl-page">
  <WildlifeStats {aantalGespot} {totaal} {gespotPerc} />

  <div class="wl-zoek-rij">
    <Input type="text" class="wl-zoek" placeholder={`${E.ZOEK} Zoek op naam, Frans, info...`} bind:value={zoek} />
    <Button
      class={"wl-filter-toggle ui-filter-toggle" + (toonFilters || aantalActieveFilters > 0 ? " actief" : "")}
      variant="secondary"
      onclick={() => toonFilters = !toonFilters}
    >
      Filters
      {#if aantalActieveFilters > 0}
        <span class="wl-filter-badge ui-filter-badge">{aantalActieveFilters}</span>
      {/if}
    </Button>
  </div>

  {#if toonFilters}
    <Card class="wl-filters-card" padding="sm">
      <div class="wl-filter-rij">
        <div class="wl-pills">
          <Button class={"wl-pill ui-pill" + (filterStatus === "alle" ? " active" : "")} variant="ghost" size="sm" onclick={() => filterStatus = "alle"}>Alle</Button>
          <Button class={"wl-pill ui-pill" + (filterStatus === "gespot" ? " active" : "")} variant="ghost" size="sm" onclick={() => filterStatus = "gespot"}>{E.CHECK} Gespot</Button>
          <Button class={"wl-pill ui-pill" + (filterStatus === "niet" ? " active" : "")} variant="ghost" size="sm" onclick={() => filterStatus = "niet"}>{E.KRUIS} Niet gespot</Button>
        </div>
      </div>
      <div class="wl-filter-rij">
        <div class="wl-pills">
          <Button class={"wl-pill ui-pill" + (filterRegio === "alle" ? " active" : "")} variant="ghost" size="sm" onclick={() => filterRegio = "alle"}>Alle</Button>
          {#each regioEntries as [key, val] (key)}
            <Button class={"wl-pill ui-pill" + (filterRegio === key ? " active" : "")} variant="ghost" size="sm" onclick={() => filterRegio = key}>{val.emoji} {val.label}</Button>
          {/each}
        </div>
      </div>
      <div class="wl-filter-rij">
        <div class="wl-pills">
          <Button class={"wl-pill ui-pill" + (filterCategorie === "alle" ? " active" : "")} variant="ghost" size="sm" onclick={() => filterCategorie = "alle"}>Alle</Button>
          {#each categorieEntries as [key, val] (key)}
            <Button class={"wl-pill ui-pill" + (filterCategorie === key ? " active" : "")} variant="ghost" size="sm" onclick={() => filterCategorie = key}>{val.emoji} {val.label}</Button>
          {/each}
        </div>
      </div>
      {#if isGefilterd}
        <Button class="wl-reset" variant="tertiary" fullWidth onclick={resetFilters}>Filters resetten</Button>
      {/if}
    </Card>
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
    <Card class="wl-leeg" padding="lg">
      <p>Geen dieren gevonden</p>
      <Button class="wl-reset" variant="tertiary" fullWidth onclick={resetFilters}>Filters resetten</Button>
    </Card>
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
    gap: var(--space-2);
    align-items: stretch;
  }
  :global(.wl-zoek) {
    align-self: stretch;
  }
  :global(.wl-zoek .ui-input) {
    border-radius: var(--radius-lg);
    border-width: 1.5px;
  }
  :global(.wl-filter-toggle) {
    align-self: stretch;
  }
  .wl-filter-badge {
    background: color-mix(in srgb, var(--bg-surface) 22%, transparent);
  }
  :global(.wl-filters-card) {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    box-shadow: 0 2px var(--space-2-5) var(--card-shadow);
    border: 1px solid var(--border-subtle);
  }
  .wl-filter-rij + .wl-filter-rij { margin-top: var(--space-2-5); }
  .wl-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  :global(.wl-pill) {
    min-height: var(--ui-touch-compact);
    padding: 0 var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    line-height: 1;
  }
  :global(.wl-reset) {
    margin-top: var(--space-3);
    width: 100%;
    min-height: var(--ui-touch-min);
    border-radius: var(--radius-md);
    background: var(--color-error-light);
    color: var(--text-error);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
  }
  .wl-resultaten {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: 0 2px;
  }
  .wl-lijst {
    display: flex;
    flex-direction: column;
    gap: var(--space-2-5);
  }
  :global(.wl-leeg) {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-4-5);
    text-align: center;
    color: var(--text-secondary);
    box-shadow: 0 2px var(--space-2-5) var(--card-shadow);
  }
  :global(.wl-leeg p) { margin-bottom: var(--space-2-5); }

  @media (min-width: 768px) {
    .wl-page {
      gap: var(--ui-space-4);
    }
    :global(.wl-filter-toggle) { padding-inline: var(--space-3-5); }
  }

  @media (min-width: 1100px) {
    .wl-page {
      gap: var(--ui-space-5);
    }
    :global(.wl-zoek) {
      min-height: var(--space-12);
      font-size: var(--text-base);
      padding-inline: var(--space-3-5);
    }
    :global(.wl-filter-toggle) {
      min-height: var(--space-12);
      min-width: var(--space-24);
      padding-inline: var(--space-4);
      font-size: var(--text-base);
    }
    :global(.wl-filters-card) {
      padding: var(--ui-space-4);
    }
    .wl-filter-rij + .wl-filter-rij {
      margin-top: var(--space-3);
    }
    :global(.wl-pill) {
      min-height: var(--ui-touch-compact);
      padding-inline: var(--space-3-5);
      font-size: var(--text-base);
    }
    .wl-resultaten {
      font-size: var(--text-base);
    }
    .wl-lijst {
      gap: var(--space-3);
    }
  }

  :global(html.dark .wl-filters-card) { background: var(--card-bg); border-color: var(--border-strong); }
  :global(html.dark .wl-leeg) { background: var(--card-bg); color: var(--text-tertiary); }
  :global(html.dark .wl-resultaten) { color: var(--text-tertiary); }
</style>




