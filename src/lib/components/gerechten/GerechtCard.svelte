<script lang="ts">
  import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { toonSnackbar } from "$lib/stores.svelte.js";
  import { formatFullDate, formatTime } from "$lib/utils/formatters.js";

  let {
    gerecht,
    checks,
    currentUser,
    isExpanded,
    onToggle
  } = $props<{
    gerecht: any;
    checks: Record<string, any> | undefined;
    currentUser: string;
    isExpanded: boolean;
    onToggle: () => void;
  }>();

  let dennisCheck = $derived(checks?.dennis || null);
  let franziCheck = $derived(checks?.franzi || null);
  let userKey = $derived((currentUser || "").toLowerCase());
  let mijnCheck = $derived(userKey ? checks?.[userKey] || null : null);
  let heeftGeproefd = $derived(Boolean(mijnCheck));

  let gemiddeldeRating = $derived.by(() => {
    const values = [dennisCheck?.rating, franziCheck?.rating].filter((v) => typeof v === "number" && v > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  });

  const sterren = [1, 2, 3, 4, 5];

  async function toggleMijnProefStatus() {
    const naam = currentUser?.trim();
    if (!naam) return;
    const key = naam.toLowerCase();
    const ref = doc(db, "gerechten_checks", `${gerecht.id}_${key}`);

    try {
      if (mijnCheck) {
        await deleteDoc(ref);
        toonSnackbar(`${gerecht.naam} verwijderd uit jouw lijst`, "warning", "↩️");
      } else {
        await setDoc(ref, {
          gerechtId: gerecht.id,
          door: naam,
          geproefd: true,
          datum: serverTimestamp(),
          rating: 0
        });
        toonSnackbar(`${gerecht.naam} geproefd!`, "success", "✅");
      }
    } catch (e) {
      console.error(e);
      toonSnackbar("Opslaan mislukt", "error", "❌");
    }
  }

  async function saveRating(value: number) {
    const naam = currentUser?.trim();
    if (!naam || !mijnCheck) return;
    try {
      await updateDoc(doc(db, "gerechten_checks", `${gerecht.id}_${naam.toLowerCase()}`), { rating: value });
      toonSnackbar(`Rating opgeslagen: ${value}★`, "success", "⭐");
    } catch (e) {
      console.error(e);
      toonSnackbar("Rating opslaan mislukt", "error", "❌");
    }
  }
</script>

<div class="gr-card" class:done={heeftGeproefd}>
  <button type="button" class="gr-head" onclick={onToggle}>
    <div class="gr-emoji">{gerecht.emoji}</div>
    <div class="gr-main">
      <div class="gr-title-row">
        <strong class="gr-name">{gerecht.naam}</strong>
        {#if gemiddeldeRating}
          <span class="gr-rating">⭐ {gemiddeldeRating}</span>
        {/if}
      </div>
      <div class="gr-french">{gerecht.frans}</div>
      <div class="gr-tags">
        <span class="gr-tag">{gerecht.vegetarisch ? "🌱 Vegetarisch" : "🍖 Non-veg"}</span>
        <span class="gr-tag">{gerecht.smaak === "zoet" ? "🍰 Zoet" : "🧂 Hartig"}</span>
      </div>
    </div>
    <svg class="gr-chevron" class:open={isExpanded} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8L10 12L14 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if isExpanded}
    <div class="gr-detail">
      <p class="gr-omschrijving">{gerecht.omschrijving}</p>

      <div class="gr-user-status">
        <div class="gr-user-pill" class:checked={!!dennisCheck}>
          <span>Dennis</span>
          <span>{dennisCheck ? "✅" : "⬜"}</span>
        </div>
        <div class="gr-user-pill" class:checked={!!franziCheck}>
          <span>Franzi</span>
          <span>{franziCheck ? "✅" : "⬜"}</span>
        </div>
      </div>

      {#if mijnCheck}
        <div class="gr-mijn-meta">
          {#if mijnCheck.datum}
            <div>📅 {formatFullDate(mijnCheck.datum)} · 🕒 {formatTime(mijnCheck.datum)}</div>
          {/if}
          <div class="gr-stars">
            {#each sterren as s}
              <button
                type="button"
                class="gr-star"
                class:active={typeof mijnCheck.rating === "number" && mijnCheck.rating >= s}
                onclick={() => saveRating(s)}
                aria-label={`Geef ${s} sterren`}
              >★</button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="gr-streken">
        {#each gerecht.streken as streek}
          <span class="gr-streek-chip">{streek}</span>
        {/each}
      </div>

      <button
        type="button"
        class="gr-check-btn"
        class:active={heeftGeproefd}
        onclick={toggleMijnProefStatus}
      >
        {heeftGeproefd ? "↩️ Niet meer geproefd" : `✅ ${gerecht.naam} geproefd!`}
      </button>
    </div>
  {/if}
</div>

<style>
  .gr-card {
    background: var(--card-bg);
    border-radius: 14px;
    border: 2px solid transparent;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
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
    gap: 10px;
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
  .gr-main { flex: 1; min-width: 0; }
  .gr-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }
  .gr-name {
    font-size: 0.95rem;
    color: #0f172a;
    line-height: 1.2;
  }
  .gr-rating {
    font-size: 0.76rem;
    color: #b45309;
    font-weight: 700;
    flex-shrink: 0;
  }
  .gr-french {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 2px;
    font-style: italic;
  }
  .gr-tags {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .gr-tag {
    font-size: 0.68rem;
    padding: 2px 7px;
    border-radius: 999px;
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  .gr-chevron { flex-shrink: 0; transition: transform 0.2s ease; }
  .gr-chevron.open { transform: rotate(180deg); }

  .gr-detail {
    border-top: 1px solid #e2e8f0;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .gr-omschrijving {
    margin: 0;
    font-size: 0.86rem;
    line-height: 1.45;
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
    font-size: 0.8rem;
    color: #475569;
    font-weight: 700;
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
    font-size: 0.8rem;
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
    font-size: 0.72rem;
    padding: 4px 8px;
    border-radius: 999px;
    background: #eef2ff;
    color: #334155;
    border: 1px solid #dbeafe;
    text-transform: capitalize;
  }
  .gr-check-btn {
    width: 100%;
    border-radius: 10px;
    border: none;
    padding: 11px 12px;
    font-size: 0.86rem;
    font-weight: 700;
    background: #10b981;
    color: white;
  }
  .gr-check-btn.active {
    background: #64748b;
  }

  :global(html.dark) .gr-card { background: var(--card-bg); }
  :global(html.dark) .gr-card.done { background: #071a10; border-color: #10b981; }
  :global(html.dark) .gr-emoji { background: #1e293b; }
  :global(html.dark) .gr-name { color: #e2e8f0; }
  :global(html.dark) .gr-french { color: #94a3b8; }
  :global(html.dark) .gr-tag { background: #1e293b; border-color: #334155; color: #cbd5e1; }
  :global(html.dark) .gr-detail { border-top-color: #334155; }
  :global(html.dark) .gr-omschrijving,
  :global(html.dark) .gr-mijn-meta { color: #cbd5e1; }
  :global(html.dark) .gr-user-pill { background: #111827; border-color: #334155; color: #cbd5e1; }
  :global(html.dark) .gr-user-pill.checked { background: #0f2d1c; color: #86efac; border-color: #10b981; }
  :global(html.dark) .gr-star { background: #111827; border-color: #334155; color: #64748b; }
  :global(html.dark) .gr-star.active { background: #3b2006; border-color: #f59e0b; color: #fbbf24; }
  :global(html.dark) .gr-streek-chip { background: #1e293b; border-color: #334155; color: #cbd5e1; }
</style>
