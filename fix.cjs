const fs = require('fs');
const path = require('path');

function maakBestand(filepath, content) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content.trim() + '\n');
  console.log('✅ ' + filepath);
}

console.log('🔧 Svelte 5 fix + namen aanpassen...\n');

// ============================================
// src/lib/components/Navigation.svelte
// ============================================
maakBestand('src/lib/components/Navigation.svelte', `
<script>
  import { activePagina } from '$lib/stores.js';
  const paginas = [
    { id: 'home',     emoji: '🏠', label: 'Home' },
    { id: 'campings', emoji: '🏕️', label: 'Campings' },
    { id: 'poi',      emoji: '📍', label: 'POIs' },
    { id: 'budget',   emoji: '💰', label: 'Budget' },
    { id: 'meer',     emoji: '☰',  label: 'Meer' },
  ];
</script>

<nav class="nav-bar">
  {#each paginas as p}
    <button class="nav-item" class:active={$activePagina === p.id}
      onclick={() => activePagina.set(p.id)}>
      <span class="emoji">{p.emoji}</span>{p.label}
    </button>
  {/each}
</nav>
`);

// ============================================
// src/lib/components/GedeeldeLijst.svelte
// ============================================
maakBestand('src/lib/components/GedeeldeLijst.svelte', `
<script>
  import { onMount } from 'svelte';
  import {
    collection, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, serverTimestamp
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { gebruiker } from '$lib/stores.js';

  let { titel = '', emoji = '', collectie = '', afvinkbaar = false, placeholder = 'Nieuw item...' } = $props();

  let items = $state([]);
  let nieuwItem = $state('');
  let extraVeld = $state('');
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
    await addDoc(collection(db, collectie), data);
    nieuwItem = '';
    extraVeld = '';
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
          <p style="color:#666;font-size:14px;">{item.notities}</p>
        {/if}
        <small style="color:#999;">({item.door})</small>
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
`);

// ============================================
// src/lib/components/Budget.svelte
// ============================================
maakBestand('src/lib/components/Budget.svelte', `
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
`);

// ============================================
// src/lib/components/Noodinfo.svelte
// ============================================
maakBestand('src/lib/components/Noodinfo.svelte', `
<div style="padding:16px;">
  <h2>⚠️ Noodinfo</h2>
  <div class="card" style="background:#fee;border-left:4px solid var(--rood);">
    <h3>📞 Alarmnummers</h3>
    <p><a href="tel:112"><strong>112</strong></a> — Algemeen noodgeval</p>
    <p><a href="tel:15"><strong>15</strong></a> — SAMU (ambulance)</p>
    <p><a href="tel:18"><strong>18</strong></a> — Pompiers (brandweer)</p>
    <p><a href="tel:17"><strong>17</strong></a> — Gendarmerie (politie)</p>
  </div>
  <div class="card">
    <h3>🏥 Ziekenhuizen</h3>
    <p><strong>Lozère:</strong> CH Mende</p>
    <p><strong>Cantal:</strong> CH Aurillac / CH Saint-Flour</p>
    <p><strong>Ariège:</strong> CH Foix / CH Saint-Girons</p>
  </div>
  <div class="card">
    <h3>💊 Nachtapotheek</h3>
    <p>Bel <a href="tel:3237"><strong>3237</strong></a></p>
  </div>
  <div class="card">
    <h3>🏔️ Tips</h3>
    <ul style="list-style:none;padding:0;line-height:2;">
      <li>☀️ Factor 50 op hoogte!</li>
      <li>🌧️ Weer slaat snel om boven 1500m</li>
      <li>💧 Min. 2L water pp meenemen</li>
      <li>⛽ Tankstations zijn schaars!</li>
      <li>🛒 Supermarkten sluiten vaak om 19:00</li>
    </ul>
  </div>
</div>
`);

// ============================================
// src/routes/+layout.svelte
// ============================================
maakBestand('src/routes/+layout.svelte', `
<script>
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import { gebruiker } from '$lib/stores.js';

  let { children } = $props();
  let naam = $state('');

  if (typeof localStorage !== 'undefined') {
    naam = localStorage.getItem('naam') || '';
    if (naam) gebruiker.set(naam);
  }

  function kiesNaam(n) {
    naam = n;
    localStorage.setItem('naam', n);
    gebruiker.set(n);
  }
</script>

{#if !naam}
  <div class="kies-scherm">
    <h1 style="font-size:80px;">🇫🇷</h1>
    <h2>Reis naar Frankrijk</h2>
    <p>Wie ben je?</p>
    <div style="display:flex;gap:16px;margin-top:20px;">
      <button class="btn-primary" style="font-size:20px;padding:16px 32px;"
        onclick={() => kiesNaam('Franzi')}>🙋‍♀️ Franzi</button>
      <button class="btn-primary" style="font-size:20px;padding:16px 32px;"
        onclick={() => kiesNaam('Dennis')}>🙋‍♂️ Dennis</button>
    </div>
  </div>
{:else}
  {@render children()}
  <Navigation />
{/if}

<style>
  .kies-scherm {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; height:100vh; gap:16px;
  }
</style>
`);

