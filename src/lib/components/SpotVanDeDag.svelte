<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { E } from '$lib/emojis.js';
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from '$lib/wildlifeData.js';
  import { formatFullDate } from '$lib/utils/formatters.js';

  let laatsteSpotting: any = $state(null);
  let dierInfo: any = $state(null);
  let foto = $state('');
  let imgError = $state(false);
  let laatstFotoDierId = "";

  onMount(() => {
    const ref = collection(db, 'wildlife');
    const q = query(ref, orderBy("datum", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      let nieuwste: any = null;
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        nieuwste = { id: d.id, ...d.data() };
      }
      if (nieuwste) {
        laatsteSpotting = nieuwste;
        dierInfo = wildlifeData.find(d => d.id === nieuwste.id) || null;
        if (dierInfo) {
          if (laatstFotoDierId === dierInfo.id && foto) return;

          imgError = false;
          try {
            const cachedV3 = localStorage.getItem('wildlife_fotos_v3');
            const cachedV2 = localStorage.getItem('wildlife_fotos_v2');
            const raw = cachedV3 || cachedV2;
            if (raw) {
              const parsed = JSON.parse(raw);
              const thumbs = parsed?.data?.thumb || parsed?.data || {};
              if (thumbs[dierInfo.id]) {
                foto = thumbs[dierInfo.id];
                laatstFotoDierId = dierInfo.id;
                return;
              }
            }
          } catch (e) {}
          
          fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(dierInfo.wiki), {
            headers: { 'Api-User-Agent': 'ReisNaarFrankrijkApp/1.0 (travel-app; contact@example.com)' }
          })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.thumbnail && data.thumbnail.source) {
                foto = data.thumbnail.source;
                laatstFotoDierId = dierInfo.id;
              }
            })
            .catch(() => {});
        }
      }
    });
    return () => unsub();
  });
</script>

{#if laatsteSpotting && dierInfo}
<div class="spot-card">
  <div class="spot-header">
    <span class="spot-label">{E.VOGEL} Laatste spotting</span>
  </div>
  <div class="spot-content">
    {#if foto && !imgError}
      <img src={foto} alt={dierInfo.naam} class="spot-foto" loading="lazy" onerror={() => imgError = true} />
    {:else}
      <div class="spot-foto-placeholder">{(categorieLabels as any)[dierInfo.categorie]?.emoji || E.POOT}</div>
    {/if}
    <div class="spot-info">
      <div class="spot-naam">
        {dierInfo.naam}
        <span class="spot-zeldzaamheid" style="color: {(zeldzaamheidLabels as any)[dierInfo.zeldzaamheid].kleur}">
          {(zeldzaamheidLabels as any)[dierInfo.zeldzaamheid].emoji}
        </span>
      </div>
      <div class="spot-frans">{dierInfo.frans}</div>
      <div class="spot-meta">
        <span>{E.KALENDER} {formatFullDate(laatsteSpotting.datum).replace(/ \d{4}$/, '')}</span>
        <span>{E.PERSOON} {laatsteSpotting.door}</span>
      </div>
      {#if laatsteSpotting.locatie}
        <div class="spot-detail">{E.PIN} {laatsteSpotting.locatie}</div>
      {/if}
      {#if laatsteSpotting.notitie}
        <div class="spot-detail">{E.NOTITIE} {laatsteSpotting.notitie}</div>
      {/if}
      <div class="spot-regios">
        {#each dierInfo.regios as regio}
          <span class="spot-regio-tag">{(regioLabels as any)[regio]?.emoji} {(regioLabels as any)[regio]?.label}</span>
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
