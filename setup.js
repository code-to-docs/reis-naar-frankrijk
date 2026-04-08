// ============================================
// 🇫🇷 SETUP SCRIPT — Reis naar Frankrijk App
// ============================================
// Voer uit met: node setup.js
// ============================================

const fs = require('fs');
const path = require('path');

function maakBestand(filepath, content) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content.trim() + '\n');
  console.log(`✅ ${filepath}`);
}

console.log('🇫🇷 Bestanden aanmaken...\n');

// ============================================
// src/lib/firebase.js
// ============================================
maakBestand('src/lib/firebase.js', `
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // ⬇️ PLAK HIER JOUW FIREBASE CONFIG ⬇️
  apiKey: "PLAK-HIER",
  authDomain: "PLAK-HIER",
  projectId: "PLAK-HIER",
  storageBucket: "PLAK-HIER",
  messagingSenderId: "PLAK-HIER",
  appId: "PLAK-HIER"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
`);

// ============================================
// src/lib/stores.js
// ============================================
maakBestand('src/lib/stores.js', `
import { writable } from 'svelte/store';
export const gebruiker = writable('');
export const activePagina = writable('home');
`);

// ============================================
// src/app.css
// ============================================
maakBestand('src/app.css', `
:root {
  --blauw: #002654;
  --wit: #ffffff;
  --grijs-licht: #f5f5f5;
  --grijs: #e0e0e0;
  --tekst: #333;
  --groen: #27ae60;
  --oranje: #f39c12;
  --rood: #e74c3c;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--grijs-licht);
  color: var(--tekst);
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 80px;
}
h1,h2,h3 { color: var(--blauw); }
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
button {
  border: none; border-radius: 8px;
  padding: 10px 16px; font-size: 16px; cursor: pointer;
}
button:active { transform: scale(0.95); }
.btn-primary { background: var(--blauw); color: white; }
.btn-danger { background: var(--rood); color: white; }
.btn-success { background: var(--groen); color: white; }
input, select, textarea {
  width: 100%; padding: 12px;
  border: 2px solid var(--grijs);
  border-radius: 8px; font-size: 16px; margin-bottom: 8px;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--blauw); outline: none;
}
.checklist-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-bottom: 1px solid var(--grijs);
}
.checklist-item.gedaan span {
  text-decoration: line-through; opacity: 0.5;
}
.checklist-item input[type="checkbox"] {
  width: 24px; height: 24px; margin: 0;
}
.progress-bar {
  width: 100%; height: 24px; background: var(--grijs);
  border-radius: 12px; overflow: hidden; margin: 8px 0;
}
.progress-fill {
  height: 100%; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 12px; font-weight: bold;
  transition: width 0.5s ease;
}
.nav-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; display: flex; justify-content: space-around;
  padding: 8px 0; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 100; max-width: 600px; margin: 0 auto;
}
.nav-item {
  display: flex; flex-direction: column; align-items: center;
  font-size: 10px; color: #999; background: none; padding: 4px 8px;
}
.nav-item.active { color: var(--blauw); }
.nav-item .emoji { font-size: 24px; margin-bottom: 2px; }
.header {
  background: var(--blauw); color: white;
  padding: 16px; text-align: center;
  position: sticky; top: 0; z-index: 99;
}
.add-form { display: flex; gap: 8px; padding: 12px 16px; }
.add-form input { flex: 1; margin: 0; }
`);

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
      on:click={() => activePagina.set(p.id)}>
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
  import { onMount, onDestroy } from 'svelte';
  import {
    collection, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, serverTimestamp
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { gebruiker } from '$lib/stores.js';

  export let titel = '';
  export let emoji = '';
  export let collectie = '';
  export let afvinkbaar = false;
  export let placeholder = 'Nieuw item...';

  let items = [];
  let nieuwItem = '';
  let extraVeld = '';
  let toonForm = false;
  let unsubscribe;

  onMount(() => {
    unsubscribe = onSnapshot(collection(db, collectie), (snapshot) => {
      items = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.datum?.seconds || 0) - (b.datum?.seconds || 0));
    });
  });

  onDestroy(() => unsubscribe?.());

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

  $: aantalGedaan = items.filter(i => i.gedaan).length;
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
          on:change={() => toggle(item)} />
      {/if}
      <div style="flex:1;">
        <strong>{item.naam}</strong>
        {#if item.notities}
          <p style="color:#666;font-size:14px;">{item.notities}</p>
        {/if}
        <small style="color:#999;">({item.door})</small>
      </div>
      <button style="background:none;font-size:16px;padding:4px;"
        on:click={() => verwijder(item.id)}>🗑️</button>
    </div>
  {/each}

  {#if items.length === 0}
    <p style="text-align:center;color:#999;margin:32px 0;">
      Nog niets toegevoegd
    </p>
  {/if}

  {#if toonForm}
    <div class="card">
      <form on:submit|preventDefault={voegToe}>
        <input bind:value={nieuwItem} placeholder={placeholder} />
        <textarea bind:value={extraVeld}
          placeholder="Notities (optioneel)" rows="2" />
        <div style="display:flex;gap:8px;">
          <button type="submit" class="btn-success" style="flex:1;">
            ✅ Opslaan
          </button>
          <button type="button" class="btn-danger"
            on:click={() => toonForm = false}>✕</button>
        </div>
      </form>
    </div>
  {:else}
    <button class="btn-primary"
      style="width:calc(100% - 32px);margin:16px;padding:14px;font-size:18px;"
      on:click={() => toonForm = true}>
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
  import { onMount, onDestroy } from 'svelte';
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

  let uitgaven = [];
  let bedrag = '';
  let categorie = 'dining';
  let omschrijving = '';
  let toonForm = false;
  let unsubscribe;

  onMount(() => {
    unsubscribe = onSnapshot(collection(db, 'uitgaven'), (snapshot) => {
      uitgaven = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.datum?.seconds || 0) - (a.datum?.seconds || 0));
    });
  });

  onDestroy(() => unsubscribe?.());

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

  $: totaal = uitgaven.reduce((sum, u) => sum + u.bedrag, 0);
  $: resterend = BUDGET - totaal;
  $: percentage = Math.round((totaal / BUDGET) * 100);
  $: perCat = cats.map(c => ({
    ...c,
    totaal: uitgaven
      .filter(u => u.categorie === c.id)
      .reduce((sum, u) => sum + u.bedrag, 0)
  })).filter(c => c.totaal > 0);

  // PAS NAMEN AAN hieronder!
  $: tomBetaald = uitgaven.filter(u => u.door === 'Tom').reduce((s,u) => s + u.bedrag, 0);
  $: lisaBetaald = uitgaven.filter(u => u.door === 'Lisa').reduce((s,u) => s + u.bedrag, 0);
  $: verschil = Math.abs(tomBetaald - lisaBetaald) / 2;
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
      <p>Tom: <strong>€{tomBetaald.toFixed(2)}</strong></p>
      <p>Lisa: <strong>€{lisaBetaald.toFixed(2)}</strong></p>
      <hr style="margin:8px 0;border-color:var(--grijs);" />
      {#if tomBetaald > lisaBetaald}
        <p>Lisa → Tom: <strong>€{verschil.toFixed(2)}</strong></p>
      {:else if lisaBetaald > tomBetaald}
        <p>Tom → Lisa: <strong>€{verschil.toFixed(2)}</strong></p>
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
        on:click={() => verwijder(u.id)}>🗑️</button>
    </div>
  {/each}

  {#if toonForm}
    <div class="card">
      <form on:submit|preventDefault={voegToe}>
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
            on:click={() => toonForm = false}>✕</button>
        </div>
      </form>
    </div>
  {:else}
    <button class="btn-primary"
      style="width:calc(100% - 32px);margin:16px;padding:14px;font-size:18px;"
      on:click={() => toonForm = true}>
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

  let naam = '';

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
        on:click={() => kiesNaam('Tom')}>🙋‍♂️ Tom</button>
      <button class="btn-primary" style="font-size:20px;padding:16px 32px;"
        on:click={() => kiesNaam('Lisa')}>🙋‍♀️ Lisa</button>
    </div>
  </div>
{:else}
  <slot />
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

  let meerPagina = '';
  const meerOpties = [
    { id:'activiteiten', emoji:'🎯', label:'Activiteiten' },
    { id:'gerechten',    emoji:'🍽️', label:'Gerechten' },
    { id:'paklijst',     emoji:'📋', label:'Paklijst' },
    { id:'dagboek',      emoji:'📓', label:'Dagboek' },
    { id:'noodinfo',     emoji:'⚠️', label:'Noodinfo' },
  ];

  $: if ($activePagina !== 'meer') meerPagina = '';
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
          on:click={() => meerPagina = o.id}>
          <span style="font-size:28px;">{o.emoji}</span>
          <span style="font-size:18px;">{o.label}</span>
        </button>
      {/each}
      <button class="card" style="width:100%;text-align:left;color:var(--rood);"
        on:click={() => { localStorage.removeItem('naam'); location.reload(); }}>
        🚪 Uitloggen
      </button>
    </div>
  {:else}
    <button class="btn-primary" style="margin:16px;"
      on:click={() => meerPagina = ''}>← Terug</button>

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

// ============================================
// static/manifest.json
// ============================================
maakBestand('static/manifest.json', `
{
  "name": "Reis naar Frankrijk",
  "short_name": "Frankrijk",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#002654",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
`);

// ============================================
// static/sw.js
// ============================================
maakBestand('static/sw.js', `
const CACHE_NAME = 'reis-v1';
const URLS_TO_CACHE = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
`);

// ============================================
// Update app.html met manifest + service worker
// ============================================
const appHtml = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#002654" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/icon-192.png" />
    <title>Reis naar Frankrijk 🇫🇷</title>
    %sveltekit.head%
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }
    <\/script>
  </head>
  <body data-sveltekit-prerender="true">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`;
maakBestand('src/app.html', appHtml);

// ============================================
// KLAAR!
// ============================================
console.log(`
========================================
🎉 ALLES IS AANGEMAAKT!
========================================

📋 Nog te doen:
1. Open src/lib/firebase.js
2. Plak daar je Firebase config
3. Pas de namen aan (Tom/Lisa → jullie namen)
4. Run: npm run dev
5. Open: http://localhost:5173

🚀 Veel plezier in Frankrijk!
========================================
`);