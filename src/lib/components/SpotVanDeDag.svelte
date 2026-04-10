<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { E } from '$lib/emojis.js';
  import { wildlifeData, categorieLabels, regioLabels, zeldzaamheidLabels } from '$lib/wildlifeData.js';
  import { fetchWikipediaSummaryImage } from '$lib/api/wikiApi.js';
  import { formatFullDate } from '$lib/utils/formatters.js';
  import type { Spotting, Wildlife, WildlifeRegio, WildlifeZeldzaamheid } from '$lib/types.js';

  let laatsteSpotting = $state<Spotting | null>(null);
  let dierInfo = $state<Wildlife | null>(null);
  let foto = $state('');
  let imgError = $state(false);
  let laatstFotoDierId = "";
  let actiefFetchId = 0;
  let wikiController: AbortController | null = null;

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
      if (!nieuwste) {
        laatsteSpotting = null;
        dierInfo = null;
        foto = "";
        laatstFotoDierId = "";
        imgError = false;
        wikiController?.abort();
        return;
      }
      if (nieuwste) {
        laatsteSpotting = nieuwste;
        const currentDier = wildlifeData.find((d) => d.id === nieuwste.id) || null;
        dierInfo = currentDier;
        if (currentDier) {
          if (laatstFotoDierId === currentDier.id && foto) return;

          foto = "";
          laatstFotoDierId = "";
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
          
          wikiController?.abort();
          const requestId = ++actiefFetchId;
          wikiController = new AbortController();

          fetchWikipediaSummaryImage(currentDier.wiki, wikiController.signal)
            .then((data) => {
              if (requestId !== actiefFetchId) return;
              if (data && "thumb" in data) {
                foto = data.thumb;
                laatstFotoDierId = currentDier.id;
              }
            })
            .catch((error) => {
              if (error instanceof DOMException && error.name === "AbortError") return;
            });
        }
      }
    });
    return () => {
      unsub();
      wikiController?.abort();
    };
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
        {#each dierInfo.regios as regio (regio)}
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
    background: linear-gradient(135deg, var(--color-success-light), color-mix(in srgb, var(--color-success-base) 22%, var(--bg-surface)));
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    margin-bottom: var(--space-3);
    box-shadow: var(--shadow-md);
    border: 1px solid color-mix(in srgb, var(--color-success-base) 24%, var(--border-default));
  }
  .spot-content { display: flex; gap: var(--space-3); align-items: flex-start; }
  .spot-foto {
    width: 104px;
    height: 104px;
    border-radius: var(--radius-lg);
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }
  .spot-foto-placeholder {
    width: 104px;
    height: 104px;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    flex-shrink: 0;
  }
  .spot-info { flex: 1; min-width: 0; }
  .spot-naam {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
  }
  .spot-zeldzaamheid { font-size: 0.65rem; letter-spacing: -1px; }
  .spot-frans { color: var(--text-success); }
  .spot-note { margin: 0; }
  .spot-regios { margin-top: 0; }
  .spot-regio-tag {
    min-height: 28px;
  }

  @media (max-width: 560px) {
    .spot-content {
      gap: var(--space-3);
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
      gap: var(--space-4);
    }
    .spot-foto,
    .spot-foto-placeholder {
      width: 118px;
      height: 118px;
      border-radius: var(--radius-xl);
    }
    .spot-regio-tag {
      min-height: 28px;
    }
  }
</style>

