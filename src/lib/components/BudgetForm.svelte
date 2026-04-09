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
  <button class="fab" onclick={() => toonForm = true}>+</button>
{/if}

<style>
  .fab {
    position: fixed;
    bottom: 80px;
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
    z-index: 50;
    transition: transform 0.15s ease;
  }
  .fab:active { transform: scale(0.92); }

  .fab-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 60;
  }
  .fab-form {
    position: fixed;
    bottom: 70px;
    left: 16px;
    right: 16px;
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    z-index: 70;
    animation: slideUp 0.2s ease-out;
  }
</style>
