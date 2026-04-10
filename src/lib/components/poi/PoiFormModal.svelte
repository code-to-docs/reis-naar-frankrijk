<script lang="ts">
  import { poiCategorieen, poiScoreMeta } from "$lib/poiCategories.js";
  import { E } from "$lib/emojis.js";
  import { toonSnackbar } from "$lib/stores.svelte.js";
  import { buildPoiMapsLink, normalizeExternalUrl } from "$lib/utils/poi.js";
  import type { Poi, PoiCategorieId, PoiScore } from "$lib/types.js";

  let {
    open = false,
    poi = null,
    currentUser,
    onClose,
    onSave
  } = $props<{
    open: boolean;
    poi: Poi | null;
    currentUser: string;
    onClose: () => void;
    onSave: (payload: Omit<Poi, "id" | "toegevoegdOp" | "bijgewerktOp" | "bezochtOp">) => Promise<void> | void;
  }>();

  let naam = $state("");
  let categorie = $state<PoiCategorieId>("cultuur");
  let score = $state<PoiScore>(2);
  let omschrijving = $state("");
  let locatieNaam = $state("");
  let websiteUrl = $state("");
  let bezocht = $state(false);
  let saving = $state(false);

  const scoreOpties = [1, 2, 3] as const;

  $effect(() => {
    if (!open) return;
    naam = poi?.naam || "";
    categorie = poi?.categorie || "cultuur";
    score = poi?.score || 2;
    omschrijving = poi?.omschrijving || "";
    locatieNaam = poi?.locatieNaam || "";
    websiteUrl = poi?.websiteUrl || "";
    bezocht = poi?.bezocht === true;
  });

  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  async function handleSubmit() {
    const trimmedNaam = naam.trim();
    if (trimmedNaam.length < 2) {
      toonSnackbar("Geef de suggestie een duidelijke naam", "warning", E.WARN);
      return;
    }

    saving = true;
    try {
      const trimmedLocatie = locatieNaam.trim();
      const normalizedWebsite = normalizeExternalUrl(websiteUrl);
      const mapsLink = buildPoiMapsLink(trimmedNaam, trimmedLocatie);

      await onSave({
        naam: trimmedNaam,
        categorie,
        score,
        omschrijving: omschrijving.trim() || undefined,
        locatieNaam: trimmedLocatie || undefined,
        mapsLink: mapsLink || undefined,
        websiteUrl: normalizedWebsite || undefined,
        door: poi?.door || currentUser,
        bezocht
      });
    } catch (saveError) {
      console.error(saveError);
      toonSnackbar("Opslaan mislukt", "error", E.KRUIS);
    } finally {
      saving = false;
    }
  }
</script>