// ============================================
// src/routes/+page.svelte
// ============================================
maakBestand('src/routes/+page.svelte', `
<script>
  import { activePagina, gebruiker } from '$lib/stores.js';
  import GedeeldeLijst from '$lib/components/GedeeldeLijst.svelte';
  import Budget from '$lib/components/Budget.svelte';
  import Noodinfo from '$lib/components/Noodinfo.svelte';

  const vertrekDatum = new Date('2025-07-14');
  const dagen = Math.ceil((vertrekDatum - new Date()) / 86400000);

  let meerPagina = $state('');
  const meerOpties = [
    { id:'activiteiten', emoji:'🎯', label:'Activiteiten' },
    { id:'gerechten',    emoji:'🍽️', label:'Gerechten' },
    { id:'paklijst',     emoji:'📋', label:'Paklijst' },
    { id:'dagboek',      emoji:'📓', label:'Dagboek' },
    { id:'noodinfo',     emoji:'⚠️', label:'Noodinfo' },
  ];

  $effect(() => {
    if ($activePagina !== 'meer') meerPagina = '';
  });
</script>

<div class="header">
  <h1>🇫🇷 Frankrijk</h1>
  {#if $activePagina === 'home'}
    <p>Hoi {$gebruiker}!</p>
  {/if}
</div>

{#if $activePagina === 'home'}
  <div class="card">
    <h2>{dagen > 0 ? \`🗓️ Nog \${dagen} dagen!\` :
         dagen === 0 ? '🎉 Vandaag!' : '🚗 We zijn onderweg!'}</h2>
    <p style="margin-top:8px;">Lozère → Cantal → Pyrénées Ariégeoises</p>
  </div>

{:else if $activePagina === 'campings'}
  <GedeeldeLijst titel="Campings" emoji="🏕️"
    collectie="campings" placeholder="Naam camping..." />

{:else if $activePagina === 'poi'}
  <GedeeldeLijst titel="Bezienswaardigheden" emoji="📍"
    collectie="pois" placeholder="Naam plek..." />

{:else if $activePagina === 'budget'}
  <Budget />

{:else if $activePagina === 'meer'}
  {#if !meerPagina}
    <div style="padding:16px;">
      <h2>Meer</h2>
      {#each meerOpties as o}
        <button class="card" style="width:100%;text-align:left;display:flex;
          align-items:center;gap:12px;cursor:pointer;"
          onclick={() => meerPagina = o.id}>
          <span style="font-size:28px;">{o.emoji}</span>
          <span style="font-size:18px;">{o.label}</span>
        </button>
      {/each}
      <button class="card" style="width:100%;text-align:left;color:var(--rood);"
        onclick={() => { localStorage.removeItem('naam'); location.reload(); }}>
        🚪 Uitloggen
      </button>
    </div>
  {:else}
    <button class="btn-primary" style="margin:16px;"
      onclick={() => meerPagina = ''}>← Terug</button>

    {#if meerPagina === 'activiteiten'}
      <GedeeldeLijst titel="Activiteiten" emoji="🎯"
        collectie="activiteiten" afvinkbaar={true}
        placeholder="Nieuwe activiteit..." />
    {:else if meerPagina === 'gerechten'}
      <GedeeldeLijst titel="Lokale Gerechten" emoji="🍽️"
        collectie="gerechten" afvinkbaar={true}
        placeholder="Nieuw gerecht..." />
    {:else if meerPagina === 'paklijst'}
      <GedeeldeLijst titel="Paklijst" emoji="📋"
        collectie="paklijst" afvinkbaar={true}
        placeholder="Nieuw item..." />
    {:else if meerPagina === 'dagboek'}
      <GedeeldeLijst titel="Dagboek" emoji="📓"
        collectie="dagboek" placeholder="Vandaag..." />
    {:else if meerPagina === 'noodinfo'}
      <Noodinfo />
    {/if}
  {/if}
{/if}
`);

console.log(`
========================================
ALLES GEFIXT!
========================================

Svelte 5 runes syntax - OK
Namen: Franzi en Dennis - OK

Run nu: npm run dev -- --port 3000
Open:   http://127.0.0.1:3000/
========================================
`);