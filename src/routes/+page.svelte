<script>
  import { activePagina, gebruiker } from '$lib/stores.js';
  import GedeeldeLijst from '$lib/components/GedeeldeLijst.svelte';
  import Budget from '$lib/components/Budget.svelte';
  import Noodinfo from '$lib/components/Noodinfo.svelte';
  import WildlifeChecklist from '$lib/components/WildlifeChecklist.svelte';
  import WeerWidget from '$lib/components/WeerWidget.svelte';

  const vertrekDatum = new Date('2025-07-14');
  const dagen = Math.ceil((vertrekDatum - new Date()) / 86400000);

  let meerPagina = $state('');
  const meerOpties = [
    { id:'activiteiten',  emoji:'🎯', label:'Activiteiten' },
    { id:'gerechten',     emoji:'🍽️', label:'Gerechten' },
    { id:'paklijst',      emoji:'📋', label:'Paklijst' },
    { id:'boodschappen',  emoji:'🛒', label:'Boodschappen' },
    { id:'zwemplekken',   emoji:'🏊', label:'Zwemplekken' },
    { id:'wildlife',      emoji:'🦅', label:'Wildlife' },
    { id:'dagboek',       emoji:'📓', label:'Dagboek' },
    { id:'noodinfo',      emoji:'⚠️', label:'Noodinfo' },
  ];

  $effect(() => {
    if ($activePagina !== 'meer') meerPagina = '';
  });
</script>

<div class="header">
  <h1>🇫🇷 Frankrijk</h1>
  {#if $activePagina === 'home'}
    <p>
    <WeerWidget />Hoi {$gebruiker}!</p>
  {/if}
</div>

{#if $activePagina === 'home'}
  <div class="card">
    <h2>{dagen > 0 ? `🗓️ Nog ${dagen} dagen!` :
         dagen === 0 ? '🎉 Vandaag!' : '🚗 We zijn onderweg!'}</h2>
    <p style="margin-top:8px;">Lozère → Cantal → Pyrénées Ariégeoises</p>
  </div>

{:else if $activePagina === 'campings'}
  <GedeeldeLijst titel="Campings" emoji="🏕️"
    collectie="campings" metLink={true}
    placeholder="Naam camping..." />

{:else if $activePagina === 'poi'}
  <GedeeldeLijst titel="Bezienswaardigheden" emoji="📍"
    collectie="pois" metLink={true}
    placeholder="Naam plek..." />

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
      <GedeeldeLijst titel="Paklijst ({$gebruiker})" emoji="📋"
        collectie={`paklijst_${$gebruiker.toLowerCase()}`} afvinkbaar={true}
        placeholder="Wat moet je inpakken..." />
    {:else if meerPagina === 'boodschappen'}
      <GedeeldeLijst titel="Boodschappen" emoji="🛒"
        collectie="boodschappen" afvinkbaar={true}
        placeholder="Wat moet je kopen..." />
    {:else if meerPagina === 'zwemplekken'}
      <GedeeldeLijst titel="Zwemplekken" emoji="🏊"
        collectie="zwemplekken" metLink={true}
        placeholder="Rivier, meer of plek..." />
    {:else if meerPagina === 'wildlife'}
      <WildlifeChecklist />
    {:else if meerPagina === 'dagboek'}
      <GedeeldeLijst titel="Dagboek" emoji="📓"
        collectie="dagboek" placeholder="Vandaag..." />
    {:else if meerPagina === 'noodinfo'}
      <Noodinfo />
    {/if}
  {/if}
{/if}