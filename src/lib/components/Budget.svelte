<script>
  import { onMount } from 'svelte';
  import {
    collection, onSnapshot, addDoc, deleteDoc,
    doc, serverTimestamp
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { gebruiker } from '$lib/stores.js';

  const BUDGET = 2500;

  const cats = [
    { id:'dining',       emoji:'🍽️', label:'Uit eten',     kleur:'#FF6B6B' },
    { id:'boodschappen', emoji:'🛒', label:'Boodschappen', kleur:'#4ECDC4' },
    { id:'overnachting', emoji:'🏕️', label:'Overnachting', kleur:'#45B7D1' },
    { id:'benzine',      emoji:'⛽', label:'Benzine',      kleur:'#F9CA24' },
    { id:'tol',          emoji:'🛣️', label:'Tol',          kleur:'#A29BFE' },
    { id:'uitjes',       emoji:'🎯', label:'Uitjes',       kleur:'#FD79A8' },
    { id:'overig',       emoji:'📦', label:'Overig',       kleur:'#636E72' },
  ];

  let uitgaven = $state([]);
  let bedrag = $state('');
  let categorie = $state('dining');
  let omschrijving = $state('');
  let toonForm = $state(false);
  let unsubscribe;

  let totaal = $derived(uitgaven.reduce((sum, u) => sum + u.bedrag, 0));
  let resterend = $derived(BUDGET - totaal);
  let percentage = $derived(Math.round((totaal / BUDGET) * 100));
  let perCat = $derived(cats.map(c => ({
    ...c,
    totaal: uitgaven
      .filter(u => u.categorie === c.id)
      .reduce((sum, u) => sum + u.bedrag, 0)
  })).filter(c => c.totaal > 0));

  let franziBetaald = $derived(uitgaven.filter(u => u.door === 'Franzi').reduce((s,u) => s + u.bedrag, 0));
  let dennisBetaald = $derived(uitgaven.filter(u => u.door === 'Dennis').reduce((s,u) => s + u.bedrag, 0));
  let verschil = $derived(Math.abs(franziBetaald - dennisBetaald) / 2);

  onMount(() => {
    unsubscribe = onSnapshot(collection(db, 'uitgaven'), (snapshot) => {
      uitgaven = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.datum?.seconds || 0) - (a.datum?.seconds || 0));
    });
    return () => unsubscribe?.();
  });

  async function voegToe() {
    if (!bedrag || !omschrijving.trim()) return;
    await addDoc(collection(db, 'uitgaven'), {
      bedrag: parseFloat(bedrag),
      categorie,
      omschrijving: omschrijving.trim(),
      door: $gebruiker,
      datum: serverTimestamp()
    });
    bedrag = '';
    omschrijving = '';
    toonForm = false;
  }

  async function verwijder(id) {
    if (confirm('Verwijderen?')) {
      await deleteDoc(doc(db, 'uitgaven', id));
    }
  }
</script>

<div style="padding:16px;">
  <h2>💰 Budget</h2>

  <div class="card">
    <div style="display:flex;justify-content:space-between;">
      <span>Begroot:</span><strong>€{BUDGET.toFixed(2)}</strong>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <span>Uitgegeven:</span><strong>€{totaal.toFixed(2)}</strong>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <span>Resterend:</span>
      <strong style="color:{resterend >= 0 ? 'var(--groen)' : 'var(--rood)'}">
        €{resterend.toFixed(2)}
      </strong>
    </div>
    <div class="progress-bar" style="margin-top:12px;">
      <div class="progress-fill" style="
        width:{Math.min(percentage,100)}%;
        background:{percentage <= 70 ? 'var(--groen)' :
                    percentage <= 90 ? 'var(--oranje)' : 'var(--rood)'};">
        {percentage}%
      </div>
    </div>
  </div>

  {#if perCat.length > 0}
    <div class="card">
      <h3>📊 Per categorie</h3>
      {#each perCat as c}
        <div style="margin:8px 0;">
          <div style="display:flex;justify-content:space-between;">
            <span>{c.emoji} {c.label}</span>
            <strong>€{c.totaal.toFixed(2)}</strong>
          </div>
          <div class="progress-bar" style="height:12px;">
            <div class="progress-fill" style="
              width:{(c.totaal/totaal)*100}%;
              background:{c.kleur};font-size:10px;">
              {Math.round((c.totaal/totaal)*100)}%
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if uitgaven.length > 0}
    <div class="card">
      <h3>🤝 Verrekening</h3>
      <p>Franzi: <strong>€{franziBetaald.toFixed(2)}</strong></p>
      <p>Dennis: <strong>€{dennisBetaald.toFixed(2)}</strong></p>
      <hr style="margin:8px 0;border-color:var(--grijs);" />
      {#if franziBetaald > dennisBetaald}
        <p>Dennis → Franzi: <strong>€{verschil.toFixed(2)}</strong></p>
      {:else if dennisBetaald > franziBetaald}
        <p>Franzi → Dennis: <strong>€{verschil.toFixed(2)}</strong></p>
      {:else}
        <p>✅ Quitte!</p>
      {/if}
    </div>
  {/if}

  {#each uitgaven.slice(0, 10) as u (u.id)}
    <div class="checklist-item">
      <span style="font-size:24px;">
        {cats.find(c => c.id === u.categorie)?.emoji || '📦'}
      </span>
      <div style="flex:1;">
        <strong>{u.omschrijving}</strong>
        <small style="color:#999;display:block;">{u.door}</small>
      </div>
      <strong>€{u.bedrag.toFixed(2)}</strong>
      <button style="background:none;font-size:14px;"
        onclick={() => verwijder(u.id)}>🗑️</button>
    </div>
  {/each}

  {#if toonForm}
    <div class="card">
      <form onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
        <input type="number" step="0.01" bind:value={bedrag} placeholder="€ Bedrag" />
        <select bind:value={categorie}>
          {#each cats as c}
            <option value={c.id}>{c.emoji} {c.label}</option>
          {/each}
        </select>
        <input bind:value={omschrijving} placeholder="Omschrijving" />
        <div style="display:flex;gap:8px;">
          <button type="submit" class="btn-success" style="flex:1;">✅ Opslaan</button>
          <button type="button" class="btn-danger"
            onclick={() => toonForm = false}>✕</button>
        </div>
      </form>
    </div>
  {:else}
    <button class="btn-primary"
      style="width:calc(100% - 32px);margin:16px;padding:14px;font-size:18px;"
      onclick={() => toonForm = true}>
      + Uitgave toevoegen
    </button>
  {/if}
</div>
