<script>
  import { onMount } from "svelte";
  import {
    collection, onSnapshot, addDoc, deleteDoc,
    doc as firestoreDoc, serverTimestamp, setDoc
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { gebruiker, toonSnackbar } from "$lib/stores.js";
  import BudgetChart from "./BudgetChart.svelte";
  import BudgetForm from "./BudgetForm.svelte";
  import { E } from "$lib/emojis.js";

  const cats = [
    { id:"dining",       emoji:"\u{1F37D}\uFE0F", label:"Uit eten",     kleur:"#FF6B6B" },
    { id:"boodschappen", emoji:"\u{1F6D2}",          label:"Boodschappen", kleur:"#4ECDC4" },
    { id:"overnachting", emoji:"\u{1F3D5}\uFE0F", label:"Overnachting", kleur:"#45B7D1" },
    { id:"benzine",      emoji:"\u26FD",           label:"Benzine",      kleur:"#F9CA24" },
    { id:"tol",          emoji:"\u{1F6E3}\uFE0F", label:"Tol",          kleur:"#A29BFE" },
    { id:"uitjes",       emoji:"\u{1F3AF}",          label:"Uitjes",       kleur:"#FD79A8" },
    { id:"overig",       emoji:"\u{1F4E6}",          label:"Overig",       kleur:"#636E72" },
  ];

  let uitgaven = $state([]);
  let budget = $state(2500);
  let laatsteVerwijderd = $state(null);
  let undoTimer = null;
  let toonBudgetEdit = $state(false);
  let nieuwBudget = $state("");
  let unsubscribe;
  let unsubBudget;

  let filterPersoon = $state("alle");
  let filterCat = $state("alle");

  let totaal = $derived(uitgaven.reduce((sum, u) => sum + u.bedrag, 0));
  let resterend = $derived(budget - totaal);
  let percentage = $derived(budget > 0 ? Math.round((totaal / budget) * 100) : 0);

  let actieveCats = $derived(
    cats.filter(c => uitgaven.some(u => u.categorie === c.id))
  );

  let gefilterdeUitgaven = $derived(() => {
    let result = uitgaven;
    if (filterPersoon !== "alle") result = result.filter(u => u.door === filterPersoon);
    if (filterCat !== "alle") result = result.filter(u => u.categorie === filterCat);
    return result;
  });

  let gefilterdTotaal = $derived(() => gefilterdeUitgaven().reduce((sum, u) => sum + u.bedrag, 0));
  let isGefilterd = $derived(filterPersoon !== "alle" || filterCat !== "alle");

  const dagNamenVol = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
  const maandNamenVol = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];

  function getDagKey(timestamp) {
    if (!timestamp?.seconds) return "onbekend";
    const d = new Date(timestamp.seconds * 1000);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }

  function getDagLabel(dagKey) {
    if (dagKey === "onbekend") return "Onbekende datum";
    const nu = new Date();
    const vandaag = nu.getFullYear() + "-" + String(nu.getMonth()+1).padStart(2,"0") + "-" + String(nu.getDate()).padStart(2,"0");
    const gisteren = new Date(nu.getTime() - 86400000);
    const gisterenKey = gisteren.getFullYear() + "-" + String(gisteren.getMonth()+1).padStart(2,"0") + "-" + String(gisteren.getDate()).padStart(2,"0");
    if (dagKey === vandaag) return "Vandaag";
    if (dagKey === gisterenKey) return "Gisteren";
    const parts = dagKey.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]), 12, 0, 0);
    const naam = dagNamenVol[d.getDay()];
    return naam.charAt(0).toUpperCase() + naam.slice(1) + " " + d.getDate() + " " + maandNamenVol[d.getMonth()];
  }

  let gegroepeerdeUitgaven = $derived(() => {
    const items = gefilterdeUitgaven();
    const groepen = [];
    const groepMap = {};
    for (const u of items) {
      const key = getDagKey(u.datum);
      if (!groepMap[key]) {
        groepMap[key] = { key, label: getDagLabel(key), items: [], totaal: 0 };
        groepen.push(groepMap[key]);
      }
      groepMap[key].items.push(u);
      groepMap[key].totaal += u.bedrag;
    }
    return groepen;
  });

  function formatTijd(timestamp) {
    if (!timestamp?.seconds) return "";
    const d = new Date(timestamp.seconds * 1000);
    return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
  }

  function formatBedragGroot(n) {
    if (n >= 1000) {
      const str = Math.round(n).toString();
      return str.slice(0, -3) + "." + str.slice(-3);
    }
    return Math.round(n).toString();
  }

  let franziBetaald = $derived(uitgaven.filter(u => u.door === "Franzi").reduce((s,u) => s + u.bedrag, 0));
  let dennisBetaald = $derived(uitgaven.filter(u => u.door === "Dennis").reduce((s,u) => s + u.bedrag, 0));
  let verschil = $derived(Math.abs(franziBetaald - dennisBetaald) / 2);

  function resetFilters() { filterPersoon = "alle"; filterCat = "alle"; }

  async function slabudgetOp() {
    const val = parseFloat(nieuwBudget);
    if (!val || val <= 0) return;
    await setDoc(firestoreDoc(db, "instellingen", "budget"), { bedrag: val });
    toonBudgetEdit = false;
    nieuwBudget = "";
    toonSnackbar("Budget aangepast", "success", E.CHECK);
  }

  onMount(() => {
    unsubscribe = onSnapshot(collection(db, "uitgaven"), (snapshot) => {
      uitgaven = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.datum?.seconds || 0) - (a.datum?.seconds || 0));
    });
    unsubBudget = onSnapshot(firestoreDoc(db, "instellingen", "budget"), (snap) => {
      if (snap.exists()) {
        const val = snap.data().bedrag;
        if (val && val > 0) budget = val;
      }
    });
    return () => {
      unsubscribe?.();
      unsubBudget?.();
      if (undoTimer) clearTimeout(undoTimer);
    };
  });



  async function verwijder(id) {
    const item = uitgaven.find(u => u.id === id);
    if (!item) return;
    laatsteVerwijderd = { bedrag: item.bedrag, categorie: item.categorie, omschrijving: item.omschrijving, door: item.door, datum: item.datum };
    await deleteDoc(firestoreDoc(db, "uitgaven", id));
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => { laatsteVerwijderd = null; }, 5000);
  }

  async function ongedaanMaken() {
    if (!laatsteVerwijderd) return;
    await addDoc(collection(db, "uitgaven"), laatsteVerwijderd);
    laatsteVerwijderd = null;
    if (undoTimer) clearTimeout(undoTimer);
    toonSnackbar("Uitgave hersteld", "success", E.UNDO);
  }
