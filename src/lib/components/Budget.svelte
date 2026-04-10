<script lang="ts">
  import { onMount } from "svelte";
  import {
    collection, onSnapshot, addDoc, deleteDoc, query, orderBy,
    doc as firestoreDoc, setDoc, type Unsubscribe, type DocumentData, type QuerySnapshot
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import BudgetChart from "./BudgetChart.svelte";
  import BudgetForm from "./BudgetForm.svelte";
  import BudgetEntriesList from "./budget/BudgetEntriesList.svelte";
  import BudgetSettlementCard from "./budget/BudgetSettlementCard.svelte";
  import { budgetCategorieen as cats } from "$lib/budgetCategories.js";
  import { E } from "$lib/emojis.js";
  import { 
    formatEuro, formatEuroGroot, parseLocalizedNumber
  } from "$lib/utils/formatters.js";
  import {
    mapUitgavenSnapshot,
    groepeerUitgaven,
    berekenVerrekening,
    type UitgaveItem
  } from "$lib/utils/budget";

  type HerstelbareUitgave = Omit<UitgaveItem, "id"> | null;

  let uitgaven = $state<UitgaveItem[]>([]);
  let budget = $state(2500);
  let laatsteVerwijderd = $state<HerstelbareUitgave>(null);
  let undoTimer: ReturnType<typeof setTimeout> | null = null;
  let toonBudgetEdit = $state(false);
  let nieuwBudget = $state("");
  let unsubscribe: Unsubscribe | undefined;
  let unsubBudget: Unsubscribe | undefined;

  let filterPersoon = $state("alle");
  let filterCat = $state("alle");

  let totaal = $derived(uitgaven.reduce((sum, u) => sum + (Number(u.bedrag) || 0), 0));
  let resterend = $derived(budget - totaal);
  let percentage = $derived(budget > 0 ? Math.round((totaal / budget) * 100) : 0);

  let actieveCats = $derived(cats.filter((c) => uitgaven.some((u) => u.categorie === c.id)));

  let gefilterdeUitgaven = $derived.by(() => {
    let result = uitgaven;
    if (filterPersoon !== "alle") result = result.filter((u) => u.door === filterPersoon);
    if (filterCat !== "alle") result = result.filter((u) => u.categorie === filterCat);
    return result;
  });

  let gefilterdTotaal = $derived.by(() => gefilterdeUitgaven.reduce((sum, u) => sum + (Number(u.bedrag) || 0), 0));
  let isGefilterd = $derived(filterPersoon !== "alle" || filterCat !== "alle");

  let gegroepeerdeUitgaven = $derived.by(() => {
    return groepeerUitgaven(gefilterdeUitgaven);
  });

  let { franziBetaald, dennisBetaald, verschil } = $derived.by(() => berekenVerrekening(uitgaven));

  function resetFilters() {
    filterPersoon = "alle";
    filterCat = "alle";
  }

  async function slabudgetOp() {
    const val = parseLocalizedNumber(nieuwBudget);
    if (!Number.isFinite(val) || val <= 0) {
      toonSnackbar("Vul een geldig budgetbedrag in", "warning", E.WARN);
      return;
    }
    try {
      await setDoc(
        firestoreDoc(db, "instellingen", "budget"),
        { bedrag: Number(val.toFixed(2)) },
        { merge: true }
      );
      toonBudgetEdit = false;
      nieuwBudget = "";
      toonSnackbar("Budget aangepast", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Gefaald om budget aan te passen", "error", E.KRUIS);
    }
  }

  onMount(() => {
    const uitgavenRef = collection(db, "uitgaven");
    const sortedQuery = query(uitgavenRef, orderBy("datum", "desc"));
    const onData = (snapshot: QuerySnapshot<DocumentData>) => {
      uitgaven = mapUitgavenSnapshot(snapshot);
    };

    unsubscribe = onSnapshot(
      sortedQuery,
      onData,
      (error) => {
        console.warn("Gesorteerde query mislukt, fallback naar client-side sortering.", error);
        unsubscribe?.();
        unsubscribe = onSnapshot(uitgavenRef, onData);
      }
    );

    unsubBudget = onSnapshot(firestoreDoc(db, "instellingen", "budget"), (snap) => {
      if (!snap.exists()) return;
      const val = Number(snap.data().bedrag);
      if (Number.isFinite(val) && val > 0) budget = val;
    });

    return () => {
      unsubscribe?.();
      unsubBudget?.();
      if (undoTimer) clearTimeout(undoTimer);
    };
  });

  async function verwijder(id: string) {
    const item = uitgaven.find((u) => u.id === id);
    if (!item) return;

    laatsteVerwijderd = {
      bedrag: item.bedrag,
      categorie: item.categorie,
      omschrijving: item.omschrijving,
      door: item.door,
      datum: item.datum
    };

    try {
      await deleteDoc(firestoreDoc(db, "uitgaven", id));
      if (undoTimer) clearTimeout(undoTimer);
      undoTimer = setTimeout(() => {
        laatsteVerwijderd = null;
      }, 5000);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon niet verwijderen", "error", E.KRUIS);
      laatsteVerwijderd = null;
    }
  }

  async function ongedaanMaken() {
    if (!laatsteVerwijderd) return;
    try {
      await addDoc(collection(db, "uitgaven"), laatsteVerwijderd);
      laatsteVerwijderd = null;
      if (undoTimer) clearTimeout(undoTimer);
      toonSnackbar("Uitgave hersteld", "success", E.UNDO);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon niet herstellen", "error", E.KRUIS);
    }
  }
</script>

<div class="budget-page">
  <div class="hero-card">
    <div class="hero-top">
      <BudgetChart {uitgaven} {budget} />
      <div class="hero-info">
        <div class="hero-label">Resterend</div>
        <div class="hero-bedrag" style="color:{resterend >= 0 ? 'var(--groen)' : 'var(--rood)'}">
          {resterend < 0 ? '-' : ''}{formatEuroGroot(Math.abs(resterend))}
        </div>
        <div class="hero-sub">
          <span>van {formatEuroGroot(budget)}</span>
          <button class="edit-budget-btn" onclick={() => { toonBudgetEdit = !toonBudgetEdit; nieuwBudget = String(budget); }}>{E.PEN}</button>
        </div>
        <div class="hero-bar">
          <div class="hero-bar-fill" style="
            width:{Math.min(percentage,100)}%;
            background:{percentage <= 70 ? 'var(--groen)' : percentage <= 90 ? 'var(--oranje)' : 'var(--rood)'}">
          </div>
        </div>
        <div class="hero-uitgegeven">{formatEuroGroot(totaal)} uitgegeven</div>
      </div>
    </div>
  </div>

  {#if toonBudgetEdit}
    <div class="card budget-edit-card">
      <div class="budget-edit-titel">Budget aanpassen</div>
      <form onsubmit={(e) => { e.preventDefault(); slabudgetOp(); }}>
        <div class="budget-edit-row">
          <input
            type="text"
            inputmode="decimal"
            bind:value={nieuwBudget}
            placeholder="Nieuw budget"
            class="budget-edit-input"
          />
          <button type="submit" class="btn-success budget-edit-save">OK</button>
          <button type="button" class="btn-danger btn-icon budget-edit-cancel" onclick={() => toonBudgetEdit = false}>X</button>
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
        <span>{E.ZOEK} {gefilterdeUitgaven.length} resultaten - {formatEuro(gefilterdTotaal)}</span>
        <button class="filter-reset" onclick={resetFilters}>{E.KRUIS} Reset</button>
      </div>
    {/if}

    <div class="budget-content-grid">
      <div class="budget-main-col">
        <BudgetEntriesList
          uitgavenCount={uitgaven.length}
          {gegroepeerdeUitgaven}
          {gefilterdeUitgaven}
          {isGefilterd}
          onDelete={verwijder}
        />
      </div>

      <aside class="budget-side-col">
        <BudgetSettlementCard {franziBetaald} {dennisBetaald} {verschil} />
      </aside>
    </div>
  {:else}
    <div class="empty-state">
      <span class="empty-icon">{E.LEEG}</span>
      <p>Nog geen uitgaven toegevoegd</p>
    </div>
  {/if}

  <div class="budget-bottom-spacer"></div>
</div>

<BudgetForm {cats} />

<style>
  .budget-page { padding: 0; }

  .hero-card {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    margin-bottom: var(--space-3);
    box-shadow: var(--shadow-md);
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }
  .hero-info { flex: 1; }
  .hero-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: var(--weight-semibold);
  }
  .hero-bedrag {
    font-size: var(--text-2xl);
    font-weight: var(--ui-weight-heavy);
    line-height: var(--leading-tight);
    margin: var(--space-1) 0 var(--space-1) 0;
  }
  .hero-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
  }
  .edit-budget-btn {
    background: color-mix(in srgb, var(--card-bg) 82%, var(--bg-accent-subtle));
    border: 1px solid color-mix(in srgb, var(--input-border) 80%, var(--border-default));
    font-size: var(--font-size-xs);
    cursor: pointer;
    min-height: var(--btn-height-compact);
    min-width: var(--btn-height-compact);
    padding: 0;
    opacity: 0.85;
    color: var(--blauw);
  }
  .edit-budget-btn:active { opacity: 1; }
  .hero-bar {
    height: var(--space-1-5);
    background: var(--bg-surface-sunken);
    border-radius: var(--radius-sm);
    margin: var(--space-2) 0 var(--space-1-5) 0;
    overflow: hidden;
  }
  .hero-bar-fill {
    height: 100%;
    border-radius: var(--radius-sm);
    transition: width var(--duration-slow) var(--ease-default);
  }
  .hero-uitgegeven {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .budget-edit-card {
    margin-bottom: var(--space-3);
    padding: var(--space-4);
  }
  .budget-edit-titel {
    font-weight: var(--weight-semibold);
    font-size: var(--text-sm);
    margin-bottom: var(--space-2);
    color: var(--heading);
  }
  .budget-edit-row {
    display: flex;
    gap: var(--space-2);
  }
  .budget-edit-input {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }
  .budget-edit-save, .budget-edit-cancel {
    font-size: var(--text-base);
  }

  .undo-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--color-neutral-800);
    color: var(--text-inverse);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    font-size: var(--text-sm);
    animation: slideUp 0.25s ease-out;
  }
  .undo-btn {
    min-height: var(--btn-height-compact);
    background: color-mix(in srgb, var(--bg-surface) 16%, transparent);
    color: var(--color-primary-100);
    border: 1px solid color-mix(in srgb, var(--bg-surface) 20%, transparent);
    padding: 0 var(--space-3);
    border-radius: var(--btn-radius);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    cursor: pointer;
  }
  .undo-btn:active { opacity: 0.7; }
  @keyframes slideUp {
    from { transform: translateY(var(--space-2-5)); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .filter-section { margin-bottom: var(--space-3); }
  .filter-pills { display: flex; gap: var(--space-1-5); margin-bottom: var(--space-2); flex-wrap: wrap; }
  .pill {
    padding: var(--space-1-5) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-medium);
    min-height: var(--touch-target-compact);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-default);
  }
  .pill:active { transform: scale(0.96); }
  .pill.active { background: var(--bg-accent); color: var(--text-inverse); border-color: var(--bg-accent); }
  .cat-pills { gap: var(--space-1); }
  .cat-pill { padding: var(--space-1) var(--space-2-5); font-size: var(--text-base); min-width: 38px; text-align: center; }
  .filter-info {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--bg-accent-subtle);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    margin-bottom: var(--space-2-5);
    font-size: var(--text-sm);
    color: var(--text-accent);
  }
  .filter-reset {
    background: color-mix(in srgb, var(--card-bg) 86%, var(--color-error-light));
    border: 1px solid color-mix(in srgb, var(--rood) 22%, var(--input-border));
    color: var(--rood);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    cursor: pointer;
    min-height: var(--btn-height-compact);
    padding: 0 var(--space-2-5);
    border-radius: var(--btn-radius);
  }

  .budget-content-grid {
    display: grid;
    gap: 14px;
    align-items: start;
  }
  .budget-main-col,
  .budget-side-col {
    min-width: 0;
  }

  .empty-state { text-align: center; padding: var(--space-8) var(--space-4); color: var(--text-tertiary); }
  .empty-icon { font-size: var(--text-3xl); }
  .empty-state p { margin-top: var(--space-2); font-size: var(--text-sm); }
  .budget-bottom-spacer {
    height: calc(var(--nav-height) + env(safe-area-inset-bottom, var(--space-2)) + var(--space-6));
  }

  @media (min-width: 980px) {
    .budget-content-grid {
      grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
      gap: var(--space-4);
    }
    .budget-side-col {
      position: sticky;
      top: var(--space-3);
    }
  }

</style>


