<script lang="ts">
  import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { E } from "$lib/emojis.js";
  import { toonSnackbar } from "$lib/stores.svelte.js";
  import { formatFullDate, formatTime } from "$lib/utils/formatters.js";
  import type { Gerecht, GerechtCheck } from "$lib/types.js";

  let {
    gerecht,
    checks,
    currentUser,
    foto,
    groteFoto,
    fotoStatus = "loading",
    isExpanded,
    onToggle
  } = $props<{
    gerecht: Gerecht;
    checks: Partial<Record<string, GerechtCheck>> | undefined;
    currentUser: string;
    foto?: string;
    groteFoto?: string;
    fotoStatus?: "loading" | "ready" | "missing";
    isExpanded: boolean;
    onToggle: () => void;
  }>();

  let dennisCheck = $derived(checks?.dennis || null);
  let franziCheck = $derived(checks?.franzi || null);
  let userKey = $derived((currentUser || "").toLowerCase());
  let mijnCheck = $derived(userKey ? checks?.[userKey] || null : null);
  let heeftGeproefd = $derived(Boolean(mijnCheck));
  let imgError = $state(false);
  let toonFullscreenFoto = $state(false);
  let groteFotoSrc = $derived(groteFoto || foto || "");

  let gemiddeldeRating = $derived.by(() => {
    const values = [dennisCheck?.rating, franziCheck?.rating].filter((value) => typeof value === "number" && value > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return avg.toFixed(1);
  });

  const sterren = [1, 2, 3, 4, 5];

  $effect(() => {
    if (foto || groteFoto) imgError = false;
  });

  $effect(() => {
    if (!isExpanded) toonFullscreenFoto = false;
  });

  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = toonFullscreenFoto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  function korteOmschrijving(tekst: string) {
    if (!tekst) return "";
    const clean = tekst.trim();
    const eersteZin = clean.split(".")[0]?.trim() || clean;
    if (eersteZin.length <= 72) return eersteZin;
    return `${eersteZin.slice(0, 69).trim()}...`;
  }

  async function toggleMijnProefStatus() {
    const naam = currentUser?.trim();
    if (!naam) return;
    const key = naam.toLowerCase();
    const ref = doc(db, "gerechten_checks", `${gerecht.id}_${key}`);

    try {
      if (mijnCheck) {
        await deleteDoc(ref);
        toonSnackbar(`${gerecht.naam} verwijderd uit jouw lijst`, "warning", E.UNDO);
      } else {
        await setDoc(
          ref,
          {
            gerechtId: gerecht.id,
            door: naam,
            geproefd: true,
            datum: serverTimestamp(),
            rating: 0
          },
          { merge: true }
        );
        toonSnackbar(`${gerecht.naam} geproefd!`, "success", E.CHECK);
      }
    } catch (error) {
      console.error(error);
      toonSnackbar("Opslaan mislukt", "error", E.KRUIS);
    }
  }

  async function saveRating(value: number) {
    const naam = currentUser?.trim();
    if (!naam || !mijnCheck) return;

    try {
      await updateDoc(doc(db, "gerechten_checks", `${gerecht.id}_${naam.toLowerCase()}`), { rating: value });
      toonSnackbar(`Rating opgeslagen: ${value}/5`, "success", E.TARGET);
    } catch (error) {
      console.error(error);
      toonSnackbar("Rating opslaan mislukt", "error", E.KRUIS);
    }
  }
</script>

<div class="gr-card" class:done={heeftGeproefd}>
  <button type="button" class="gr-head" onclick={onToggle} aria-expanded={isExpanded}>
    <div class="gr-emoji">{gerecht.emoji}</div>
    <div class="gr-main">
      <div class="gr-title-row">
        <strong class="gr-name">{gerecht.frans || gerecht.naam}</strong>
        {#if gemiddeldeRating}
          <span class="gr-rating">Gem. {gemiddeldeRating}</span>
        {/if}
      </div>
      <div class="gr-kort">{korteOmschrijving(gerecht.omschrijving)}</div>
      <div class="gr-tags">
        <span class="gr-tag ui-chip ui-chip--muted">{gerecht.vegetarisch ? "Vegetarisch" : "Non-veg"}</span>
        {#if gerecht.vis}
          <span class="gr-tag ui-chip ui-chip--muted">Vis</span>
        {/if}
        <span class="gr-tag ui-chip ui-chip--muted">{gerecht.smaak === "zoet" ? "Zoet" : "Hartig"}</span>
      </div>
    </div>
    <svg class="gr-chevron" class:open={isExpanded} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8L10 12L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  {#if isExpanded}
    <div class="gr-detail">
      {#if groteFotoSrc && !imgError}
        <button
          type="button"
          class="gr-beeld-btn"
          onclick={() => (toonFullscreenFoto = true)}
          aria-label={`Open foto van ${gerecht.frans || gerecht.naam} op volledig scherm`}
        >
          <figure class="gr-beeld">
            <img
              src={groteFotoSrc}
              alt={gerecht.frans || gerecht.naam}
              class="gr-foto-groot"
              loading="lazy"
              decoding="async"
              onerror={(event) => {
                const target = event.currentTarget;
                if (!(target instanceof HTMLImageElement)) return;
                if (foto && target.src !== foto) {
                  target.src = foto;
                  return;
                }
                imgError = true;
              }}
            />
            <figcaption class="gr-foto-hint">Open fullscreen</figcaption>
          </figure>
        </button>
      {:else}
        <div class="gr-beeld-ph">
          <div class="gr-beeld-ph-emoji">{gerecht.emoji}</div>
          <div class="gr-beeld-ph-text">
            {#if fotoStatus === "missing"}
              Geen betrouwbare foto gevonden
            {:else if foto || groteFoto}
              Foto niet beschikbaar
            {:else}
              Foto wordt geladen...
            {/if}
          </div>
        </div>
      {/if}

      <p class="gr-omschrijving">{gerecht.omschrijving}</p>

      <div class="gr-user-status">
        <div class="gr-user-pill" class:checked={!!dennisCheck}>
          <span>Dennis</span>
          <span>{dennisCheck ? E.CHECK : "Open"}</span>
        </div>
        <div class="gr-user-pill" class:checked={!!franziCheck}>
          <span>Franzi</span>
          <span>{franziCheck ? E.CHECK : "Open"}</span>
        </div>
      </div>

      {#if mijnCheck}
        <div class="gr-mijn-meta">
          {#if mijnCheck.datum}
            <div>{E.KALENDER} {formatFullDate(mijnCheck.datum)} - {formatTime(mijnCheck.datum)}</div>
          {/if}
          <div class="gr-stars">
            {#each sterren as s (s)}
              <button
                type="button"
                class="gr-star"
                class:active={typeof mijnCheck.rating === "number" && mijnCheck.rating >= s}
                onclick={() => saveRating(s)}
                aria-label={`Geef ${s} sterren`}
              >
                &#9733;
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="gr-streken">
        {#each gerecht.streken as streek (streek)}
          <span class="gr-streek-chip ui-chip ui-chip--info">{streek}</span>
        {/each}
      </div>

      <button type="button" class="gr-check-btn btn-save" class:active={heeftGeproefd} onclick={toggleMijnProefStatus}>
        {heeftGeproefd ? "Niet meer geproefd" : `${gerecht.naam} geproefd`}
      </button>
    </div>
  {/if}
</div>

{#if toonFullscreenFoto && groteFotoSrc}
  <div class="gr-fs-overlay" role="dialog" aria-modal="true" aria-label={`Foto van ${gerecht.frans || gerecht.naam}`}>
    <button type="button" class="gr-fs-back" onclick={() => (toonFullscreenFoto = false)}>
      {E.PIJL} Terug
    </button>
    <img src={groteFotoSrc} alt={gerecht.frans || gerecht.naam} class="gr-fs-img" />
  </div>
{/if}

<style>
  .gr-card {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .gr-card.done {
    border-color: var(--color-success-base);
    background: var(--color-success-light);
  }

  .gr-head {
    width: 100%;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    text-align: left;
    cursor: pointer;
  }

  .gr-emoji {
    width: calc(var(--space-12) + var(--space-1));
    height: calc(var(--space-12) + var(--space-1));
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface-sunken);
    font-size: 1.65rem;
    flex-shrink: 0;
  }

  .gr-main {
    flex: 1;
    min-width: 0;
  }

  .gr-title-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    justify-content: space-between;
  }

  .gr-name {
    font-size: var(--text-base);
    font-weight: var(--ui-weight-bold);
    color: var(--text-primary);
    line-height: var(--ui-line-compact);
  }

  .gr-rating {
    font-size: var(--text-xs);
    color: var(--text-warning);
    font-weight: var(--ui-weight-bold);
    flex-shrink: 0;
  }

  .gr-kort {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-top: var(--space-0-5);
    font-style: italic;
    line-height: var(--ui-line-compact);
  }

  .gr-tags {
    margin-top: var(--space-1-5);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .gr-tag {
    min-height: var(--ui-touch-compact);
  }

  .gr-chevron {
    flex-shrink: 0;
    transition: transform var(--duration-normal) ease;
  }

  .gr-chevron.open {
    transform: rotate(180deg);
  }

  .gr-detail {
    border-top: 1px solid var(--border-default);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .gr-beeld-btn {
    background: none;
    border: none;
    padding: 0;
    width: 100%;
    cursor: zoom-in;
  }

  .gr-beeld {
    width: 100%;
    height: calc(var(--space-16) * 4);
    margin: 0;
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    background: var(--bg-surface-sunken);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gr-foto-groot {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    background: transparent;
  }

  .gr-foto-hint {
    position: absolute;
    right: var(--space-2-5);
    bottom: var(--space-2-5);
    margin: 0;
    font-size: var(--text-xs);
    color: var(--text-inverse);
    background: color-mix(in srgb, var(--bg-surface-sunken) 70%, var(--black-a35));
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
  }

  .gr-beeld-ph {
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--bg-surface) , var(--bg-surface-sunken));
    border: 1px solid var(--border-default);
    min-height: calc(var(--space-16) * 3 + var(--space-8));
    display: grid;
    place-items: center;
    gap: var(--space-2);
    padding: var(--space-6);
    text-align: center;
  }

  .gr-beeld-ph-emoji {
    font-size: var(--text-3xl);
    line-height: 1;
  }

  .gr-beeld-ph-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--ui-weight-semibold);
  }

  .gr-omschrijving {
    margin: 0;
    font-size: var(--text-sm);
    line-height: var(--ui-line-body);
    color: var(--text-secondary);
  }

  .gr-user-status {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .gr-user-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2-5);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--ui-weight-semibold);
  }

  .gr-user-pill.checked {
    border-color: var(--color-success-base);
    background: var(--color-success-light);
    color: var(--text-success);
  }

  .gr-mijn-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .gr-stars {
    display: flex;
    gap: var(--space-1);
  }

  .gr-star {
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    width: var(--touch-target-compact);
    height: var(--touch-target-compact);
    line-height: 1;
    font-size: var(--text-base);
    padding: 0;
  }

  .gr-star.active {
    color: var(--text-warning);
    border-color: var(--text-warning);
    background: var(--color-warning-light);
  }

  .gr-streken {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1-5);
  }

  .gr-streek-chip {
    text-transform: capitalize;
  }

  .gr-check-btn {
    width: 100%;
    min-height: var(--ui-touch-min);
    border-radius: var(--radius-lg);
    border: none;
    padding: 0 var(--space-3);
    font-size: var(--text-base);
    font-weight: var(--ui-weight-bold);
    background: var(--color-success-base);
    color: var(--text-inverse);
  }

  .gr-check-btn.active {
    background: var(--bg-interactive-active);
  }

  .gr-fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: color-mix(in srgb, var(--bg-surface-sunken) 95%, var(--black-a50));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(var(--space-12) + var(--space-2)) var(--space-3) var(--space-4);
  }

  .gr-fs-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }

  .gr-fs-back {
    position: absolute;
    top: var(--space-2-5);
    left: var(--space-2-5);
    border: none;
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-3);
    background: var(--white-a15);
    color: var(--text-inverse);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
    cursor: pointer;
  }

  @media (min-width: 1100px) {
    .gr-head {
      gap: var(--space-3);
      padding: var(--space-3);
    }
    .gr-emoji {
      width: calc(var(--space-16) - var(--space-0-5));
      height: calc(var(--space-16) - var(--space-0-5));
      font-size: 1.9rem;
    }
    .gr-name {
      font-size: var(--text-lg);
    }
    .gr-kort {
      font-size: var(--text-base);
    }
    .gr-detail {
      padding: var(--space-3);
      gap: var(--space-4);
    }
    .gr-beeld {
      height: calc(var(--space-16) * 5);
    }
    .gr-omschrijving,
    .gr-mijn-meta {
      font-size: var(--text-base);
    }
    .gr-user-pill {
      font-size: var(--text-base);
      min-height: var(--ui-touch-min);
    }
    .gr-check-btn {
      min-height: var(--space-12);
      font-size: var(--text-lg);
    }
  }

  :global(html.dark) .gr-card {
    background: var(--card-bg);
  }

  :global(html.dark) .gr-card.done {
    background: color-mix(in srgb, var(--color-success-dark) 34%, var(--bg-surface));
    border-color: var(--color-success-base);
  }

  :global(html.dark) .gr-emoji {
    background: var(--bg-surface-raised);
  }

  :global(html.dark) .gr-name {
    color: var(--text-primary);
  }

  :global(html.dark) .gr-kort {
    color: var(--text-tertiary);
  }

  :global(html.dark) .gr-tag {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }

  :global(html.dark) .gr-detail {
    border-top-color: var(--border-strong);
  }

  :global(html.dark) .gr-beeld {
    background: var(--bg-surface);
  }

  :global(html.dark) .gr-beeld-ph {
    background: linear-gradient(135deg, var(--bg-surface), var(--bg-surface-raised));
    border-color: var(--border-strong);
  }

  :global(html.dark) .gr-beeld-ph-text,
  :global(html.dark) .gr-omschrijving,
  :global(html.dark) .gr-mijn-meta {
    color: var(--text-secondary);
  }

  :global(html.dark) .gr-user-pill {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }

  :global(html.dark) .gr-user-pill.checked {
    background: color-mix(in srgb, var(--color-success-dark) 34%, var(--bg-surface));
    color: var(--color-success-light);
    border-color: var(--color-success-base);
  }

  :global(html.dark) .gr-star {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }

  :global(html.dark) .gr-star.active {
    background: color-mix(in srgb, var(--color-warning-dark) 34%, var(--bg-surface));
    border-color: var(--text-warning);
    color: var(--color-warning-light);
  }

  :global(html.dark) .gr-streek-chip {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }
</style>



