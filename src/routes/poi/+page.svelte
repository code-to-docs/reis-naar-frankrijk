<script lang="ts">
  import { onMount } from "svelte";
  import PoiCard from "$lib/components/poi/PoiCard.svelte";
  import PoiFormModal from "$lib/components/poi/PoiFormModal.svelte";
  import { E } from "$lib/emojis.js";
  import { poiCategorieen, poiScoreMeta } from "$lib/poiCategories.js";
  import { PoiService } from "$lib/services/poiService.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import { filterAndSortPois, type PoiSortering } from "$lib/utils/poi.js";
  import type { Poi, PoiCategorieId, PoiScore } from "$lib/types.js";

  type PoiInput = Omit<Poi, "id" | "toegevoegdOp" | "bijgewerktOp" | "bezochtOp">;

  let pois = $state<Poi[]>([]);
  let loading = $state(true);
  let error = $state("");
  let zoekterm = $state("");
  let categorie = $state<PoiCategorieId | "alle">("alle");
  let score = $state<PoiScore | 0>(0);
  let sortering = $state<PoiSortering>("prioriteit");
  let modalOpen = $state(false);
  let editingPoi = $state<Poi | null>(null);

  let unsubscribe: (() => void) | undefined;

  const sorteerOpties: Array<{ value: PoiSortering; label: string }> = [
    { value: "prioriteit", label: "Prioriteit eerst" },
    { value: "nieuwst", label: "Nieuwste eerst" },
    { value: "naam", label: "Alfabetisch" }
  ];

  const scoreOpties = [1, 2, 3] as const;
  const skeletonCards = [1, 2, 3] as const;

  onMount(() => {
    loading = true;
    unsubscribe = PoiService.subscribe(
      (items) => {
        pois = items;
        error = "";
        loading = false;
      },
      (fetchError) => {
        console.error(fetchError);
        error = "De suggestielijst kon niet worden geladen.";
        loading = false;
      }
    );

    return () => unsubscribe?.();
  });

  let gefilterdePois = $derived.by(() =>
    filterAndSortPois(pois, {
      zoekterm,
      categorie,
      score,
      sortering
    })
  );

  let openSuggesties = $derived.by(() => pois.filter((poi) => !poi.bezocht).length);
  let mustSeeSuggesties = $derived.by(() => pois.filter((poi) => !poi.bezocht && poi.score === 3).length);
  let bezochteSuggesties = $derived.by(() => pois.filter((poi) => poi.bezocht).length);
  let actieveFilters = $derived.by(() =>
    (zoekterm.trim() ? 1 : 0) +
    (categorie !== "alle" ? 1 : 0) +
    (score !== 0 ? 1 : 0)
  );

  function openNieuweSuggestie() {
    editingPoi = null;
    modalOpen = true;
  }

  function openBewerken(poi: Poi) {
    editingPoi = poi;
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
    editingPoi = null;
  }

  function resetFilters() {
    zoekterm = "";
    categorie = "alle";
    score = 0;
    sortering = "prioriteit";
  }

  async function handleSave(payload: PoiInput) {
    try {
      if (editingPoi?.id) {
        await PoiService.update(editingPoi.id, payload);
        toonSnackbar("Suggestie bijgewerkt", "success", E.CHECK);
      } else {
        await PoiService.add(payload);
        toonSnackbar("Suggestie toegevoegd", "success", E.CHECK);
      }

      closeModal();
    } catch (saveError) {
      console.error(saveError);
      toonSnackbar("Opslaan mislukt", "error", E.KRUIS);
    }
  }

  async function handleDelete(poi: Poi) {
    if (!poi.id) return;
    if (!confirm(`Verwijder "${poi.naam}" uit de suggestielijst?`)) return;

    try {
      await PoiService.delete(poi.id);
      toonSnackbar("Suggestie verwijderd", "success", E.PRULLENBAK);
    } catch (deleteError) {
      console.error(deleteError);
      toonSnackbar("Verwijderen mislukt", "error", E.KRUIS);
    }
  }

  async function handleToggleBezocht(poi: Poi) {
    if (!poi.id) return;

    try {
      const bezocht = !poi.bezocht;
      await PoiService.toggleBezocht(poi.id, bezocht);
      toonSnackbar(
        bezocht ? "Gemarkeerd als bezocht" : "Weer terug als open suggestie",
        "success",
        bezocht ? E.CHECK : E.UNDO
      );
    } catch (toggleError) {
      console.error(toggleError);
      toonSnackbar("Bijwerken mislukt", "error", E.KRUIS);
    }
  }
