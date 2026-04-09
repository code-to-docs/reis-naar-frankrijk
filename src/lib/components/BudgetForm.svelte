<script>
  import { addDoc, collection, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";

  let { cats } = $props();

  let bedrag = $state("");
  let categorie = $state("dining");
  let omschrijving = $state("");
  let toonForm = $state(false);

  async function voegToe() {
    if (!bedrag || !omschrijving.trim()) return;
    try {
      await addDoc(collection(db, "uitgaven"), {
        bedrag: parseFloat(bedrag),
        categorie,
        omschrijving: omschrijving.trim(),
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
    <form onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
      <input type="number" step="0.01" bind:value={bedrag} placeholder="Bedrag" />
      <select bind:value={categorie}>
        {#each cats as c}
          <option value={c.id}>{c.emoji} {c.label}</option>
        {/each}
      </select>
      <input bind:value={omschrijving} placeholder="Omschrijving" />
      <div style="display:flex;gap:8px;">
        <button type="submit" class="btn-success" style="flex:1;color:white;font-weight:700;">Opslaan</button>
        <button type="button" class="btn-danger" onclick={() => toonForm = false}><span style="color:white;font-weight:800;font-size:1.1rem;">{E.X}</span></button>
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
    background: #1a5276;
    color: white;
    font-size: 28px;
    font-weight: 300;
    border: none;
    box-shadow: 0 4px 14px rgba(26,82,118,0.4);
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
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    max-height: min(76dvh, 540px);
    overflow: auto;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
    z-index: 140;
    animation: slideUp 0.2s ease-out;
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
    }
  }
</style>
