<script lang="ts">
  import type { OvernachtingView } from "./types.js";

  type TypeOptie = { id: string; label: string; emoji: string };

  let {
    shortlistOvernachtingen,
    ingeplandeOvernachtingen,
    overnachtingenZonderDatumCount,
    typeOpties,
    emojiPin,
    emojiPrullenbak,
    emojiWarn,
    onOpenItemEditor,
    onDeleteItem,
    onPlanShortlistItem,
    onPlanShortlistVanafVandaag
  } = $props<{
    shortlistOvernachtingen: OvernachtingView[];
    ingeplandeOvernachtingen: OvernachtingView[];
    overnachtingenZonderDatumCount: number;
    typeOpties: ReadonlyArray<TypeOptie>;
    emojiPin: string;
    emojiPrullenbak: string;
    emojiWarn: string;
    onOpenItemEditor: (item: OvernachtingView) => void;
    onDeleteItem: (id: string, naam: string) => void;
    onPlanShortlistItem: (item: OvernachtingView) => void;
    onPlanShortlistVanafVandaag: (item: OvernachtingView) => void;
  }>();
</script>

<div class="card ov-list-card">
  <h3>Shortlist geschikte locaties</h3>
  {#if shortlistOvernachtingen.length === 0}
    <p class="ov-empty">Nog geen shortlist-locaties. Voeg plekken toe die je later wilt boeken.</p>
  {:else}
    <div class="ov-list">
      {#each shortlistOvernachtingen as o (o.id)}
        <article class="ov-item ov-shortlist-item" style={`--loc-kleur:${o.kleur}`}>
          <div class="ov-item-top">
            <div class="ov-item-head">
              <strong>{o.naam}</strong>
              <p class="ov-item-subline">Nog niet ingepland</p>
            </div>
            <div class="ov-item-head-actions">
              <button class="ov-open-btn" onclick={() => onOpenItemEditor(o)}>Bewerk</button>
              <button class="ov-delete" aria-label={`Verwijder ${o.naam} uit shortlist`} onclick={() => onDeleteItem(o.id, o.naam)}>{emojiPrullenbak}</button>
            </div>
          </div>
          <div class="ov-meta">
            <span>Type: {typeOpties.find((x: TypeOptie) => x.id === o.typeSafe)?.label || "Camping"}</span>
            <span>Status: Shortlist</span>
            {#if o.latSafe !== null && o.lonSafe !== null}
              <span>GPS klaar</span>
            {/if}
          </div>

          {#if o.latSafe !== null && o.lonSafe !== null}
            <div class="ov-coords">
              GPS: {o.latSafe.toFixed(5)}, {o.lonSafe.toFixed(5)}
            </div>
          {/if}
          {#if o.adres}
            <div class="ov-address">{o.adres}</div>
          {/if}

          <div class="ov-links">
            {#if o.googleMapsUrl}
              <a href={o.googleMapsUrl} target="_blank" rel="noopener noreferrer">{emojiPin} Google Maps</a>
            {/if}
            {#if o.websiteUrl}
              <a href={o.websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>
            {/if}
            {#if o.bookingUrl}
              <a href={o.bookingUrl} target="_blank" rel="noopener noreferrer">Boeken</a>
            {/if}
          </div>

          {#if o.notities}
            <p class="ov-note">{o.notities}</p>
          {/if}

          <div class="ov-shortlist-actions">
            <button class="ov-secondary-btn" onclick={() => onPlanShortlistItem(o)}>Plan met formulier</button>
            <button class="btn-primary" onclick={() => onPlanShortlistVanafVandaag(o)}>Plan vanaf vandaag</button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

<div class="card ov-list-card">
  <h3>Alle overnachtingen</h3>
  {#if ingeplandeOvernachtingen.length === 0}
    <p class="ov-empty">Nog geen overnachtingen toegevoegd.</p>
  {:else}
    <div class="ov-list">
      {#each ingeplandeOvernachtingen as o (o.id)}
        <article class="ov-item" style={`--loc-kleur:${o.kleur}`}>
          <div class="ov-item-top">
            <div class="ov-item-head">
              <strong>{o.naam}</strong>
              {#if o.startDateObj}
                <p class="ov-item-subline">
                  {o.startDateObj.toLocaleDateString("nl-NL")} t/m {(o.lastNightObj as Date).toLocaleDateString("nl-NL")} - {o.nachtenSafe} nacht{o.nachtenSafe > 1 ? "en" : ""}
                </p>
              {:else}
                <p class="ov-item-subline">Nog geen aankomstdatum gekozen</p>
              {/if}
            </div>
            <div class="ov-item-head-actions">
              <button class="ov-open-btn" onclick={() => onOpenItemEditor(o)}>Bewerk</button>
              <button class="ov-delete" aria-label={`Verwijder ${o.naam}`} onclick={() => onDeleteItem(o.id, o.naam)}>{emojiPrullenbak}</button>
            </div>
          </div>
          <div class="ov-item-body">
            <div class="ov-meta">
              <span>Type: {typeOpties.find((x: TypeOptie) => x.id === o.typeSafe)?.label || "Camping"}</span>
              <span>Door: {o.door || "-"}</span>
            </div>
            {#if o.adres}
              <div class="ov-address">{o.adres}</div>
            {/if}
            {#if o.latSafe !== null && o.lonSafe !== null}
              <div class="ov-coords">
                GPS: {o.latSafe.toFixed(5)}, {o.lonSafe.toFixed(5)}
              </div>
            {/if}
            <div class="ov-links">
              {#if o.googleMapsUrl}
                <a href={o.googleMapsUrl} target="_blank" rel="noopener noreferrer">{emojiPin} Google Maps</a>
              {/if}
              {#if o.openStreetMapLink}
                <a href={o.openStreetMapLink} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
              {/if}
            </div>
            {#if o.notities}
              <p class="ov-note">{o.notities}</p>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

{#if overnachtingenZonderDatumCount > 0}
  <div class="card ov-warning">
    <strong>{emojiWarn} Nog zonder kalenderdatum</strong>
    <p>{overnachtingenZonderDatumCount} ingeplande item(s) missen een aankomstdatum en staan daarom nog niet in de kalender.</p>
  </div>
{/if}

<style>
  .ov-secondary-btn {
    width: auto;
    min-height: var(--btn-height);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, var(--bg-accent-subtle));
    color: var(--blauw);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    padding: 0 var(--space-3);
    border-radius: var(--btn-radius);
  }

  .ov-list-card {
    margin: 0;
  }
  .ov-list-card h3 {
    margin-bottom: var(--space-2-5);
  }
  .ov-list {
    display: grid;
    gap: var(--space-2-5);
  }
  .ov-item {
    --loc-kleur: var(--color-primary-600);
    border: 1px solid var(--border-subtle);
    border-left: var(--space-1-5) solid var(--loc-kleur);
    border-radius: var(--radius-lg);
    padding: 11px var(--space-3);
    background: var(--card-bg);
    display: grid;
    gap: var(--space-2);
  }
  .ov-shortlist-item {
    border-left-color: color-mix(in srgb, var(--loc-kleur) 70%, var(--color-success-base));
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.52) 0%, var(--bg-surface) 72%);
  }
  .ov-item-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }
  .ov-item-head {
    display: grid;
    gap: 2px;
  }
  .ov-item-head-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
  }
  .ov-item-head strong {
    font-size: var(--text-lg);
    color: var(--heading);
    line-height: var(--leading-tight);
  }
  .ov-item-subline {
    margin: 0;
    color: var(--nav-text);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }
  .ov-item-body {
    display: grid;
    gap: var(--space-1-5);
  }
  .ov-open-btn {
    width: auto;
    min-height: var(--btn-height-compact);
    padding: 0 var(--space-3);
    border-radius: var(--btn-radius);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, var(--bg-accent-subtle));
    color: var(--blauw);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
  }
  .ov-delete {
    width: auto;
    min-height: var(--btn-height-compact);
    min-width: var(--btn-height-compact);
    padding: 0;
    font-size: 0.95rem;
    border-radius: var(--btn-radius);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 92%, var(--bg-surface-sunken));
    color: color-mix(in srgb, var(--tekst) 70%, var(--text-secondary));
    opacity: 1;
  }
  .ov-delete:hover {
    border-color: color-mix(in srgb, var(--rood) 30%, var(--input-border));
    color: var(--rood);
    background: color-mix(in srgb, var(--card-bg) 78%, var(--color-error-light));
  }
  .ov-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1-5) var(--space-2-5);
  }
  .ov-meta span {
    font-size: var(--text-sm);
    color: var(--tekst);
    background: var(--hover-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full);
    padding: 3px var(--space-2);
  }
  .ov-coords {
    font-size: var(--text-sm);
    color: var(--blauw);
    font-weight: var(--weight-semibold);
  }
  .ov-address {
    font-size: var(--text-sm);
    color: var(--tekst);
    font-weight: var(--weight-medium);
  }
  .ov-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .ov-links a {
    font-size: var(--text-sm);
    color: var(--blauw);
    text-decoration: none;
    font-weight: var(--weight-bold);
  }
  .ov-note {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--tekst);
  }
  .ov-shortlist-actions {
    margin-top: var(--space-2);
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .ov-shortlist-actions .btn-primary {
    width: auto;
    min-height: var(--ui-touch-min);
    padding: 0 var(--space-3);
  }
  .ov-empty {
    color: var(--nav-text);
    margin: 0;
  }

  .ov-warning {
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--color-warning-base) 35%, var(--border-default));
    background: color-mix(in srgb, var(--card-bg) 84%, var(--color-warning-light));
  }
  .ov-warning strong {
    color: var(--text-warning);
  }
  .ov-warning p {
    margin-top: var(--space-1);
    color: var(--text-warning);
    font-size: 0.9rem;
  }

  @media (max-width: 760px) {
    .ov-item-top {
      flex-direction: column;
      align-items: stretch;
    }
    .ov-item-head-actions {
      justify-content: space-between;
    }
  }

  :global(html.dark) .ov-empty {
    color: var(--text-tertiary);
  }
  :global(html.dark) .ov-item,
  :global(html.dark) .ov-meta span {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
  }
  :global(html.dark) .ov-item-head strong {
    color: var(--text-primary);
  }
  :global(html.dark) .ov-meta span,
  :global(html.dark) .ov-note,
  :global(html.dark) .ov-address {
    color: var(--text-secondary);
  }
  :global(html.dark) .ov-open-btn,
  :global(html.dark) .ov-secondary-btn {
    background: var(--bg-accent-subtle);
    color: var(--text-accent);
    border-color: var(--border-accent);
  }
  :global(html.dark) .ov-delete {
    background: var(--bg-surface);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }
  :global(html.dark) .ov-delete:hover {
    border-color: var(--color-error-base);
    color: var(--color-error-light);
    background: rgba(127, 29, 29, 0.35);
  }
  :global(html.dark) .ov-shortlist-item {
    background: linear-gradient(180deg, rgba(30, 58, 138, 0.35) 0%, var(--bg-surface-raised) 72%);
  }
</style>




