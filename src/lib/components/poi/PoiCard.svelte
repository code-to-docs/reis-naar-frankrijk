<script lang="ts">
  import { E } from "$lib/emojis.js";
  import { poiCategorieMap, poiScoreMeta } from "$lib/poiCategories.js";
  import type { Poi } from "$lib/types.js";

  let {
    poi,
    onEdit,
    onDelete,
    onToggleBezocht
  } = $props<{
    poi: Poi;
    onEdit: () => void;
    onDelete: () => void;
    onToggleBezocht: () => void;
  }>();

  const scoreDots = [1, 2, 3] as const;

  let categorie = $derived.by(() => poiCategorieMap[poi.categorie as keyof typeof poiCategorieMap]);
  let scoreInfo = $derived.by(() => poiScoreMeta[poi.score as keyof typeof poiScoreMeta]);
</script>

<article class="poi-card card" style={`--poi-accent:${categorie.kleur}`}>
  <div class="poi-head">
    <span class="poi-category ui-chip ui-chip--muted">
      <span aria-hidden="true">{categorie.emoji}</span>
      <span>{categorie.label}</span>
    </span>
    {#if poi.bezocht}
      <span class="poi-status ui-chip ui-chip--success">Bezocht</span>
    {/if}
  </div>

  <div class="poi-main">
    <h3 class="poi-name">{poi.naam}</h3>
    {#if poi.omschrijving}
      <p class="poi-desc">{poi.omschrijving}</p>
    {/if}
  </div>

  <div class="poi-meta">
    {#if poi.locatieNaam}
      <span>{poi.locatieNaam}</span>
    {/if}
    <span>Toegevoegd door {poi.door}</span>
  </div>

  <div class="poi-priority" aria-label={`Prioriteit: ${scoreInfo.label}`}>
    <div class="poi-priority-dots">
      {#each scoreDots as dot (dot)}
        <span class="poi-priority-dot" class:active={dot <= poi.score}></span>
      {/each}
    </div>
    <span class="poi-priority-label">{scoreInfo.korteLabel}</span>
  </div>

  <div class="poi-actions">
    {#if poi.mapsLink}
      <a href={poi.mapsLink} target="_blank" rel="noopener noreferrer" class="btn-secondary poi-map-link">Laat zien op kaart</a>
    {/if}
    {#if poi.websiteUrl}
      <a href={poi.websiteUrl} target="_blank" rel="noopener noreferrer" class="poi-link">Website</a>
    {/if}
    <button type="button" class="btn-secondary btn-pill poi-toggle" onclick={onToggleBezocht}>
      {poi.bezocht ? "Nog open" : "Bezocht"}
    </button>
    <button type="button" class="btn-ghost btn-pill poi-edit" onclick={onEdit}>Bewerk</button>
    <button type="button" class="btn-danger btn-icon poi-delete" onclick={onDelete} aria-label={`Verwijder ${poi.naam}`}>{E.X}</button>
  </div>
</article>

<style>
  .poi-card {
    margin: 0;
    display: grid;
    gap: var(--ui-space-3);
    min-height: 100%;
    border-left: 5px solid var(--poi-accent);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .poi-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 var(--space-2-5) 28px var(--card-shadow);
  }

  .poi-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .poi-main {
    display: grid;
    gap: var(--space-1-5);
  }

  .poi-name {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--ui-weight-heavy);
    line-height: var(--ui-line-tight);
    color: var(--heading);
  }

  .poi-desc {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
    color: var(--tekst);
    line-height: var(--ui-line-body);
    line-clamp: 3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .poi-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--nav-text);
    font-weight: var(--ui-weight-medium);
  }

  .poi-priority {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2-5);
    min-height: 34px;
    width: fit-content;
    padding: var(--space-1-5) var(--space-2-5);
    border-radius: var(--radius-full);
    border: 1px solid color-mix(in srgb, var(--poi-accent) 24%, var(--input-border));
    background: color-mix(in srgb, var(--card-bg) 88%, var(--poi-accent));
  }

  .poi-priority-dots {
    display: inline-flex;
    gap: 5px;
  }

  .poi-priority-dot {
    width: var(--space-2-5);
    height: var(--space-2-5);
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--poi-accent) 16%, var(--bg-surface-sunken));
    border: 1px solid color-mix(in srgb, var(--poi-accent) 22%, var(--border-strong));
  }

  .poi-priority-dot.active {
    background: var(--poi-accent);
    border-color: var(--poi-accent);
  }

  .poi-priority-label {
    font-size: var(--text-xs);
    font-weight: var(--ui-weight-bold);
    color: color-mix(in srgb, var(--heading) 78%, var(--poi-accent));
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .poi-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
  }

  .poi-map-link,
  .poi-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--btn-height);
    padding: 0 var(--btn-padding-inline);
    border: 1px solid transparent;
    border-radius: var(--btn-radius);
    font-size: var(--ui-btn-font-size);
    font-weight: var(--ui-btn-font-weight);
    line-height: var(--ui-line-compact);
    text-decoration: none;
  }

  .poi-map-link {
    padding-inline: 14px;
  }

  .poi-link {
    min-height: var(--btn-height-compact);
    border-color: color-mix(in srgb, var(--input-border) 82%, var(--border-default));
    background: color-mix(in srgb, var(--card-bg) 86%, var(--bg-accent-subtle));
    color: var(--blauw);
  }

  .poi-toggle,
  .poi-edit {
    min-height: var(--btn-height-compact);
  }

  .poi-delete {
    color: var(--rood);
    border-color: color-mix(in srgb, var(--rood) 20%, var(--input-border));
  }

  .poi-delete:hover {
    background: color-mix(in srgb, var(--card-bg) 80%, var(--color-error-light));
  }

  @media (max-width: 720px) {
    .poi-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .poi-map-link,
    .poi-link,
    .poi-toggle,
    .poi-edit {
      width: 100%;
    }

    .poi-delete {
      width: 100%;
      min-width: 0;
    }
  }

  :global(html.dark) .poi-card {
    border-left-color: color-mix(in srgb, var(--poi-accent) 80%, var(--border-strong));
  }

  :global(html.dark) .poi-name {
    color: var(--text-primary);
  }

  :global(html.dark) .poi-desc {
    color: var(--text-secondary);
  }

  :global(html.dark) .poi-meta {
    color: var(--text-tertiary);
  }

  :global(html.dark) .poi-priority {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
  }

  :global(html.dark) .poi-priority-label {
    color: var(--text-accent);
  }

  :global(html.dark) .poi-link {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-accent);
  }
</style>




