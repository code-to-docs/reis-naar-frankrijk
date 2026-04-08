<script>
  import { onMount } from 'svelte';
  import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { gebruiker } from '$lib/stores.js';
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from '$lib/wildlifeData.js';

  let currentUser = $state('');
  let spottings = $state({});
  let fotos = $state({});
  let zoek = $state('');
  let filterStatus = $state('alle');
  let filterRegio = $state('alle');
  let filterCategorie = $state('alle');
  let expandedDier = $state(null);
  let spotNotitie = $state('');
  let spotLocatie = $state('');

  // Abonneer op gebruiker store
  let unsubUser;
  onMount(() => {
    unsubUser = gebruiker.subscribe(v => currentUser = v);
    return () => unsubUser?.();
  });

  // Firestore realtime sync voor spottings
  let unsubFirestore;
  onMount(() => {
    const ref = collection(db, 'wildlife');
    unsubFirestore = onSnapshot(ref, (snapshot) => {
      const data = {};
      snapshot.forEach((d) => {
        data[d.id] = d.data();
      });
      spottings = data;
    });
    return () => unsubFirestore?.();
  });

  // Wikipedia foto's laden
  onMount(() => {
    wildlifeData.forEach(async (dier) => {
      try {
        const res = await fetch(`https://nl.wikipedia.org/api/rest_v1/page/summary/${dier.wiki}`);
        if (!res.ok) {
          const resEN = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${dier.wiki}`);
          if (resEN.ok) {
            const data = await resEN.json();
            if (data.thumbnail?.source) {
              fotos[dier.id] = data.thumbnail.source;
              fotos = { ...fotos };
            }
          }
          return;
        }
        const data = await res.json();
        if (data.thumbnail?.source) {
          fotos[dier.id] = data.thumbnail.source;
          fotos = { ...fotos };
        }
      } catch (e) {
        console.warn('Foto laden mislukt voor', dier.naam);
      }
    });
  });

  // Spotting toevoegen/verwijderen
  async function toggleSpotting(dierId) {
    const spotting = spottings[dierId];
    if (spotting) {
      await deleteDoc(doc(db, 'wildlife', dierId));
    } else {
      await setDoc(doc(db, 'wildlife', dierId), {
        gespot: true,
        door: currentUser,
        datum: new Date().toISOString(),
        notitie: spotNotitie || '',
        locatie: spotLocatie || '',
      });
      spotNotitie = '';
      spotLocatie = '';
    }
  }

  // Spotting met details opslaan
  async function saveSpottingDetails(dierId) {
    await setDoc(doc(db, 'wildlife', dierId), {
      gespot: true,
      door: currentUser,
      datum: new Date().toISOString(),
      notitie: spotNotitie,
      locatie: spotLocatie,
    });
    spotNotitie = '';
    spotLocatie = '';
    expandedDier = null;
  }

  // Gefilterde lijst
  let gefilterd = $derived.by(() => {
    return wildlifeData.filter((dier) => {
      const zoekMatch = zoek === '' ||
        dier.naam.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.frans.toLowerCase().includes(zoek.toLowerCase()) ||
        dier.info.toLowerCase().includes(zoek.toLowerCase());

      const statusMatch = filterStatus === 'alle' ||
        (filterStatus === 'gespot' && spottings[dier.id]) ||
        (filterStatus === 'niet' && !spottings[dier.id]);

      const regioMatch = filterRegio === 'alle' ||
        dier.regios.includes(filterRegio);

      const catMatch = filterCategorie === 'alle' ||
        dier.categorie === filterCategorie;

      return zoekMatch && statusMatch && regioMatch && catMatch;
    });
  });

  // Statistieken
  let aantalGespot = $derived(
    wildlifeData.filter(d => spottings[d.id]).length
  );
  let totaal = $derived(wildlifeData.length);

  // Achievements
  let achievements = $derived.by(() => {
    const list = [];
    const gespotIds = wildlifeData.filter(d => spottings[d.id]).map(d => d.id);

    // Alle gieren
    const gieren = ['vale-gier', 'lammergier', 'monniksgier', 'aasgier'];
    if (gieren.every(id => gespotIds.includes(id))) {
      list.push({ emoji: '🏆', tekst: 'Gierenmeester — Alle 4 giersoorten gespot!' });
    }

    // Eerste 3-ster
    const drieSterspotted = wildlifeData.filter(d => d.zeldzaamheid === 3 && spottings[d.id]);
    if (drieSterspotted.length > 0) {
      list.push({ emoji: '💎', tekst: `Zeldzame vondst — ${drieSterspotted.length}x ⭐⭐⭐ gespot!` });
    }

    // 10+ gespot
    if (gespotIds.length >= 10) {
      list.push({ emoji: '🔭', tekst: 'Natuurkenner — 10+ soorten gespot!' });
    }

    // 20+ gespot
    if (gespotIds.length >= 20) {
      list.push({ emoji: '🏅', tekst: 'Wildlife expert — 20+ soorten gespot!' });
    }

    // Alle categorieën
    const gespotCats = new Set(wildlifeData.filter(d => spottings[d.id]).map(d => d.categorie));
    if (gespotCats.size === Object.keys(categorieLabels).length) {
      list.push({ emoji: '🌈', tekst: 'Alleskunner — Elke categorie minstens 1x gespot!' });
    }

    // Alle regio's
    const gespotRegios = new Set();
    wildlifeData.filter(d => spottings[d.id]).forEach(d => d.regios.forEach(r => gespotRegios.add(r)));
    if (gespotRegios.size === Object.keys(regioLabels).length) {
      list.push({ emoji: '🗺️', tekst: 'Ontdekker — Wildlife gespot in alle 3 regio\'s!' });
    }

    return list;
  });
</script>


<!-- ACHIEVEMENTS -->
{#if achievements.length > 0}
<div class="achievements">
  <h3>🏆 Achievements</h3>
  {#each achievements as ach}
    <div class="achievement">
      <span class="ach-emoji">{ach.emoji}</span>
      <span class="ach-tekst">{ach.tekst}</span>
    </div>
  {/each}
</div>
{/if}

<!-- STATISTIEKEN -->
<div class="wildlife-header">
  <h2>🦅 Wildlife Checklist</h2>
  <div class="stats-bar">
    <div class="stats-tekst">{aantalGespot} / {totaal} gespot</div>
    <div class="stats-track">
      <div class="stats-fill" style="width: {totaal > 0 ? (aantalGespot / totaal) * 100 : 0}%"></div>
    </div>
  </div>
</div>

<!-- ZOEKBALK -->
<div class="zoek-container">
  <input
    type="text"
    class="zoek-input"
    placeholder="🔍 Zoek op naam, Frans, of info..."
    bind:value={zoek}
  />
</div>

<!-- FILTERS -->
<div class="filters-section">

  <!-- Status filter -->
  <div class="filter-rij">
    <span class="filter-label">Status:</span>
    <div class="filter-knoppen">
      <button class="filter-knop" class:actief={filterStatus === 'alle'} onclick={() => filterStatus = 'alle'}>Alle</button>
      <button class="filter-knop" class:actief={filterStatus === 'gespot'} onclick={() => filterStatus = 'gespot'}>✅ Gespot</button>
      <button class="filter-knop" class:actief={filterStatus === 'niet'} onclick={() => filterStatus = 'niet'}>❌ Niet gespot</button>
    </div>
  </div>

  <!-- Regio filter -->
  <div class="filter-rij">
    <span class="filter-label">Regio:</span>
    <div class="filter-knoppen">
      <button class="filter-knop" class:actief={filterRegio === 'alle'} onclick={() => filterRegio = 'alle'}>Alle</button>
      {#each Object.entries(regioLabels) as [key, val]}
        <button class="filter-knop" class:actief={filterRegio === key} onclick={() => filterRegio = key}>{val.emoji} {val.label}</button>
      {/each}
    </div>
  </div>

  <!-- Categorie filter -->
  <div class="filter-rij">
    <span class="filter-label">Soort:</span>
    <div class="filter-knoppen">
      <button class="filter-knop" class:actief={filterCategorie === 'alle'} onclick={() => filterCategorie = 'alle'}>Alle</button>
      {#each Object.entries(categorieLabels) as [key, val]}
        <button class="filter-knop" class:actief={filterCategorie === key} onclick={() => filterCategorie = key}>{val.emoji} {val.label}</button>
      {/each}
    </div>
  </div>

</div>

<!-- RESULTATEN TELLER -->
<div class="resultaten-teller">
  {gefilterd.length} {gefilterd.length === 1 ? 'soort' : 'soorten'} gevonden
</div>

<!-- DIERENLIJST -->
<div class="dieren-lijst">
  {#each gefilterd as dier (dier.id)}
    <div class="dier-card" class:gespot={spottings[dier.id]}>

      <!-- HOOFDRIJ -->
      <div class="dier-hoofd" onclick={() => expandedDier = expandedDier === dier.id ? null : dier.id}>
        <div class="dier-foto-container">
          {#if fotos[dier.id]}
            <img src={fotos[dier.id]} alt={dier.naam} class="dier-foto" />
          {:else}
            <div class="dier-foto-placeholder">{categorieLabels[dier.categorie]?.emoji || '🐾'}</div>
          {/if}
          {#if spottings[dier.id]}
            <div class="gespot-badge">✅</div>
          {/if}
        </div>

        <div class="dier-info">
          <div class="dier-naam-rij">
            <strong class="dier-naam">{dier.naam}</strong>
            <span class="zeldzaamheid" style="color: {zeldzaamheidLabels[dier.zeldzaamheid].kleur}">
              {zeldzaamheidLabels[dier.zeldzaamheid].emoji}
            </span>
          </div>
          <div class="dier-frans">{dier.frans}</div>
          <div class="dier-regios">
            {#each dier.regios as regio}
              <span class="regio-tag">{regioLabels[regio]?.emoji} {regioLabels[regio]?.label}</span>
            {/each}
          </div>
        </div>

        <div class="expand-icon">{expandedDier === dier.id ? '▲' : '▼'}</div>
      </div>

      <!-- UITGEKLAPT DETAIL -->
      {#if expandedDier === dier.id}
        <div class="dier-detail">

          <p class="dier-beschrijving">{dier.info}</p>

          <!-- Tip -->
          {#if dier.tip}
            <div class="detail-blok">
              <span class="detail-icon">💡</span>
              <span class="detail-tekst">{dier.tip}</span>
            </div>
          {/if}

          <!-- Spotting info als gespot -->
          {#if spottings[dier.id]}
            <div class="spotting-info">
              <div class="spotting-header">✅ Gespot door {spottings[dier.id].door}</div>
              {#if spottings[dier.id].datum}
                <div class="spotting-detail">📅 {new Date(spottings[dier.id].datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              {/if}
              {#if spottings[dier.id].locatie}
                <div class="spotting-detail">📍 {spottings[dier.id].locatie}</div>
              {/if}
              {#if spottings[dier.id].notitie}
                <div class="spotting-detail">📝 {spottings[dier.id].notitie}</div>
              {/if}
            </div>
          {/if}

          <!-- Spot formulier als NIET gespot -->
          {#if !spottings[dier.id]}
            <div class="spot-formulier">
              <input type="text" class="spot-input" placeholder="📍 Locatie (optioneel)" bind:value={spotLocatie} />
              <input type="text" class="spot-input" placeholder="📝 Notitie (optioneel)" bind:value={spotNotitie} />
              <button class="spot-knop" onclick={() => saveSpottingDetails(dier.id)}>
                ✅ {dier.naam} gespot!
              </button>
            </div>
          {:else}
            <button class="unspot-knop" onclick={() => toggleSpotting(dier.id)}>
              ↩️ Spotting ongedaan maken
            </button>
          {/if}

          <!-- Links -->
          <div class="dier-links">
            <a href="https://en.wikipedia.org/wiki/{dier.wiki}" target="_blank" rel="noopener" class="wiki-link">
              📖 Wikipedia
            </a>
            {#if dier.geluid}
              <a href={dier.geluid} target="_blank" rel="noopener" class="geluid-link">
                🔊 Geluid beluisteren
              </a>
            {/if}
          </div>

        </div>
      {/if}

    </div>
  {/each}
</div>

{#if gefilterd.length === 0}
  <div class="geen-resultaat">
    <p>😕 Geen dieren gevonden met deze filters.</p>
    <button class="reset-knop" onclick={() => { zoek = ''; filterStatus = 'alle'; filterRegio = 'alle'; filterCategorie = 'alle'; }}>
      Filters resetten
    </button>
  </div>
{/if}

<style>
  /* ACHIEVEMENTS */
  .achievements {
    background: linear-gradient(135deg, #FFF8E1, #FFECB3);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .achievements h3 {
    margin: 0 0 10px 0;
    font-size: 1.05rem;
  }
  .achievement {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .achievement:last-child { border-bottom: none; }
  .ach-emoji { font-size: 1.4rem; }
  .ach-tekst { font-size: 0.9rem; font-weight: 500; }

  /* HEADER + STATS */
  .wildlife-header {
    margin-bottom: 16px;
  }
  .wildlife-header h2 {
    margin: 0 0 10px 0;
    font-size: 1.4rem;
  }
  .stats-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stats-tekst {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 80px;
  }
  .stats-track {
    flex: 1;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
  }
  .stats-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    border-radius: 5px;
    transition: width 0.4s ease;
  }

  /* ZOEKBALK */
  .zoek-container {
    margin-bottom: 12px;
  }
  .zoek-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .zoek-input:focus {
    border-color: #1a5276;
  }

  /* FILTERS */
  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }
  .filter-rij {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .filter-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .filter-knoppen {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .filter-knop {
    padding: 6px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 20px;
    background: white;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .filter-knop:hover {
    border-color: #1a5276;
  }
  .filter-knop.actief {
    background: #1a5276;
    color: white;
    border-color: #1a5276;
  }

  /* RESULTATEN TELLER */
  .resultaten-teller {
    font-size: 0.85rem;
    color: #777;
    margin-bottom: 12px;
    font-style: italic;
  }

  /* DIER CARDS */
  .dieren-lijst {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dier-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .dier-card.gespot {
    border-color: #4CAF50;
    background: #F9FFF9;
  }

  /* HOOFDRIJ */
  .dier-hoofd {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
  }
  .dier-foto-container {
    position: relative;
    flex-shrink: 0;
  }
  .dier-foto {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
  }
  .dier-foto-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }
  .gespot-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 1rem;
    background: white;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .dier-info {
    flex: 1;
    min-width: 0;
  }
  .dier-naam-rij {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .dier-naam {
    font-size: 1rem;
  }
  .zeldzaamheid {
    font-size: 0.7rem;
    letter-spacing: -1px;
  }
  .dier-frans {
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
  }
  .dier-regios {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }
  .regio-tag {
    font-size: 0.7rem;
    background: #f0f4f8;
    padding: 2px 8px;
    border-radius: 10px;
    color: #555;
  }

  .expand-icon {
    font-size: 0.8rem;
    color: #aaa;
    flex-shrink: 0;
  }

  /* DETAIL SECTIE */
  .dier-detail {
    padding: 0 16px 16px 16px;
    border-top: 1px solid #f0f0f0;
  }
  .dier-beschrijving {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444;
    margin: 12px 0;
  }
  .detail-blok {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    background: #FFF8E1;
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 12px;
  }
  .detail-icon { font-size: 1.1rem; flex-shrink: 0; }
  .detail-tekst { font-size: 0.85rem; line-height: 1.4; }

  /* SPOTTING INFO */
  .spotting-info {
    background: #E8F5E9;
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 12px;
  }
  .spotting-header {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
  .spotting-detail {
    font-size: 0.85rem;
    color: #555;
    padding: 2px 0;
  }

  /* SPOT FORMULIER */
  .spot-formulier {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .spot-input {
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .spot-input:focus {
    border-color: #4CAF50;
  }
  .spot-knop {
    padding: 12px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .spot-knop:hover { background: #388E3C; }

  .unspot-knop {
    padding: 8px 16px;
    background: none;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 0.8rem;
    color: #888;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s;
  }
  .unspot-knop:hover {
    border-color: #F44336;
    color: #F44336;
  }

  /* LINKS */
  .dier-links {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .wiki-link, .geluid-link {
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .wiki-link {
    background: #E3F2FD;
    color: #1565C0;
  }
  .geluid-link {
    background: #FFF3E0;
    color: #E65100;
  }
  .wiki-link:hover, .geluid-link:hover { opacity: 0.8; }

  /* GEEN RESULTAAT */
  .geen-resultaat {
    text-align: center;
    padding: 30px;
    color: #888;
  }
  .reset-knop {
    margin-top: 10px;
    padding: 10px 20px;
    background: #1a5276;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .reset-knop:hover { opacity: 0.9; }
</style>