{#if open}
  <button type="button" class="poi-modal-overlay" onclick={onClose} aria-label="Sluit formulier"></button>
  <div class="poi-modal" role="dialog" aria-modal="true" aria-label={poi ? "POI aanpassen" : "POI toevoegen"}>
    <div class="poi-modal-head">
      <div>
        <div class="poi-modal-kicker">{poi ? "Suggestie aanpassen" : "Nieuwe suggestie"}</div>
        <h2 class="poi-modal-title">{poi ? "Werk deze stop bij" : "Wat willen jullie bewaren?"}</h2>
        <p class="poi-modal-sub">Voor {currentUser || "deze reis"} - compact, snel en zonder gedoe.</p>
      </div>
      <button type="button" class="btn-ghost btn-icon poi-close" onclick={onClose} aria-label="Sluiten">{E.X}</button>
    </div>

    <form class="poi-form" onsubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
      <label class="poi-field poi-field--wide">
        <span>Naam</span>
        <input bind:value={naam} maxlength="90" placeholder="Bijv. Pont du Gard" />
      </label>

      <label class="poi-field">
        <span>Categorie</span>
        <select bind:value={categorie}>
          {#each poiCategorieen as optie (optie.id)}
            <option value={optie.id}>{optie.emoji} {optie.label}</option>
          {/each}
        </select>
      </label>

      <label class="poi-field">
        <span>Locatie</span>
        <input bind:value={locatieNaam} maxlength="80" placeholder="Bijv. Avignon of centrum Toulouse" />
      </label>

      <label class="poi-field poi-field--wide">
        <span>Omschrijving</span>
        <textarea bind:value={omschrijving} rows="3" maxlength="220" placeholder="Waarom lijkt dit leuk, handig of bijzonder?"></textarea>
      </label>

      <label class="poi-field poi-field--wide">
        <span>Website</span>
        <input bind:value={websiteUrl} maxlength="120" placeholder="Optioneel: officiele website" />
      </label>

      <fieldset class="poi-score-group poi-field--wide">
        <legend>Prioriteit</legend>
        <div class="poi-score-options">
          {#each scoreOpties as value (value)}
            <button
              type="button"
              class="poi-score-option"
              class:active={score === value}
              onclick={() => (score = value)}
            >
              <div class="poi-score-dots" aria-hidden="true">
                {#each scoreOpties as dot (dot)}
                  <span class:active={dot <= value}></span>
                {/each}
              </div>
              <strong>{poiScoreMeta[value].korteLabel}</strong>
              <small>{poiScoreMeta[value].beschrijving}</small>
            </button>
          {/each}
        </div>
      </fieldset>

      <label class="poi-visited">
        <input type="checkbox" bind:checked={bezocht} />
        <span>Meteen markeren als bezocht</span>
      </label>

      <div class="poi-form-actions">
        <button type="submit" class="btn-primary poi-save" disabled={saving}>
          {saving ? "Opslaan..." : poi ? "Wijziging opslaan" : "Suggestie opslaan"}
        </button>
        <button type="button" class="btn-secondary" onclick={onClose} disabled={saving}>Annuleer</button>
      </div>
    </form>
  </div>
{/if}

<style>
  .poi-modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--black-a35);
    z-index: 150;
  }

  .poi-modal {
    position: fixed;
    left: var(--space-3);
    right: var(--space-3);
    bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, var(--space-2)) + var(--space-2-5));
    z-index: 160;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
    background: var(--card-bg);
    box-shadow: var(--shadow-xl);
    padding: var(--ui-space-5);
    max-height: min(82dvh, var(--breakpoint-md));
    overflow: auto;
  }

  .poi-modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-4);
    margin-bottom: var(--ui-space-4);
  }

  .poi-modal-kicker {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
  }

  .poi-modal-title {
    margin: var(--space-1) 0 0;
    font-size: var(--text-2xl);
    color: var(--heading);
    letter-spacing: var(--tracking-tighter);
  }

  .poi-modal-sub {
    margin: var(--space-1) 0 0;
    color: var(--nav-text);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
  }

  .poi-close {
    flex-shrink: 0;
  }

  .poi-form {
    display: grid;
    gap: var(--ui-space-3);
  }

  .poi-field {
    display: grid;
    gap: var(--space-1-5);
  }

  .poi-field span,
  .poi-score-group legend {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
  }

  .poi-field input,
  .poi-field select,
  .poi-field textarea {
    margin: 0;
  }

  .poi-score-group {
    border: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }

  .poi-score-options {
    display: grid;
    gap: var(--space-2);
  }

  .poi-score-option {
    min-height: 0;
    display: grid;
    justify-items: start;
    gap: var(--space-1-5);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 90%, var(--bg-accent-subtle));
    color: var(--tekst);
    text-align: left;
  }

  .poi-score-option.active {
    border-color: var(--nav-active);
    background: color-mix(in srgb, var(--card-bg) 82%, var(--bg-accent-subtle));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nav-active) 24%, transparent);
  }

  .poi-score-option strong {
    font-size: var(--text-base);
    color: var(--heading);
  }

  .poi-score-option small {
    font-size: var(--text-sm);
    color: var(--nav-text);
    line-height: var(--ui-line-compact);
  }

  .poi-score-dots {
    display: inline-flex;
    gap: var(--space-1);
  }

  .poi-score-dots span {
    width: var(--space-2-5);
    height: var(--space-2-5);
    border-radius: var(--radius-full);
    background: var(--bg-surface-sunken);
    border: 1px solid var(--border-strong);
  }

  .poi-score-dots span.active {
    background: var(--nav-active);
    border-color: var(--nav-active);
  }

  .poi-visited {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--card-bg) 90%, var(--bg-surface-sunken));
    font-size: var(--text-sm);
    color: var(--tekst);
    font-weight: var(--ui-weight-medium);
  }

  .poi-visited input {
    width: var(--space-4);
    height: var(--space-4);
    margin: 0;
  }

  .poi-form-actions {
    display: flex;
    gap: var(--ui-space-3);
    margin-top: var(--space-1);
  }

  .poi-save {
    flex: 1;
  }

  @media (min-width: var(--breakpoint-md)) {
    .poi-modal {
      left: 50%;
      right: auto;
      top: 50%;
      bottom: auto;
      width: min(var(--breakpoint-md), calc(100vw - var(--space-12)));
      transform: translate(-50%, -50%);
      max-height: min(88dvh, var(--breakpoint-md));
    }

    .poi-form {
      grid-template-columns: 1fr 1fr;
    }

    .poi-field--wide,
    .poi-score-group,
    .poi-visited,
    .poi-form-actions {
      grid-column: 1 / -1;
    }

    .poi-score-options {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  :global(html.dark) .poi-modal {
    background: var(--card-bg);
  }

  :global(html.dark) .poi-modal-sub,
  :global(html.dark) .poi-field span,
  :global(html.dark) .poi-score-group legend,
  :global(html.dark) .poi-score-option small {
    color: var(--text-tertiary);
  }

  :global(html.dark) .poi-score-option,
  :global(html.dark) .poi-visited {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
  }

  :global(html.dark) .poi-score-option strong,
  :global(html.dark) .poi-visited {
    color: var(--text-primary);
  }
</style>
