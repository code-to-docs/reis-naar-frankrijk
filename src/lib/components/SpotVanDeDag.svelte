<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { E } from '$lib/emojis.js';
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from '$lib/wildlifeData.js';
  import { formatFullDate } from '$lib/utils/formatters.js';
  import type { Spotting, Wildlife, WildlifeRegio, WildlifeZeldzaamheid } from '$lib/types.js';

  let laatsteSpotting = $state<Spotting | null>(null);
  let dierInfo = $state<Wildlife | null>(null);
  let foto = $state('');
  let imgError = $state(false);
  let laatstFotoDierId = "";

  function getCategorieEmoji(dier: Wildlife) {
    return categorieLabels[dier.categorie]?.emoji || E.POOT;
  }

  function getZeldzaamheidMeta(level: WildlifeZeldzaamheid) {
    return zeldzaamheidLabels[level];
  }

  function getRegioMeta(regio: WildlifeRegio) {
    return regioLabels[regio];
  }

  onMount(() => {
    const ref = collection(db, 'wildlife');
    const q = query(ref, orderBy("datum", "desc"), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      let nieuwste: (Spotting & { id: string }) | null = null;
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        nieuwste = { id: d.id, ...(d.data() as Spotting) };
      }
      if (nieuwste) {
        laatsteSpotting = nieuwste;
        const currentDier = wildlifeData.find((d) => d.id === nieuwste.id) || null;
        dierInfo = currentDier;
        if (currentDier) {
          if (laatstFotoDierId === currentDier.id && foto) return;

          imgError = false;
          try {
            const cachedV3 = localStorage.getItem('wildlife_fotos_v3');
            const cachedV2 = localStorage.getItem('wildlife_fotos_v2');
            const raw = cachedV3 || cachedV2;
            if (raw) {
              const parsed = JSON.parse(raw) as { data?: { thumb?: Record<string, string> } | Record<string, string> };
              const cachedData = parsed.data;
              let thumbs: Record<string, string> = {};
              if (cachedData && typeof cachedData === 'object') {
                if ('thumb' in cachedData && cachedData.thumb && typeof cachedData.thumb === 'object') {
                  thumbs = cachedData.thumb;
                } else {
                  thumbs = cachedData as Record<string, string>;
                }
              }
              if (thumbs[currentDier.id]) {
                foto = thumbs[currentDier.id];
                laatstFotoDierId = currentDier.id;
                return;
              }
            }
          } catch {}
          
          fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(currentDier.wiki), {
            headers: { 'Api-User-Agent': 'ReisNaarFrankrijkApp/1.0 (travel-app; contact@example.com)' }
          })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.thumbnail && data.thumbnail.source) {
                foto = data.thumbnail.source;
                laatstFotoDierId = currentDier.id;
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
<a href="/meer/wildlife" class="spot-card ui-widget-card">
  <div class="ui-widget-head">
    <div>
      <div class="ui-widget-title">{E.VOGEL} Laatste spotting</div>
      <div class="ui-widget-kicker">Open wildlife en voeg meteen een nieuwe spotting toe of bekijk alle soorten.</div>
    </div>
  </div>
  <div class="spot-content">
    {#if foto && !imgError}
      <img src={foto} alt={dierInfo.naam} class="spot-foto" loading="lazy" onerror={() => imgError = true} />
    {:else}
      <div class="spot-foto-placeholder">{getCategorieEmoji(dierInfo)}</div>
    {/if}
    <div class="spot-info">
      <div class="ui-widget-name spot-naam">
        {dierInfo.naam}
        <span class="spot-zeldzaamheid" style="color: {getZeldzaamheidMeta(dierInfo.zeldzaamheid).kleur}">
          {getZeldzaamheidMeta(dierInfo.zeldzaamheid).emoji}
        </span>
      </div>
      <div class="ui-widget-subtitle spot-frans">{dierInfo.latijn}</div>
      <div class="ui-widget-meta spot-meta">
        <span>{E.KALENDER} {formatFullDate(laatsteSpotting.datum).replace(/ \d{4}$/, '')}</span>
        <span>{E.PERSOON} {laatsteSpotting.door}</span>
      </div>
      {#if laatsteSpotting.notitie}
        <p class="ui-widget-copy spot-note">{E.NOTITIE} {laatsteSpotting.notitie}</p>
      {/if}
      <div class="ui-widget-chips spot-regios">
        {#if laatsteSpotting.locatie}
          <span class="spot-regio-tag ui-chip ui-chip--muted">{laatsteSpotting.locatie}</span>
        {/if}
        {#each dierInfo.regios as regio}
          <span class="spot-regio-tag ui-chip ui-chip--muted">{getRegioMeta(regio).label}</span>
        {/each}
      </div>
    </div>
  </div>
</a>
{/if}

<style>
  .spot-card {
    display: grid;
    background: linear-gradient(135deg, #e9f8ea, #cceccc);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    margin-bottom: 12px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    border: 1px solid rgba(22, 163, 74, 0.18);
  }
  .spot-content { display: flex; gap: 14px; align-items: flex-start; }
  .spot-foto {
    width: 104px;
    height: 104px;
    border-radius: 14px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.16);
  }
  .spot-foto-placeholder {
    width: 104px;
    height: 104px;
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
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .spot-zeldzaamheid { font-size: 0.65rem; letter-spacing: -1px; }
  .spot-frans { color: #14532d; }
  .spot-note { margin: 0; }
  .spot-regios { margin-top: 0; }
  .spot-regio-tag {
    min-height: 28px;
  }

  @media (max-width: 560px) {
    .spot-content {
      gap: 12px;
    }
    .spot-foto, .spot-foto-placeholder {
      width: 88px;
      height: 88px;
    }
  }

  @media (min-width: 1100px) {
    .spot-card {
      border-radius: var(--radius-xl);
    }
    .spot-content {
      gap: 16px;
    }
    .spot-foto,
    .spot-foto-placeholder {
      width: 118px;
      height: 118px;
      border-radius: 16px;
    }
    .spot-regio-tag {
      min-height: 28px;
    }
  }
</style>
