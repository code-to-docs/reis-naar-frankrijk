<script>
  import { onMount } from 'svelte';
  import {
    collection, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, serverTimestamp
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { gebruiker } from '$lib/stores.js';

  let {
    titel = '',
    emoji = '',
    collectie = '',
    afvinkbaar = false,
    metLink = false,
    placeholder = 'Nieuw item...'
  } = $props();

  let items = $state([]);
  let nieuwItem = $state('');
  let extraVeld = $state('');
  let linkVeld = $state('');
  let toonForm = $state(false);
  let unsubscribe;

  let aantalGedaan = $derived(items.filter(i => i.gedaan).length);

  onMount(() => {
    unsubscribe = onSnapshot(collection(db, collectie), (snapshot) => {
      items = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.datum?.seconds || 0) - (b.datum?.seconds || 0));
    });
    return () => unsubscribe?.();
  });

  async function voegToe() {
    if (!nieuwItem.trim()) return;
    const data = {
      naam: nieuwItem.trim(),
      door: $gebruiker,
      datum: serverTimestamp()
    };
    if (afvinkbaar) data.gedaan = false;
    if (extraVeld.trim()) data.notities = extraVeld.trim();
    if (linkVeld.trim()) data.mapsLink = linkVeld.trim();
    await addDoc(collection(db, collectie), data);
    nieuwItem = '';
    extraVeld = '';
    linkVeld = '';
    toonForm = false;
  }

  async function toggle(item) {
    await updateDoc(doc(db, collectie, item.id), {
      gedaan: !item.gedaan,
      afgevinktDoor: $gebruiker
    });
  }

  async function verwijder(id) {
    if (confirm('Verwijderen?')) {
      await deleteDoc(doc(db, collectie, id));
    }
  }
</script>

<div style="padding:16px;">
  <h2>{emoji} {titel}</h2>

  {#if afvinkbaar}
    <p style="color:#666;">{aantalGedaan}/{items.length} gedaan</p>
    <div class="progress-bar">
      <div class="progress-fill" style="
        width:{items.length ? (aantalGedaan/items.length)*100 : 0}%;
        background:var(--groen);">
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
      <div style="flex:1;">
        <strong>{item.naam}</strong>
        {#if item.notities}
          <p style="color:#666;font-size:14px;margin:2px 0;">{item.notities}</p>
        {/if}
        {#if item.mapsLink}
          <a href={item.mapsLink} target="_blank" rel="noopener noreferrer"
            style="display:inline-flex;align-items:center;gap:4px;
              color:#1a73e8;font-size:13px;text-decoration:none;
              background:#e8f0fe;padding:4px 10px;border-radius:12px;
              margin-top:4px;">
            🗺️ Open in Maps
          </a>
        {/if}
        <small style="color:#999;display:block;margin-top:2px;">({item.door})</small>
      </div>
      <button style="background:none;font-size:16px;padding:4px;"
        onclick={() => verwijder(item.id)}>🗑️</button>
    </div>
  {/each}

  {#if items.length === 0}
    <p style="text-align:center;color:#999;margin:32px 0;">
      Nog niets toegevoegd
    </p>
  {/if}

  {#if toonForm}
    <div class="card">
      <form onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
        <input bind:value={nieuwItem} placeholder={placeholder} />
        {#if metLink}
          <input bind:value={linkVeld} type="url"
            placeholder="Google Maps link (optioneel)" />
        {/if}
        <textarea bind:value={extraVeld}
          placeholder="Notities (optioneel)" rows="2"></textarea>
        <div style="display:flex;gap:8px;">
          <button type="submit" class="btn-success" style="flex:1;">
            ✅ Opslaan
          </button>
          <button type="button" class="btn-danger"
            onclick={() => toonForm = false}>✕</button>
        </div>
      </form>
    </div>
  {:else}
    <button class="btn-primary"
      style="width:calc(100% - 32px);margin:16px;padding:14px;font-size:18px;"
      onclick={() => toonForm = true}>
      + Toevoegen
    </button>
  {/if}
</div>