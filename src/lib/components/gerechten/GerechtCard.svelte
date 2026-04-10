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
  <button type="button" class="gr-head" onclick={onToggle}>
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
      <path d="M6 8L10 12L14 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
            {#each sterren as s}
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
        {#each gerecht.streken as streek}
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
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .gr-card.done {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .gr-head {
    width: 100%;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    text-align: left;
    cursor: pointer;
  }

  .gr-emoji {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
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
    gap: 8px;
    justify-content: space-between;
  }

  .gr-name {
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-bold);
    color: #0f172a;
    line-height: var(--ui-line-compact);
  }

  .gr-rating {
    font-size: var(--font-size-xs);
    color: #b45309;
    font-weight: var(--ui-weight-bold);
    flex-shrink: 0;
  }

  .gr-kort {
    font-size: var(--font-size-sm);
    color: #64748b;
    margin-top: 2px;
    font-style: italic;
    line-height: var(--ui-line-compact);
  }

  .gr-tags {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .gr-tag {
    min-height: 26px;
  }

  .gr-chevron {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .gr-chevron.open {
    transform: rotate(180deg);
  }

  .gr-detail {
    border-top: 1px solid #e2e8f0;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    height: 260px;
    margin: 0;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.2);
    background: #e2e8f0;
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
    right: 10px;
    bottom: 10px;
    margin: 0;
    font-size: var(--font-size-xs);
    color: white;
    background: rgba(15, 23, 42, 0.7);
    padding: 4px 8px;
    border-radius: 999px;
  }

  .gr-beeld-ph {
    border-radius: 12px;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border: 1px solid #dbeafe;
    min-height: 220px;
    display: grid;
    place-items: center;
    gap: 8px;
    padding: 24px;
    text-align: center;
  }

  .gr-beeld-ph-emoji {
    font-size: 2.5rem;
    line-height: 1;
  }

  .gr-beeld-ph-text {
    font-size: var(--font-size-sm);
    color: #475569;
    font-weight: var(--ui-weight-semibold);
  }

  .gr-omschrijving {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--ui-line-body);
    color: #334155;
  }

  .gr-user-status {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .gr-user-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    font-size: var(--font-size-sm);
    color: #475569;
    font-weight: var(--ui-weight-semibold);
  }

  .gr-user-pill.checked {
    border-color: #10b981;
    background: #ecfdf5;
    color: #065f46;
  }

  .gr-mijn-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: var(--font-size-sm);
    color: #475569;
  }

  .gr-stars {
    display: flex;
    gap: 4px;
  }

  .gr-star {
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #cbd5e1;
    border-radius: 8px;
    width: 34px;
    height: 30px;
    line-height: 1;
    font-size: 1rem;
    padding: 0;
  }

  .gr-star.active {
    color: #f59e0b;
    border-color: #f59e0b;
    background: #fff7ed;
  }

  .gr-streken {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .gr-streek-chip {
    text-transform: capitalize;
  }

  .gr-check-btn {
    width: 100%;
    min-height: var(--ui-touch-min);
    border-radius: 12px;
    border: none;
    padding: 0 12px;
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-bold);
    background: #10b981;
    color: white;
  }

  .gr-check-btn.active {
    background: #64748b;
  }

  .gr-fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(2, 6, 23, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 56px 12px 16px;
  }

  .gr-fs-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }

  .gr-fs-back {
    position: absolute;
    top: 10px;
    left: 10px;
    border: none;
    border-radius: 999px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.14);
    color: white;
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-bold);
    cursor: pointer;
  }

  @media (min-width: 1100px) {
    .gr-head {
      gap: 14px;
      padding: 14px;
    }
    .gr-emoji {
      width: 62px;
      height: 62px;
      font-size: 1.9rem;
    }
    .gr-name {
      font-size: var(--font-size-lg);
    }
    .gr-kort {
      font-size: var(--font-size-md);
    }
    .gr-detail {
      padding: 14px;
      gap: 16px;
    }
    .gr-beeld {
      height: 320px;
    }
    .gr-omschrijving,
    .gr-mijn-meta {
      font-size: var(--font-size-md);
    }
    .gr-user-pill {
      font-size: var(--font-size-md);
      min-height: 42px;
    }
    .gr-check-btn {
      min-height: 48px;
      font-size: var(--font-size-lg);
    }
  }

  :global(html.dark) .gr-card {
    background: var(--card-bg);
  }

  :global(html.dark) .gr-card.done {
    background: #071a10;
    border-color: #10b981;
  }

  :global(html.dark) .gr-emoji {
    background: #1e293b;
  }

  :global(html.dark) .gr-name {
    color: #e2e8f0;
  }

  :global(html.dark) .gr-kort {
    color: #94a3b8;
  }

  :global(html.dark) .gr-tag {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }

  :global(html.dark) .gr-detail {
    border-top-color: #334155;
  }

  :global(html.dark) .gr-beeld {
    background: #0f172a;
  }

  :global(html.dark) .gr-beeld-ph {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    border-color: #334155;
  }

  :global(html.dark) .gr-beeld-ph-text,
  :global(html.dark) .gr-omschrijving,
  :global(html.dark) .gr-mijn-meta {
    color: #cbd5e1;
  }

  :global(html.dark) .gr-user-pill {
    background: #111827;
    border-color: #334155;
    color: #cbd5e1;
  }

  :global(html.dark) .gr-user-pill.checked {
    background: #0f2d1c;
    color: #86efac;
    border-color: #10b981;
  }

  :global(html.dark) .gr-star {
    background: #111827;
    border-color: #334155;
    color: #64748b;
  }

  :global(html.dark) .gr-star.active {
    background: #3b2006;
    border-color: #f59e0b;
    color: #fbbf24;
  }

  :global(html.dark) .gr-streek-chip {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }
</style>
