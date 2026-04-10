<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { addDoc, collection, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";
  import { parseLocalizedNumber } from "$lib/utils/formatters.js";

  let { cats } = $props();

  let bedrag = $state("");
  let categorie = $state("dining");
  let omschrijving = $state("");
  let toonForm = $state(false);
  let isMounted = $state(false);
  let autoOpenHandled = $state(false);

  /** @param {string} raw */
  function parseBedrag(raw) {
    return parseLocalizedNumber(raw);
  }

  let bedragWaarde = $derived.by(() => parseBedrag(bedrag));
  let omschrijvingTrimmed = $derived.by(() => omschrijving.trim());
  let kanOpslaan = $derived.by(
    () =>
      Number.isFinite(bedragWaarde) &&
      bedragWaarde > 0 &&
      omschrijvingTrimmed.length >= 2
  );

  async function voegToe() {
    if (!kanOpslaan) {
      toonSnackbar("Vul een geldig bedrag en omschrijving in", "warning", E.WARN);
      return;
    }

    try {
      await addDoc(collection(db, "uitgaven"), {
        bedrag: Number(bedragWaarde.toFixed(2)),
        categorie,
        omschrijving: omschrijvingTrimmed,
        door: appState.gebruiker,
        datum: serverTimestamp()
      });
      bedrag = "";
      omschrijving = "";
      toonForm = false;
      toonSnackbar("Uitgave toegevoegd", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Fout bij opslaan", "error", E.KRUIS);
    }
  }

  onMount(() => {
    isMounted = true;
  });

  $effect(() => {
    if (!isMounted || autoOpenHandled) return;
    if ($page.url.searchParams.get("nieuw") !== "1") return;

    toonForm = true;
    autoOpenHandled = true;

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("nieuw");
      window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }
  });
</script>

{#if isMounted && toonForm}
  <button type="button" class="fab-overlay" onclick={() => toonForm = false} aria-label="Sluiten"></button>
  <div class="fab-form">
    <form class="budget-add-form" onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
      <div class="form-header">
        <h3>{E.GELD} Nieuwe uitgave</h3>
        <p>Snel registreren voor {appState.gebruiker || "deze reis"}</p>
      </div>

      <label class="field-group">
        <span class="field-label">Bedrag</span>
        <input
          class="field-input"
          type="text"
          bind:value={bedrag}
          placeholder="0,00"
          inputmode="decimal"
        />
      </label>

      <label class="field-group">
        <span class="field-label">Categorie</span>
        <select class="field-select" bind:value={categorie}>
          {#each cats as c}
            <option value={c.id}>{c.emoji} {c.label}</option>
          {/each}
        </select>
      </label>

      <label class="field-group">
        <span class="field-label">Omschrijving</span>
        <input
          class="field-input"
          bind:value={omschrijving}
          placeholder="Bijv. lunch op camping"
          maxlength="80"
        />
      </label>

      <div class="form-actions">
        <button type="submit" class="btn-save action-save" disabled={!kanOpslaan}>Opslaan</button>
        <button type="button" class="btn-danger btn-icon action-cancel" onclick={() => toonForm = false} aria-label="Sluiten">
          {E.X}
        </button>
      </div>
    </form>
  </div>
{:else if isMounted}
  <button class="fab" onclick={() => toonForm = true}>
    <span class="fab-icon">+</span>
    <span class="fab-label">Nieuwe uitgave</span>
  </button>
{/if}

<style>
  .fab {
    position: fixed;
    bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, 8px) + 12px);
    right: 20px;
    width: 56px;
    height: 56px;
    min-height: 56px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--color-primary-800), var(--color-primary-700));
    color: var(--text-inverse);
    font-size: 1.4rem;
    font-weight: var(--ui-weight-bold);
    border: none;
    box-shadow: 0 8px 24px var(--card-shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 120;
    transition: transform 0.15s ease;
    animation: fabIn 0.18s ease-out;
  }
  .fab:active { transform: scale(0.92); }
  .fab-icon {
    line-height: 1;
  }
  .fab-label {
    display: none;
    line-height: 1;
    font-size: var(--font-size-sm);
    font-weight: 700;
  }

  .fab-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 130;
  }
  .fab-form {
    position: fixed;
    bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, 8px) + 10px);
    left: 16px;
    right: 16px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--ui-space-5);
    box-shadow: 0 12px 32px var(--card-shadow);
    border: 1px solid var(--border-subtle);
    max-height: min(76dvh, 540px);
    overflow: auto;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
    z-index: 140;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes fabIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .budget-add-form {
    display: grid;
    gap: var(--ui-form-gap);
  }
  .form-header {
    display: grid;
    gap: 3px;
  }
  .form-header h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--ui-weight-heavy);
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--heading);
    margin: 0;
  }
  .form-header p {
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    font-weight: 500;
    margin: 0;
  }
  .field-group {
    display: grid;
    gap: 6px;
  }
  .field-label {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: var(--ui-weight-bold);
    color: var(--nav-text);
  }
  .field-input,
  .field-select {
    margin-bottom: 0;
    border-radius: 10px;
    border: 1.5px solid var(--input-border);
    min-height: 46px;
    padding: 10px 12px;
    font-size: var(--font-size-md);
    line-height: var(--ui-line-compact);
    font-weight: 500;
    color: var(--tekst);
    background: var(--input-bg);
    width: 100%;
  }
  .field-input::placeholder {
    color: var(--input-placeholder);
    font-weight: 500;
  }
  .field-select {
    font-weight: 500;
  }
  .form-actions {
    display: flex;
    gap: var(--ui-actions-gap);
    margin-top: 2px;
  }
  .action-save {
    flex: 1;
    width: auto;
  }
  .action-cancel {
    width: 50px;
    min-width: 50px;
    font-size: 1.25rem;
    padding: 0;
    line-height: 1;
  }

  @media (min-width: 1100px) {
    .fab {
      bottom: 24px;
      right: max(24px, calc((100vw - var(--app-max-width)) / 2 + 24px));
      width: auto;
      min-width: 176px;
      height: 54px;
      border-radius: var(--radius-md);
      padding: 0 16px;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
    }
    .fab-label {
      display: inline;
    }
    .fab-form {
      bottom: 18px;
      max-width: 520px;
      left: auto;
      right: max(24px, calc((100vw - var(--app-max-width)) / 2 + 24px));
      max-height: min(82dvh, 620px);
      padding: 22px;
    }
    .budget-add-form {
      gap: 13px;
    }
    .form-header h3 {
      font-size: 1.25rem;
    }
    .form-header p {
      font-size: var(--font-size-sm);
    }
    .field-label {
      font-size: var(--font-size-xs);
    }
    .field-input,
    .field-select {
      min-height: 48px;
      font-size: var(--font-size-md);
    }
  }

  :global(html.dark) .form-header h3 { color: var(--text-primary); }
  :global(html.dark) .form-header p { color: var(--text-tertiary); }
  :global(html.dark) .field-label { color: var(--text-secondary); }
  :global(html.dark) .field-input,
  :global(html.dark) .field-select {
    border-color: var(--border-strong);
    color: var(--text-primary);
    background: var(--bg-surface);
  }
  :global(html.dark) .field-input::placeholder { color: var(--text-secondary); }
  :global(html.dark) .action-cancel { background: var(--color-error-base); }
</style>


