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
          {#each cats as c (c.id)}
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
        <button type="submit" class="btn-save action-save" disabled={!kanOpslaan} data-disabled-opacity="0.6">Opslaan</button>
        <button type="button" class="btn-secondary btn-icon action-cancel" onclick={() => toonForm = false} aria-label="Sluiten">
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
    bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, var(--space-2)) + var(--space-3));
    right: var(--space-5);
    width: var(--space-14);
    height: var(--space-14);
    min-height: var(--space-14);
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--color-primary-800), var(--color-primary-700));
    color: var(--text-inverse);
    font-size: var(--text-lg);
    font-weight: var(--ui-weight-bold);
    border: none;
    box-shadow: 0 var(--space-2) var(--space-6) var(--card-shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 120;
    transition: transform var(--duration-fast) var(--ease-default);
    animation: fabIn var(--duration-normal) var(--ease-out);
  }
  .fab:active { transform: scale(0.92); }
  .fab-icon {
    line-height: 1;
  }
  .fab-label {
    display: none;
    line-height: 1;
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
  }

  .fab-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-overlay);
    z-index: 130;
  }
  .fab-form {
    position: fixed;
    bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, var(--space-2)) + var(--space-2-5));
    left: var(--space-4);
    right: var(--space-4);
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--ui-space-5);
    box-shadow: 0 var(--space-3) var(--space-8) var(--card-shadow);
    border: 1px solid var(--border-subtle);
    max-height: min(76dvh, var(--space-135));
    overflow: auto;
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, var(--space-2)));
    z-index: 140;
    animation: slideUp var(--duration-normal) var(--ease-out);
  }

  @keyframes fabIn {
    from {
      opacity: 0;
      transform: translateY(var(--space-2));
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
    gap: var(--space-0-5);
  }
  .form-header h3 {
    font-size: var(--text-lg);
    font-weight: var(--ui-weight-heavy);
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--heading);
    margin: 0;
  }
  .form-header p {
    font-size: var(--text-sm);
    color: var(--nav-text);
    font-weight: var(--weight-medium);
    margin: 0;
  }
  .field-group {
    display: grid;
    gap: var(--space-1-5);
  }
  .field-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: var(--ui-weight-bold);
    color: var(--nav-text);
  }
  .field-input,
  .field-select {
    margin-bottom: 0;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--input-border);
    min-height: var(--ui-touch-min);
    padding: var(--space-2-5) var(--space-3);
    font-size: var(--text-base);
    line-height: var(--ui-line-compact);
    font-weight: var(--weight-medium);
    color: var(--tekst);
    background: var(--input-bg);
    width: 100%;
  }
  .field-input::placeholder {
    color: var(--input-placeholder);
    font-weight: var(--weight-medium);
  }
  .field-select {
    font-weight: var(--weight-medium);
  }
  .form-actions {
    display: flex;
    gap: var(--ui-actions-gap);
    margin-top: var(--space-0-5);
  }
  .action-save {
    flex: 1;
    width: auto;
  }
  .action-cancel {
    width: var(--space-12-5);
    min-width: var(--space-12-5);
    font-size: var(--text-lg);
    padding: 0;
    line-height: 1;
  }
  .action-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 1100px) {
    .fab {
      bottom: var(--space-6);
      right: max(var(--space-6), calc((100vw - var(--app-max-width)) / 2 + var(--space-6)));
      width: auto;
      min-width: var(--space-44);
      height: var(--space-13-5);
      border-radius: var(--radius-md);
      padding: 0 var(--space-4);
      gap: var(--space-2);
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
    }
    .fab-label {
      display: inline;
    }
    .fab-form {
      bottom: var(--space-4-5);
      max-width: var(--space-130);
      left: auto;
      right: max(var(--space-6), calc((100vw - var(--app-max-width)) / 2 + var(--space-6)));
      max-height: min(82dvh, var(--space-155));
      padding: var(--space-5-5);
    }
    .budget-add-form {
      gap: var(--space-3);
    }
    .form-header h3 {
      font-size: var(--text-lg);
    }
    .form-header p {
      font-size: var(--text-sm);
    }
    .field-label {
      font-size: var(--text-xs);
    }
    .field-input,
    .field-select {
      min-height: var(--space-12);
      font-size: var(--text-base);
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
  :global(html.dark) .action-cancel {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
    color: var(--text-secondary);
  }
</style>



