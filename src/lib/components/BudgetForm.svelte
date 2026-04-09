<script>
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
</script>

{#if toonForm}
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
        <button type="button" class="action-cancel" onclick={() => toonForm = false} aria-label="Sluiten">
          {E.X}
        </button>
      </div>
    </form>
  </div>
{:else}
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
    border-radius: 16px;
    background: linear-gradient(135deg, #0a3764, #0f4d84);
    color: white;
    font-size: 28px;
    font-weight: 300;
    border: none;
    box-shadow: 0 8px 24px var(--card-shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 120;
    transition: transform 0.15s ease;
  }
  .fab:active { transform: scale(0.92); }
  .fab-icon {
    line-height: 1;
  }
  .fab-label {
    display: none;
    line-height: 1;
    font-size: 0.95rem;
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
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 12px 32px var(--card-shadow);
    border: 1px solid var(--border-subtle);
    max-height: min(76dvh, 540px);
    overflow: auto;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
    z-index: 140;
    animation: slideUp 0.2s ease-out;
  }
  .budget-add-form {
    display: grid;
    gap: 12px;
  }
  .form-header {
    display: grid;
    gap: 3px;
  }
  .form-header h3 {
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--heading);
    margin: 0;
  }
  .form-header p {
    font-size: 0.84rem;
    color: var(--nav-text);
    font-weight: 500;
    margin: 0;
  }
  .field-group {
    display: grid;
    gap: 6px;
  }
  .field-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: var(--nav-text);
  }
  .field-input,
  .field-select {
    margin-bottom: 0;
    border-radius: 10px;
    border: 1.5px solid var(--input-border);
    min-height: 46px;
    padding: 10px 12px;
    font-size: 1rem;
    line-height: 1.2;
    font-weight: 600;
    color: var(--tekst);
    background: var(--input-bg);
    width: 100%;
  }
  .field-input::placeholder {
    color: var(--input-placeholder);
    font-weight: 500;
  }
  .field-select {
    font-weight: 600;
  }
  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }
  .action-save {
    flex: 1;
    width: auto;
  }
  .action-cancel {
    width: 50px;
    min-height: 44px;
    border-radius: 10px;
    background: var(--rood);
    color: #fff;
    font-size: 1.25rem;
    font-weight: 700;
    border: none;
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
      border-radius: 14px;
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
      font-size: 0.86rem;
    }
    .field-label {
      font-size: 0.73rem;
    }
    .field-input,
    .field-select {
      min-height: 48px;
      font-size: 1.02rem;
    }
  }

  :global(html.dark) .form-header h3 { color: #f1f5f9; }
  :global(html.dark) .form-header p { color: #94a3b8; }
  :global(html.dark) .field-label { color: #cbd5e1; }
  :global(html.dark) .field-input,
  :global(html.dark) .field-select {
    border-color: #334155;
    color: #e2e8f0;
    background: #0f172a;
  }
  :global(html.dark) .field-input::placeholder { color: #64748b; }
  :global(html.dark) .action-cancel { background: #dc2626; }
</style>
