<script lang="ts">
  import { onMount } from 'svelte';
  import {
    collection, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, serverTimestamp, query, orderBy
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { appState, toonSnackbar } from '$lib/stores.svelte.js';
  import { E } from '$lib/emojis.js';

  let {
    titel = '',
    emoji = '',
    collectie = '',
    afvinkbaar = false,
    metLink = false,
    placeholder = 'Nieuw item...'
  } = $props();

  let items: any[] = $state([]);
  let nieuwItem = $state('');
  let extraVeld = $state('');
  let linkVeld = $state('');
  let toonForm = $state(false);
  let unsubscribe: (() => void) | undefined;

  let aantalGedaan = $derived(items.filter(i => i.gedaan).length);

  function mapItems(snapshot: any, sorteerClientSide = false) {
    const mapped = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as any));
    if (sorteerClientSide) {
      mapped.sort((a: any, b: any) => (a.datum?.seconds || 0) - (b.datum?.seconds || 0));
    }
    items = mapped;
  }

  onMount(() => {
    const ref = collection(db, collectie);
    const sorted = query(ref, orderBy("datum", "asc"));

    unsubscribe = onSnapshot(
      sorted,
      (snapshot) => mapItems(snapshot, false),
      () => {
        unsubscribe?.();
        unsubscribe = onSnapshot(ref, (snapshot) => mapItems(snapshot, true));
      }
    );

    return () => unsubscribe?.();
  });

  async function voegToe() {
    if (!nieuwItem.trim()) return;
    const data: any = {
      naam: nieuwItem.trim(),
      door: appState.gebruiker,
      datum: serverTimestamp()
    };
    if (afvinkbaar) data.gedaan = false;
    if (extraVeld.trim()) data.notities = extraVeld.trim();
    if (metLink && linkVeld.trim()) data.mapsLink = linkVeld.trim();
    try {
      await addDoc(collection(db, collectie), data);
      nieuwItem = '';
      extraVeld = '';
      linkVeld = '';
      toonForm = false;
      toonSnackbar("Opgeslagen", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Fout bij opslaan", "error", E.KRUIS);
    }
  }

  async function toggle(item: any) {
    try {
      await updateDoc(doc(db, collectie, item.id), {
        gedaan: !item.gedaan,
        afgevinktDoor: appState.gebruiker
      });
    } catch (e) {
      console.error(e);
      toonSnackbar("Actie mislukt", "error", E.KRUIS);
    }
  }

  async function verwijder(id: string) {
    if (confirm('Verwijderen?')) {
      try {
        await deleteDoc(doc(db, collectie, id));
        toonSnackbar("Verwijderd", "success", E.PRULLENBAK);
      } catch (e) {
        console.error(e);
        toonSnackbar("Actie mislukt", "error", E.KRUIS);
      }
    }
  }
</script>

<div class="gl-container">
  <h2>{emoji} {titel}</h2>

  {#if afvinkbaar}
    <p class="gl-voortgang">{aantalGedaan}/{items.length} gedaan</p>
    <div class="progress-bar">
      <div class="progress-fill" style="width:{items.length ? (aantalGedaan/items.length)*100 : 0}%">
        {items.length ? Math.round((aantalGedaan/items.length)*100) : 0}%
      </div>
    </div>
  {/if}

  {#each items as item (item.id)}
    <div class="checklist-item" class:gedaan={item.gedaan}>
      {#if afvinkbaar}
        <input type="checkbox" checked={item.gedaan}
          onchange={() => toggle(item)} />
      {/if}
      <div class="gl-item-content">
        <strong>{item.naam}</strong>
        {#if item.notities}
          <p class="gl-notitie">{item.notities}</p>
        {/if}
        {#if item.mapsLink}
          <a href={item.mapsLink} target="_blank" rel="noopener noreferrer" class="gl-maps-link">
            {E.PIN} Open in Maps
          </a>
        {/if}
        <small class="gl-meta">({item.door})</small>
      </div>
      <button class="gl-delete" onclick={() => verwijder(item.id)}>{E.PRULLENBAK}</button>
    </div>
  {/each}

  {#if items.length === 0}
    <p class="gl-leeg">
      Nog niets toegevoegd
    </p>
  {/if}

  {#if toonForm}
    <div class="card">
      <form onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
        <input bind:value={nieuwItem} placeholder={placeholder} />
        {#if metLink}
          <input bind:value={linkVeld} type="url" placeholder="Google Maps link (optioneel)" />
        {/if}
        <textarea bind:value={extraVeld} placeholder="Notities (optioneel)" rows="2"></textarea>
        <div class="gl-form-actions">
          <button type="submit" class="btn-success gl-submit">
            {E.CHECK} Opslaan
          </button>
          <button type="button" class="btn-danger gl-cancel" onclick={() => toonForm = false}>{E.X}</button>
        </div>
      </form>
    </div>
  {:else}
    <button class="btn-primary gl-add-btn" onclick={() => toonForm = true}>
      + Toevoegen
    </button>
  {/if}
</div>

<style>
  .gl-container { padding: 0; }
  .gl-voortgang { color: var(--nav-text); margin-bottom: 4px; font-size: 0.9rem; }
  .progress-fill { background: var(--groen); }
  .gl-item-content { flex: 1; min-width: 0; }
  .gl-notitie { color: var(--nav-text); font-size: 14px; margin: 2px 0; }
  .gl-maps-link {
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--blauw); font-size: 13px; text-decoration: none;
    background: var(--hover-bg); padding: 4px 10px; border-radius: 12px;
    margin-top: 4px; border: 1px solid var(--border-subtle);
  }
  .gl-maps-link:active { opacity: 0.8; }
  .gl-meta { color: var(--nav-text); display: block; margin-top: 2px; }
  .gl-delete { background: none; font-size: 18px; padding: 6px; cursor: pointer; border: none; opacity: 0.7; }
  .gl-delete:active { opacity: 1; }
  .gl-leeg { text-align: center; color: var(--nav-text); margin: 32px 0; }
  .gl-form-actions { display: flex; gap: 8px; }
  .gl-submit { flex: 1; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .gl-cancel { display: flex; align-items: center; justify-content: center; font-weight: bold; width: 48px; }
  .gl-add-btn { width: 100%; margin-top: 12px; padding: 14px; font-size: 18px; font-weight: 600; }
</style>
