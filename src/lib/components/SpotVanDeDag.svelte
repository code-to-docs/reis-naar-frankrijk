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
  .spot-card {
    background: linear-gradient(135deg, #e9f8ea, #cceccc);
    border-radius: 18px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    border: 1px solid rgba(22, 163, 74, 0.18);
  }
  .spot-header { margin-bottom: 10px; }
  .spot-label {
    font-weight: 800;
    font-size: 1.55rem;
    color: #111827;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .spot-content { display: flex; gap: 12px; align-items: center; }
  .spot-foto {
    width: 88px;
    height: 88px;
    border-radius: 14px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.16);
  }
  .spot-foto-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 14px;
    background: rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    flex-shrink: 0;
  }
  .spot-info { flex: 1; min-width: 0; }
  .spot-naam {
    font-weight: 800;
    font-size: 1.45rem;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
  }
  .spot-zeldzaamheid { font-size: 0.65rem; letter-spacing: -1px; }
  .spot-frans {
    font-size: 0.9rem;
    color: #14532d;
    font-style: italic;
    margin-bottom: 5px;
    font-weight: 500;
  }
  .spot-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.9rem;
    color: #111827;
    margin-bottom: 5px;
    font-weight: 500;
  }
  .spot-detail { font-size: 0.84rem; color: #334155; margin-bottom: 2px; }
  .spot-regios { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 7px; }
  .spot-regio-tag {
    font-size: 0.9rem;
    background: rgba(255,255,255,0.68);
    padding: 6px 10px;
    border-radius: 11px;
    color: #1f2937;
    font-weight: 600;
  }

  @media (max-width: 560px) {
    .spot-label { font-size: 1.45rem; }
    .spot-naam { font-size: 1.35rem; }
    .spot-foto, .spot-foto-placeholder {
      width: 82px;
      height: 82px;
    }
  }

  @media (min-width: 1100px) {
    .spot-card {
      padding: 18px;
      border-radius: 20px;
    }
    .spot-content {
      gap: 14px;
    }
    .spot-label {
      font-size: 1.65rem;
    }
    .spot-foto,
    .spot-foto-placeholder {
      width: 102px;
      height: 102px;
      border-radius: 16px;
    }
    .spot-naam {
      font-size: 1.6rem;
    }
    .spot-meta {
      font-size: 0.95rem;
    }
    .spot-regio-tag {
      font-size: 0.92rem;
      padding: 6px 11px;
    }
  }
</style>
