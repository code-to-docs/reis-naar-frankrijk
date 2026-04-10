<script lang="ts">
  import { onMount } from "svelte";
  import {
    collection, onSnapshot, addDoc, deleteDoc, query, orderBy,
    doc as firestoreDoc, setDoc, type Unsubscribe, type DocumentData, type QuerySnapshot
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import BudgetForm from "./BudgetForm.svelte";
  import BudgetHeroCard from "./budget/BudgetHeroCard.svelte";
  import BudgetFilters from "./budget/BudgetFilters.svelte";
  import BudgetEntriesList from "./budget/BudgetEntriesList.svelte";
  import BudgetSettlementCard from "./budget/BudgetSettlementCard.svelte";
  import { budgetCategorieen as cats } from "$lib/budgetCategories.js";
  import { E } from "$lib/emojis.js";
  import { 
    formatEuro, parseLocalizedNumber
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
  let gefilterdTotaalLabel = $derived.by(() => formatEuro(gefilterdTotaal));

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
  <BudgetHeroCard
    {uitgaven}
    {budget}
    {totaal}
    {resterend}
    {percentage}
    onToggleBudgetEdit={() => {
      toonBudgetEdit = !toonBudgetEdit;
      nieuwBudget = String(budget);
    }}
  />

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
            class="input budget-edit-input"
          />
          <button type="submit" class="btn-success budget-edit-save">OK</button>
          <button
            type="button"
            class="btn-danger btn-icon budget-edit-cancel"
            aria-label="Annuleer budget bewerken"
            onclick={() => toonBudgetEdit = false}
          >
            X
          </button>
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
    <BudgetFilters
      {filterPersoon}
      {filterCat}
      {actieveCats}
      {isGefilterd}
      resultaatTeller={gefilterdeUitgaven.length}
      {gefilterdTotaalLabel}
      onSetPersoon={(value) => (filterPersoon = value)}
      onSetCat={(value) => (filterCat = value)}
      onReset={resetFilters}
    />

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
    padding: var(--padding-input);
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
    background: var(--bg-surface-raised);
    color: var(--text-primary);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    font-size: var(--text-sm);
    border: 1px solid var(--border-accent);
    animation: fadeSlideIn var(--duration-normal) var(--ease-out);
  }
  .undo-btn {
    min-height: var(--btn-height-compact);
    background: var(--bg-accent-subtle);
    color: var(--text-accent);
    border: 1px solid var(--border-accent);
    padding: 0 var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    cursor: pointer;
    transition: transform var(--duration-fast) var(--ease-default);
  }
  .undo-btn:active { opacity: 0.7; }
  @keyframes slideUp {
    from { transform: translateY(var(--space-2-5)); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .budget-content-grid {
    display: grid;
    gap: var(--space-4);
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



