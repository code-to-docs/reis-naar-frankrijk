<script>
  import { onMount } from 'svelte';
  import { collection, onSnapshot } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from '$lib/wildlifeData.js';
  import { activePagina } from '$lib/stores.js';
  let laatsteSpotting = $state(null);
  let dierInfo = $state(null);
  let foto = $state('');
  const EAGLE = "\u{1F985}";
  const CALENDAR = "\u{1F4C5}";
  const PERSON = "\u{1F464}";
  const PIN = "\u{1F4CD}";
  const MEMO = "\u{1F4DD}";
  const PAW = "\u{1F43E}";
  onMount(() => {
    const ref = collection(db, 'wildlife');
    const unsub = onSnapshot(ref, (snapshot) => {
      let nieuwste = null;
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.datum && (!nieuwste || data.datum > nieuwste.datum)) {
          nieuwste = { id: d.id, ...data };
        }
      });
      if (nieuwste) {
        laatsteSpotting = nieuwste;
        dierInfo = wildlifeData.find(d => d.id === nieuwste.id) || null;
        if (dierInfo) {
          try {
            const cached = localStorage.getItem('wildlife_fotos_v2');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed.data && parsed.data[dierInfo.id]) {
                foto = parsed.data[dierInfo.id];
                return;
              }
            }
          } catch (e) {}
          fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(dierInfo.wiki))
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.thumbnail && data.thumbnail.source) foto = data.thumbnail.source;
            })
            .catch(() => {});
        }
      }
    });
    return () => unsub();
  });
  function formatDate(d) { return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' }); }
</script>

{#if laatsteSpotting && dierInfo}
<div class="spot-card">
  <div class="spot-header">
    <span class="spot-label">{EAGLE} Laatste spotting</span>
  </div>
  <div class="spot-content">
    {#if foto}
      <img src={foto} alt={dierInfo.naam} class="spot-foto" />
    {:else}
      <div class="spot-foto-placeholder">{categorieLabels[dierInfo.categorie]?.emoji || PAW}</div>
    {/if}
    <div class="spot-info">
      <div class="spot-naam">
        {dierInfo.naam}
        <span class="spot-zeldzaamheid" style="color: {zeldzaamheidLabels[dierInfo.zeldzaamheid].kleur}">
          {zeldzaamheidLabels[dierInfo.zeldzaamheid].emoji}
        </span>
      </div>
      <div class="spot-frans">{dierInfo.frans}</div>
      <div class="spot-meta">
        <span>{CALENDAR} {formatDate(laatsteSpotting.datum)}</span>
        <span>{PERSON} {laatsteSpotting.door}</span>
      </div>
      {#if laatsteSpotting.locatie}
        <div class="spot-detail">{PIN} {laatsteSpotting.locatie}</div>
      {/if}
      {#if laatsteSpotting.notitie}
        <div class="spot-detail">{MEMO} {laatsteSpotting.notitie}</div>
      {/if}
      <div class="spot-regios">
        {#each dierInfo.regios as regio}
          <span class="spot-regio-tag">{regioLabels[regio]?.emoji} {regioLabels[regio]?.label}</span>
        {/each}
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .spot-card { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .spot-header { margin-bottom: 12px; }
  .spot-label { font-weight: 700; font-size: 1rem; color: #2E7D32; }
  .spot-content { display: flex; gap: 12px; align-items: flex-start; }
  .spot-foto { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
  .spot-foto-placeholder { width: 70px; height: 70px; border-radius: 12px; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; }
  .spot-info { flex: 1; min-width: 0; }
  .spot-naam { font-weight: 700; font-size: 1.05rem; color: #1B5E20; display: flex; align-items: center; gap: 6px; }
  .spot-zeldzaamheid { font-size: 0.65rem; letter-spacing: -1px; }
  .spot-frans { font-size: 0.8rem; color: #558B2F; font-style: italic; margin-bottom: 6px; }
  .spot-meta { display: flex; gap: 12px; font-size: 0.78rem; color: #33691E; margin-bottom: 4px; }
  .spot-detail { font-size: 0.78rem; color: #555; margin-bottom: 2px; }
  .spot-regios { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .spot-regio-tag { font-size: 0.68rem; background: rgba(255,255,255,0.7); padding: 2px 8px; border-radius: 10px; color: #333; }
</style>