</script>

<div class="page-transition page-shell poi-page">
  <section class="poi-hero card">
    <div class="poi-hero-copy">
      <div class="poi-kicker">{E.PIN} Suggestielijst</div>
      <h2>Zou leuk zijn om te doen</h2>
      <p class="ui-body-copy">
        Bewaar uitzichtpunten, mooie stops, lokale uitjes en spontane ideeen voor onderweg.
        De score houdt de lijst rustig en helpt om snel prioriteit te kiezen.
      </p>
    </div>
    <button type="button" class="btn-primary poi-hero-action" onclick={openNieuweSuggestie}>
      Nieuwe suggestie
    </button>
  </section>

  <section class="poi-summary">
    <article class="poi-summary-card card">
      <span class="poi-summary-label">Open suggesties</span>
      <strong>{openSuggesties}</strong>
      <small>Nog niet afgevinkt</small>
    </article>
    <article class="poi-summary-card card poi-summary-card--accent">
      <span class="poi-summary-label">Must-see</span>
      <strong>{mustSeeSuggesties}</strong>
      <small>Score 3 en nog open</small>
    </article>
    <article class="poi-summary-card card">
      <span class="poi-summary-label">Bezocht</span>
      <strong>{bezochteSuggesties}</strong>
      <small>Al gedaan onderweg</small>
    </article>
  </section>

  <section class="poi-filter-card card">
    <div class="poi-toolbar">
      <label class="poi-search">
        <span class="poi-search-icon" aria-hidden="true">{E.ZOEK}</span>
        <input
          bind:value={zoekterm}
          maxlength="80"
          placeholder="Zoek op naam, regio, omschrijving of door..."
          aria-label="Zoek suggesties"
        />
      </label>

      <label class="poi-sort">
        <span class="poi-filter-label">Sorteer</span>
        <select bind:value={sortering} aria-label="Sorteer suggesties">
          {#each sorteerOpties as optie (optie.value)}
            <option value={optie.value}>{optie.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="poi-filter-group">
      <span class="poi-filter-label">Categorie</span>
      <div class="poi-pill-row">
        <button type="button" class="poi-pill" class:active={categorie === "alle"} onclick={() => (categorie = "alle")}>
          Alles
        </button>
        {#each poiCategorieen as item (item.id)}
          <button
            type="button"
            class="poi-pill"
            class:active={categorie === item.id}
            onclick={() => (categorie = item.id)}
          >
            {item.emoji} {item.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="poi-filter-group">
      <span class="poi-filter-label">Prioriteit</span>
      <div class="poi-pill-row">
        <button type="button" class="poi-pill" class:active={score === 0} onclick={() => (score = 0)}>
          Alles
        </button>
        {#each scoreOpties as value (value)}
          <button type="button" class="poi-pill" class:active={score === value} onclick={() => (score = value)}>
            {poiScoreMeta[value].korteLabel}
          </button>
        {/each}
      </div>
    </div>

    <div class="poi-filter-footer">
      <p class="poi-filter-info">
        {gefilterdePois.length} {gefilterdePois.length === 1 ? "suggestie" : "suggesties"} zichtbaar
        {#if actieveFilters > 0}
          <span class="poi-filter-badge">{actieveFilters} filter{actieveFilters === 1 ? "" : "s"}</span>
        {/if}
      </p>

      {#if actieveFilters > 0}
        <button type="button" class="btn-secondary btn-pill" onclick={resetFilters}>Reset filters</button>
      {/if}
    </div>
  </section>

  {#if loading}
    <section class="poi-grid" aria-label="POI suggesties laden">
      {#each skeletonCards as card (card)}
        <article class="poi-skeleton card" aria-hidden="true">
          <div class="poi-skeleton-line poi-skeleton-line--short"></div>
          <div class="poi-skeleton-line poi-skeleton-line--title"></div>
          <div class="poi-skeleton-line"></div>
          <div class="poi-skeleton-line"></div>
          <div class="poi-skeleton-footer">
            <div class="poi-skeleton-pill"></div>
            <div class="poi-skeleton-pill poi-skeleton-pill--small"></div>
          </div>
        </article>
      {/each}
    </section>
  {:else if error}
    <section class="poi-empty card">
      <h3>Even geen verbinding met de lijst</h3>
      <p>{error}</p>
      <button type="button" class="btn-secondary" onclick={() => window.location.reload()}>Opnieuw laden</button>
    </section>
  {:else if gefilterdePois.length === 0 && pois.length > 0}
    <section class="poi-empty card">
      <h3>Geen resultaten voor deze combinatie</h3>
      <p>Verwijder een filter of zoek op een bredere term om meer suggesties te zien.</p>
      <button type="button" class="btn-secondary" onclick={resetFilters}>Reset filters</button>
    </section>
  {:else if pois.length === 0}
    <section class="poi-empty card">
      <h3>De lijst is nog leeg</h3>
      <p>Zet hier alvast leuke stops, uitzichtpunten en uitstapjes neer voor onderweg.</p>
      <button type="button" class="btn-primary" onclick={openNieuweSuggestie}>Eerste suggestie toevoegen</button>
    </section>
  {:else}
    <section class="poi-grid">
      {#each gefilterdePois as poi (poi.id)}
        <PoiCard
          {poi}
          onEdit={() => openBewerken(poi)}
          onDelete={() => void handleDelete(poi)}
          onToggleBezocht={() => void handleToggleBezocht(poi)}
        />
      {/each}
    </section>
  {/if}

  <PoiFormModal
    open={modalOpen}
    poi={editingPoi}
    currentUser={appState.gebruiker || "Reisgenoot"}
    onClose={closeModal}
    onSave={handleSave}
  />
</div>

<style>
  .poi-page {
    display: grid;
    gap: var(--ui-space-4);
  }

  .poi-hero {
    display: grid;
    gap: var(--ui-space-4);
    align-items: start;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--card-bg) 92%, var(--bg-accent-subtle)), var(--card-bg)),
      var(--card-bg);
  }

  .poi-hero-copy {
    display: grid;
    gap: var(--space-2);
  }

  .poi-kicker {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .poi-hero h2 {
    margin: 0;
    font-size: clamp(1.65rem, 5vw, 2.2rem);
  }

  .poi-hero p {
    margin: 0;
    color: var(--tekst);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
  }

  .poi-hero-action {
    width: 100%;
  }

  .poi-summary {
    display: grid;
    gap: var(--ui-space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .poi-summary-card {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    min-height: 118px;
    align-content: start;
  }

  .poi-summary-card strong {
    font-size: clamp(1.7rem, 5vw, 2.35rem);
    line-height: 1;
    color: var(--heading);
  }

  .poi-summary-card small {
    color: var(--nav-text);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
  }

  .poi-summary-card--accent {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--card-bg) 82%, var(--bg-accent-subtle)), var(--card-bg)),
      var(--card-bg);
  }

  .poi-summary-label,
  .poi-filter-label {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .poi-filter-card {
    margin: 0;
    display: grid;
    gap: var(--ui-space-4);
  }

  .poi-toolbar {
    display: grid;
    gap: var(--ui-space-3);
  }

  .poi-search {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    min-height: var(--ui-touch-min);
    padding: 0 14px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--input-border);
    background: var(--input-bg);
  }

  .poi-search input {
    margin: 0;
    min-height: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .poi-search input:focus {
    border: 0;
    outline: none;
  }

  .poi-search:focus-within {
    border-color: var(--input-focus);
  }

  .poi-search-icon {
    font-size: var(--text-base);
    line-height: 1;
  }

  .poi-sort {
    display: grid;
    gap: var(--space-1-5);
  }

  .poi-sort select {
    margin: 0;
  }

  .poi-filter-group {
    display: grid;
    gap: var(--space-2);
  }

  .poi-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .poi-pill {
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 88%, var(--bg-accent-subtle));
    color: var(--tekst);
    border-radius: var(--radius-full);
    min-height: var(--btn-height-compact);
    padding: 0 var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
  }

  .poi-pill.active {
    background: linear-gradient(135deg, var(--color-primary-800), var(--color-primary-700));
    border-color: var(--border-accent);
    color: var(--text-inverse);
  }

  .poi-filter-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .poi-filter-info {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin: 0;
    color: var(--nav-text);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
  }

  .poi-filter-badge {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: var(--space-1) 9px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--card-bg) 85%, var(--bg-accent-subtle));
    border: 1px solid color-mix(in srgb, var(--input-border) 78%, var(--border-accent));
    color: var(--blauw);
    font-size: var(--text-xs);
    font-weight: var(--ui-weight-bold);
  }

  .poi-grid {
    display: grid;
    gap: var(--ui-space-4);
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .poi-empty {
    margin: 0;
    display: grid;
    gap: var(--space-2-5);
    justify-items: start;
    text-align: left;
  }

  .poi-empty h3 {
    margin: 0;
    font-size: var(--text-xl);
  }

  .poi-empty p {
    margin: 0;
    color: var(--nav-text);
    font-size: var(--text-base);
    font-weight: var(--ui-weight-medium);
  }

  .poi-skeleton {
    margin: 0;
    display: grid;
    gap: var(--space-2-5);
    min-height: 280px;
  }

  .poi-skeleton-line,
  .poi-skeleton-pill {
    border-radius: var(--radius-full);
    background: linear-gradient(90deg, rgba(148, 163, 184, 0.16), rgba(148, 163, 184, 0.32), rgba(148, 163, 184, 0.16));
    background-size: 200% 100%;
    animation: poiSkeleton 1.4s ease-in-out infinite;
  }

  .poi-skeleton-line {
    height: var(--space-3);
  }

  .poi-skeleton-line--short {
    width: 34%;
  }

  .poi-skeleton-line--title {
    width: 70%;
    height: var(--space-5);
  }

  .poi-skeleton-footer {
    display: flex;
    gap: var(--space-2-5);
    margin-top: auto;
  }

  .poi-skeleton-pill {
    height: var(--space-10);
    width: 136px;
  }

  .poi-skeleton-pill--small {
    width: 92px;
  }

  @keyframes poiSkeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (max-width: 740px) {
    .poi-summary {
      grid-template-columns: 1fr;
    }

    .poi-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 880px) {
    .poi-hero {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }

    .poi-hero-action {
      width: auto;
      min-width: 190px;
    }

    .poi-toolbar {
      grid-template-columns: minmax(0, 1fr) 220px;
      align-items: end;
    }
  }

  @media (min-width: 1100px) {
    .poi-page {
      gap: var(--ui-space-5);
    }

    .poi-hero,
    .poi-filter-card {
      padding: var(--ui-space-5);
    }

    .poi-grid {
      gap: var(--ui-space-5);
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  :global(html.dark) .poi-hero,
  :global(html.dark) .poi-summary-card--accent {
    background:
      linear-gradient(135deg, rgba(30, 58, 95, 0.82), rgba(13, 24, 40, 0.96)),
      var(--card-bg);
  }

  :global(html.dark) .poi-hero p,
  :global(html.dark) .poi-empty p,
  :global(html.dark) .poi-filter-info,
  :global(html.dark) .poi-summary-card small,
  :global(html.dark) .poi-kicker,
  :global(html.dark) .poi-summary-label,
  :global(html.dark) .poi-filter-label {
    color: var(--text-tertiary);
  }

  :global(html.dark) .poi-search {
    border-color: var(--border-strong);
  }

  :global(html.dark) .poi-pill {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }

  :global(html.dark) .poi-pill.active {
    background: var(--bg-accent-hover);
    border-color: var(--border-accent);
    color: var(--text-inverse);
  }

  :global(html.dark) .poi-filter-badge {
    background: rgba(30, 64, 175, 0.28);
    border-color: rgba(96, 165, 250, 0.32);
    color: var(--text-accent);
  }
</style>