</script>

<div class="budget-page">
  <div class="hero-card">
    <div class="hero-top">
      <BudgetChart {uitgaven} {budget} />
      <div class="hero-info">
        <div class="hero-label">Resterend</div>
        <div class="hero-bedrag" style="color:{resterend >= 0 ? '#10b981' : '#ef4444'}">
          {E.EURO}{formatBedragGroot(Math.abs(resterend))}
        </div>
        <div class="hero-sub">
          <span>van {E.EURO}{formatBedragGroot(budget)}</span>
          <button class="edit-budget-btn" onclick={() => { toonBudgetEdit = !toonBudgetEdit; nieuwBudget = String(budget); }}>{E.PEN}</button>
        </div>
        <div class="hero-bar">
          <div class="hero-bar-fill" style="
            width:{Math.min(percentage,100)}%;
            background:{percentage <= 70 ? '#10b981' : percentage <= 90 ? '#f59e0b' : '#ef4444'}">
          </div>
        </div>
        <div class="hero-uitgegeven">{E.EURO}{formatBedragGroot(totaal)} uitgegeven</div>
      </div>
    </div>
  </div>

  {#if toonBudgetEdit}
    <div class="card budget-edit-card">
      <div class="budget-edit-titel">Budget aanpassen</div>
      <form onsubmit={(e) => { e.preventDefault(); slabudgetOp(); }}>
        <div class="budget-edit-row">
          <input type="number" step="50" bind:value={nieuwBudget} placeholder="Nieuw budget" class="budget-edit-input" />
          <button type="submit" class="btn-success budget-edit-save"><span style="color:white;font-weight:800;font-size:1.1rem;">OK</span></button>
          <button type="button" class="btn-danger budget-edit-cancel" onclick={() => toonBudgetEdit = false}><span style="color:white;font-weight:800;font-size:1.1rem;">X</span></button>
        </div>
      </form>
    </div>
  {/if}

  {#if laatsteVerwijderd}
    <div class="undo-bar">
      <span>Uitgave verwijderd</span>
      <button class="undo-btn" onclick={ongedaanMaken}>{E.UNDO} Ongedaan maken</button>
    </div>
  {/if}

  {#if uitgaven.length > 0}
    <div class="entries-header">
      <h3>Uitgaven ({uitgaven.length})</h3>
    </div>

    <div class="filter-section">
      <div class="filter-pills">
        <button class="pill" class:active={filterPersoon === "alle"} onclick={() => filterPersoon = "alle"}>Alle</button>
        <button class="pill" class:active={filterPersoon === "Dennis"} onclick={() => filterPersoon = "Dennis"}>Dennis</button>
        <button class="pill" class:active={filterPersoon === "Franzi"} onclick={() => filterPersoon = "Franzi"}>Franzi</button>
      </div>
      {#if actieveCats.length > 1}
        <div class="filter-pills cat-pills">
          <button class="pill cat-pill" class:active={filterCat === "alle"} onclick={() => filterCat = "alle"}>Alle</button>
          {#each actieveCats as ac}
            <button class="pill cat-pill" class:active={filterCat === ac.id} onclick={() => filterCat = ac.id} title={ac.label}>{ac.emoji}</button>
          {/each}
        </div>
      {/if}
    </div>

    {#if isGefilterd}
      <div class="filter-info">
        <span>{E.ZOEK} {gefilterdeUitgaven().length} resultaten — {E.EURO}{gefilterdTotaal().toFixed(2)}</span>
        <button class="filter-reset" onclick={resetFilters}>{E.KRUIS} Reset</button>
      </div>
    {/if}

    {#each gegroepeerdeUitgaven() as groep (groep.key)}
      <div class="dag-groep">
        <div class="dag-header">
          <span class="dag-label">{E.KALENDER} {groep.label}</span>
          <span class="dag-totaal">{E.EURO}{groep.totaal.toFixed(2)}</span>
        </div>
        {#each groep.items as u (u.id)}
          <div class="entry-item">
            <span class="entry-emoji">{cats.find(c => c.id === u.categorie)?.emoji || E.LEEG}</span>
            <div class="entry-info">
              <strong>{u.omschrijving}</strong>
              <small>{u.door} {formatTijd(u.datum)}</small>
            </div>
            <strong class="entry-bedrag">{E.EURO}{u.bedrag.toFixed(2)}</strong>
            <button class="entry-delete" onclick={() => verwijder(u.id)}>{E.PRULLENBAK}</button>
          </div>
        {/each}
      </div>
    {/each}

    {#if gefilterdeUitgaven().length === 0 && isGefilterd}
      <div class="empty-state">
        <span class="empty-icon">{E.ZOEK}</span>
        <p>Geen uitgaven voor dit filter</p>
      </div>
    {/if}

    <div class="card verrekening-card">
      <h3>{E.HANDDRUK} Verrekening</h3>
      <div class="budget-rij">
        <span>Franzi betaald</span>
        <strong>{E.EURO}{franziBetaald.toFixed(2)}</strong>
      </div>
      <div class="budget-rij">
        <span>Dennis betaald</span>
        <strong>{E.EURO}{dennisBetaald.toFixed(2)}</strong>
      </div>
      <hr class="verrekening-lijn" />
      {#if franziBetaald > dennisBetaald}
        <div class="verrekening-resultaat">
          <span>Dennis {E.PIJL} Franzi</span>
          <strong>{E.EURO}{verschil.toFixed(2)}</strong>
        </div>
      {:else if dennisBetaald > franziBetaald}
        <div class="verrekening-resultaat">
          <span>Franzi {E.PIJL} Dennis</span>
          <strong>{E.EURO}{verschil.toFixed(2)}</strong>
        </div>
      {:else}
        <div class="verrekening-resultaat quitte">
          <span>{E.CHECK} Quitte!</span>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <span class="empty-icon">{E.LEEG}</span>
      <p>Nog geen uitgaven toegevoegd</p>
    </div>
  {/if}

  <div style="height:90px;"></div>
</div>

<BudgetForm {cats} />

<style>
  .budget-page { padding: 16px; }

  .hero-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .hero-info { flex: 1; }
  .hero-label {
    font-size: 0.8rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .hero-bedrag {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    margin: 2px 0 4px 0;
  }
  .hero-sub {
    font-size: 0.8rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .edit-budget-btn {
    background: none;
    border: none;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 2px 4px;
    opacity: 0.6;
  }
  .edit-budget-btn:active { opacity: 1; }
  .hero-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    margin: 8px 0 6px 0;
    overflow: hidden;
  }
  .hero-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }
  .hero-uitgegeven {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .budget-edit-card {
    margin-bottom: 12px;
    padding: 14px;
  }
  .budget-edit-titel {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 8px;
    color: #1e293b;
  }
  .budget-edit-row {
    display: flex;
    gap: 8px;
  }
  .budget-edit-input {
    flex: 1;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 1rem;
  }
  .budget-edit-save, .budget-edit-cancel {
    padding: 8px 14px;
    font-size: 1rem;
    border-radius: 8px;
  }

  .undo-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e293b;
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    font-size: 0.9rem;
    animation: slideUp 0.25s ease-out;
  }
  .undo-btn {
    background: rgba(255,255,255,0.15);
    color: #60a5fa;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
  .undo-btn:active { opacity: 0.7; }
  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .filter-section { margin-bottom: 12px; }
  .filter-pills { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .pill {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .pill:active { transform: scale(0.96); }
  .pill.active { background: #1a5276; color: white; border-color: #1a5276; }
  .cat-pills { gap: 5px; }
  .cat-pill { padding: 5px 10px; font-size: 1rem; min-width: 38px; text-align: center; }
  .filter-info {
    display: flex; justify-content: space-between; align-items: center;
    background: #EBF5FB; padding: 8px 12px; border-radius: 10px;
    margin-bottom: 10px; font-size: 0.82rem; color: #1a5276;
  }
  .filter-reset { background: none; border: none; color: #e74c3c; font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 2px 8px; }

  .dag-groep { margin-bottom: 16px; }
  .dag-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 4px 6px 4px; border-bottom: 2px solid #e2e8f0; margin-bottom: 6px;
  }
  .dag-label { font-weight: 700; font-size: 0.85rem; color: #1a5276; }
  .dag-totaal {
    font-weight: 600; font-size: 0.85rem; color: #475569;
    background: #f1f5f9; padding: 3px 10px; border-radius: 8px;
  }

  .entries-header { margin: 16px 0 8px 0; }
  .entries-header h3 { font-size: 1rem; color: #475569; margin: 0; }
  .entry-item {
    display: flex; align-items: center; gap: 10px;
    background: white; border-radius: 12px; padding: 12px;
    margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .entry-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .entry-info { flex: 1; min-width: 0; }
  .entry-info strong { display: block; font-size: 0.9rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .entry-info small { color: #94a3b8; font-size: 0.75rem; }
  .entry-bedrag { font-size: 0.95rem; color: #1e293b; white-space: nowrap; flex-shrink: 0; }
  .entry-delete { background: none; border: none; font-size: 0.9rem; padding: 4px; cursor: pointer; opacity: 0.5; flex-shrink: 0; }
  .entry-delete:active { opacity: 1; }

  .empty-state { text-align: center; padding: 32px 16px; color: #94a3b8; }
  .empty-icon { font-size: 2.5rem; }
  .empty-state p { margin-top: 8px; font-size: 0.95rem; }

  .budget-rij { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
  .verrekening-card { margin-top: 20px; border-top: 3px solid #e2e8f0; }
  .verrekening-lijn { border: none; border-top: 1px solid #e2e8f0; margin: 8px 0; }
  .verrekening-resultaat { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 1rem; }
  .verrekening-resultaat.quitte { justify-content: center; color: var(--groen); }


</style>