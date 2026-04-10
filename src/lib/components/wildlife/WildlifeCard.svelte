<script lang="ts">
  import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { toonSnackbar } from "$lib/stores.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { categorieLabels, regioLabels, zeldzaamheidLabels } from "$lib/wildlifeData.js";
  import { getWildlifeProfile } from "$lib/wildlifeProfiles.js";
  import { E } from "$lib/emojis.js";
  import { formatFullDate, formatTime } from "$lib/utils/formatters.js";
  import type { Spotting, Wildlife, WildlifeRegio, WildlifeZeldzaamheid } from "$lib/types.js";
  import { buildMapsLinks, getCurrentCoords, reverseGeocode } from "./locationUtils.js";

  let { 
    dier, 
    spotting, 
    foto, 
    groteFoto, 
    isExpanded, 
    currentUser, 
    onToggle 
  } = $props<{ 
    dier: Wildlife;
    spotting: Spotting | null | undefined; 
    foto: string; 
    groteFoto?: string; 
    isExpanded: boolean; 
    currentUser: string; 
    onToggle: () => void; 
  }>();

  let spotNotitie = $state("");
  let spotLocatie = $state("");
  let spotLatitude = $state<number | null>(null);
  let spotLongitude = $state<number | null>(null);

  let imgError = $state(false);
  let gettingLocation = $state(false);
  let locationAttempted = $state(false);
  let toonFullscreenFoto = $state(false);

  let groteFotoSrc = $derived(groteFoto || (foto ? foto.replace(/\/\d+px-/, "/1600px-") : null));
  let profiel = $derived.by(() => getWildlifeProfile(dier.id));

  // Reset error state when foto prop changes
  $effect(() => {
    if (foto) imgError = false;
  });

  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = toonFullscreenFoto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  function getCategorieEmoji() {
    const categorie = dier.categorie as keyof typeof categorieLabels;
    return categorieLabels[categorie]?.emoji || E.POOT;
  }

  function getCategorieLabel() {
    const categorie = dier.categorie as keyof typeof categorieLabels;
    return categorieLabels[categorie]?.label || "Wildlife";
  }

  function getZeldzaamheidMeta(level: WildlifeZeldzaamheid) {
    return zeldzaamheidLabels[level];
  }

  function getRegioMeta(regio: WildlifeRegio) {
    return regioLabels[regio];
  }

  async function autoLocatie() {
    if (gettingLocation) return;
    gettingLocation = true;

    const coords = await getCurrentCoords();
    if (!coords) {
      gettingLocation = false;
      return;
    }

    spotLatitude = coords.lat;
    spotLongitude = coords.lon;
    if (!spotLocatie) {
      spotLocatie = await reverseGeocode(coords.lat, coords.lon);
    }
    gettingLocation = false;
  }

  $effect(() => {
    if (isExpanded && !spotting && !locationAttempted && spotLocatie === "") {
      locationAttempted = true;
      autoLocatie();
    }
    if (!isExpanded) {
      locationAttempted = false;
    }
  });

  async function saveSpottingDetails() {
    try {
      gettingLocation = true;
      const coords = await getCurrentCoords();
      gettingLocation = false;

      const lat = coords?.lat ?? spotLatitude;
      const lon = coords?.lon ?? spotLongitude;
      if (coords) {
        spotLatitude = coords.lat;
        spotLongitude = coords.lon;
      }

      const hasCoords = typeof lat === "number" && typeof lon === "number";
      const locatie = spotLocatie || (hasCoords ? await reverseGeocode(lat, lon) : "");
      const links = hasCoords ? buildMapsLinks(lat, lon) : null;

      await setDoc(
        doc(db, "wildlife", dier.id),
        {
          gespot: true,
          door: currentUser,
          datum: serverTimestamp(),
          notitie: spotNotitie,
          locatie,
          latitude: hasCoords ? lat : null,
          longitude: hasCoords ? lon : null,
          googleMapsUrl: links?.google || null,
          openStreetMapUrl: links?.osm || null
        },
        { merge: true }
      );
      haptic("success");
      const emoji = getCategorieEmoji();
      toonSnackbar(dier.naam + " gespot!", "success", emoji);
      spotNotitie = "";
      spotLocatie = "";
      spotLatitude = null;
      spotLongitude = null;
      onToggle(); // Close after saving
    } catch (e) {
      console.error(e);
      toonSnackbar("Fout bij opslaan", "error", E.KRUIS);
    }
  }

  async function verwijderSpotting() {
    try {
      await deleteDoc(doc(db, "wildlife", dier.id));
      haptic("light");
      toonSnackbar("Spotting ongedaan gemaakt", "warning", E.UNDO);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon niet verwijderen", "error", E.KRUIS);
    }
  }
</script>

<div class="wl-card" class:gespot={!!spotting}>
  <button type="button" class="wl-hoofd" onclick={onToggle} aria-expanded={isExpanded}>
    <div class="wl-foto-wrap">
      {#if foto && !imgError}
        <img src={foto} alt={dier.naam} class="wl-foto" loading="lazy" decoding="async" onerror={() => imgError = true} />
      {:else}
        <div class="wl-foto-ph">{getCategorieEmoji()}</div>
      {/if}
      {#if spotting}
        <div class="wl-gespot-dot"></div>
      {/if}
    </div>
    <div class="wl-info">
      <div class="wl-naam-rij">
        <strong class="wl-naam">{dier.naam}</strong>
          <span class="wl-ster" style="color:{getZeldzaamheidMeta(dier.zeldzaamheid).kleur}">{getZeldzaamheidMeta(dier.zeldzaamheid).emoji}</span>
      </div>
      <div class="wl-tags">
        {#each dier.regios as regio (regio)}
          <span class="wl-tag ui-chip ui-chip--muted">
            <span aria-hidden="true">{getRegioMeta(regio).emoji}</span>
            <span>{getRegioMeta(regio).label}</span>
          </span>
        {/each}
      </div>
    </div>
    <svg class="wl-chevron" class:open={isExpanded} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8L10 12L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if isExpanded}
    <div class="wl-detail">
      {#if groteFotoSrc && !imgError}
        <button type="button" class="wl-grote-beeld-btn" onclick={() => toonFullscreenFoto = true} aria-label={`Open foto van ${dier.naam} op volledig scherm`}>
          <figure class="wl-grote-beeld">
            <img 
              src={groteFotoSrc} 
              alt={dier.naam} 
              class="wl-foto-groot" 
              loading="lazy" 
              decoding="async" 
              onerror={e => {
                const target = e.currentTarget;
                if (target instanceof HTMLImageElement) {
                  target.src = foto;
                }
              }} 
            />
            <figcaption class="wl-foto-hint">Open fullscreen</figcaption>
          </figure>
        </button>
      {/if}

      <div class="wl-names">
        <div class="wl-name-row"><strong>NL</strong> {dier.naam}</div>
        <div class="wl-name-row"><strong>DE</strong> {dier.duits}</div>
        <div class="wl-name-row"><strong>LAT</strong> <i>{dier.latijn}</i></div>
        <div class="wl-name-row"><strong>TYPE</strong> {getCategorieLabel()}</div>
      </div>

      <div class="wl-insights">
        <div class="wl-fact-card">
          <strong>{E.TIP} Interessant feitje</strong>
          <p class="wl-beschrijving">{profiel.feitje}</p>
        </div>
        <div class="wl-metrics-grid">
          <div class="wl-metric">
            <span class="wl-metric-label">Gewicht</span>
            <span class="wl-metric-value">{profiel.gewicht}</span>
          </div>
          <div class="wl-metric">
            <span class="wl-metric-label">Lengte</span>
            <span class="wl-metric-value">{profiel.lengte}</span>
          </div>
          <div class="wl-metric">
            <span class="wl-metric-label">Leeftijd</span>
            <span class="wl-metric-value">{profiel.leeftijd}</span>
          </div>
          <div class="wl-metric">
            <span class="wl-metric-label">Actief</span>
            <span class="wl-metric-value">{profiel.actief}</span>
          </div>
          <div class="wl-metric wl-metric--wide">
            <span class="wl-metric-label">Voeding</span>
            <span class="wl-metric-value">{profiel.voeding}</span>
          </div>
        </div>
      </div>

      <div class="wl-section">
        <strong>{E.TIP} Herkenningspunten</strong>
        <p class="wl-beschrijving">{dier.kenmerken}</p>
      </div>

      <div class="wl-section">
        <strong>{E.PIN} Waar & Wanneer</strong>
        <p class="wl-beschrijving">{dier.waar_wanneer}</p>
      </div>
      {#if spotting}
        <div class="wl-spotting">
          <div class="wl-spotting-head">{E.CHECK} Gespot door {spotting.door}</div>
          {#if spotting.datum}
            <div class="wl-spotting-row">{E.KALENDER} {formatFullDate(spotting.datum)}</div>
            <div class="wl-spotting-row">Tijd {formatTime(spotting.datum)}</div>
          {/if}
          {#if spotting.locatie}
            <div class="wl-spotting-row">{E.PIN} {spotting.locatie}</div>
          {/if}
          {#if typeof spotting.latitude === "number" && typeof spotting.longitude === "number"}
            <div class="wl-spotting-row">{E.PIN} {spotting.latitude.toFixed(5)}, {spotting.longitude.toFixed(5)}</div>
            <div class="wl-links wl-map-links">
              <a href={spotting.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(`${spotting.latitude},${spotting.longitude}`)}`} target="_blank" rel="noopener" class="wl-link maps-google">Google Maps</a>
              <a href={spotting.openStreetMapUrl || `https://www.openstreetmap.org/?mlat=${spotting.latitude}&mlon=${spotting.longitude}#map=15/${spotting.latitude}/${spotting.longitude}`} target="_blank" rel="noopener" class="wl-link maps-osm">OpenStreetMap</a>
            </div>
          {/if}
          {#if spotting.notitie}
            <div class="wl-spotting-row">{E.NOTITIE} {spotting.notitie}</div>
          {/if}
        </div>
      {/if}
      {#if !spotting}
        <div class="wl-spot-form">
          <div class="wl-locatie-wrap">
            <input type="text" class="wl-spot-input wl-loc-input" placeholder="{E.PIN} Locatie" bind:value={spotLocatie} />
            <button class="wl-loc-btn" onclick={autoLocatie} title="Haal locatie op" aria-label="Haal huidige locatie op" disabled={gettingLocation}>
              {#if gettingLocation}
                <svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              {:else}
                {E.PIN}
              {/if}
            </button>
          </div>
          <input type="text" class="wl-spot-input" placeholder="{E.NOTITIE} Notitie (optioneel)" bind:value={spotNotitie} />
          <button class="wl-spot-btn btn-save" onclick={saveSpottingDetails}>
            {dier.naam} gespot!
          </button>
        </div>
      {:else}
        <button class="wl-unspot" onclick={verwijderSpotting}>
          {E.UNDO} Spotting ongedaan maken
        </button>
      {/if}
      <div class="wl-links">
        <a href={"https://en.wikipedia.org/wiki/" + dier.wiki} target="_blank" rel="noopener" class="wl-link wiki">{E.WIKI} Wikipedia</a>
        {#if dier.geluid}
          <a href={dier.geluid} target="_blank" rel="noopener" class="wl-link geluid">{E.GELUID} Geluid</a>
        {/if}
      </div>
    </div>
  {/if}
</div>

{#if toonFullscreenFoto && groteFotoSrc}
  <div class="wl-fs-overlay" role="dialog" aria-modal="true" aria-label={`Foto van ${dier.naam}`}>
    <button type="button" class="wl-fs-back" onclick={() => toonFullscreenFoto = false}>{E.PIJL} Terug</button>
    <img src={groteFotoSrc} alt={dier.naam} class="wl-fs-img" />
  </div>
{/if}

<style>
  .wl-card {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 1px var(--space-1) rgba(0,0,0,0.06);
    border: 2px solid transparent;
    transition: border-color var(--duration-normal);
  }
  .wl-card.gespot { border-color: var(--color-success-base); background: var(--color-success-light); }
  .wl-hoofd {
    display: flex;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    cursor: pointer;
  }
  .wl-foto-wrap { position: relative; flex-shrink: 0; }
  .wl-foto {
    width: 62px;
    height: 62px;
    border-radius: var(--radius-lg);
    object-fit: cover;
  }
  .wl-foto-ph {
    width: 62px;
    height: 62px;
    border-radius: var(--radius-lg);
    background: var(--bg-surface-sunken);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
  }
  .wl-gespot-dot {
    position: absolute; top: -3px; right: -3px; width: 14px; height: 14px;
    background: var(--color-success-base); border: 2px solid var(--bg-surface); border-radius: var(--radius-full);
  }
  .wl-info { flex: 1; min-width: 0; }
  .wl-naam-rij { display: flex; align-items: center; gap: var(--space-1-5); }
  .wl-naam {
    font-size: var(--text-base);
    font-weight: var(--ui-weight-bold);
    color: var(--text-primary);
  }
  .wl-ster { font-size: var(--text-xs); letter-spacing: -1px; }
  .wl-tags { display: flex; flex-wrap: wrap; gap: var(--space-1-5); margin-top: var(--space-1-5); }
  .wl-tag { min-height: 26px; }
  .wl-chevron { flex-shrink: 0; transition: transform var(--duration-normal) ease; }
  .wl-chevron.open { transform: rotate(180deg); }

  .wl-detail {
    padding: 0 14px 14px 14px;
    border-top: 1px solid var(--border-default);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-2-5);
  }
  .wl-grote-beeld-btn {
    background: none;
    border: none;
    padding: 0;
    width: 100%;
    cursor: zoom-in;
  }
  .wl-grote-beeld {
    width: 100%;
    margin: 0;
    position: relative;
    height: 260px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 var(--space-2) var(--space-5) -var(--space-1-5) rgba(0,0,0,0.2);
    background: var(--bg-surface-sunken);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wl-foto-hint {
    position: absolute;
    right: var(--space-2-5);
    bottom: var(--space-2-5);
    margin: 0;
    font-size: var(--text-xs);
    color: var(--text-inverse);
    background: rgba(15, 23, 42, 0.7);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
  }
  .wl-foto-groot {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    display: block;
    background: transparent;
  }
  .wl-fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(2, 6, 23, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 56px var(--space-3) var(--space-4) var(--space-3);
  }
  .wl-fs-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
  .wl-fs-back {
    position: absolute;
    top: var(--space-2-5);
    left: var(--space-2-5);
    border: none;
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-3);
    background: rgba(255, 255, 255, 0.14);
    color: var(--text-inverse);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
    cursor: pointer;
  }
  .wl-fs-back:active { opacity: 0.75; }
  .wl-names {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--bg-surface-sunken);
    padding: var(--space-3);
    border-radius: var(--radius-md);
  }
  .wl-name-row {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    display: flex;
    line-height: var(--ui-line-compact);
  }
  .wl-name-row strong { width: var(--space-10); color: var(--text-primary); }
  .wl-section { display: flex; flex-direction: column; gap: var(--space-1-5); }
  .wl-section strong {
    font-size: var(--text-base);
    color: var(--text-primary);
  }
  .wl-insights {
    display: grid;
    gap: var(--space-3);
  }
  .wl-fact-card {
    display: grid;
    gap: var(--space-1-5);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    background: linear-gradient(135deg, rgba(219, 234, 254, 0.45), rgba(255, 255, 255, 0.92));
  }
  .wl-fact-card strong {
    font-size: var(--text-sm);
    color: var(--heading);
  }
  .wl-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
  }
  .wl-metric {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-2-5) var(--space-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
    background: var(--bg-surface-sunken);
  }
  .wl-metric--wide {
    grid-column: 1 / -1;
  }
  .wl-metric-label {
    font-size: var(--text-xs);
    color: var(--nav-text);
    font-weight: var(--ui-weight-bold);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .wl-metric-value {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: var(--ui-weight-semibold);
    line-height: var(--ui-line-compact);
  }
  .wl-beschrijving {
    font-size: var(--text-sm);
    line-height: var(--ui-line-body);
    color: var(--text-secondary);
    margin: 0;
  }
  .wl-spotting { background: var(--color-success-light); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); }
  .wl-spotting-head {
    font-weight: var(--ui-weight-semibold);
    font-size: var(--text-sm);
    margin-bottom: var(--space-1);
    color: var(--text-success);
  }
  .wl-spotting-row {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: 2px 0;
    line-height: var(--ui-line-compact);
  }
  .wl-spot-form { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3); }
  .wl-spot-input {
    min-height: var(--ui-touch-min);
    padding: var(--space-2-5) var(--space-3);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    outline: none;
    transition: border-color var(--duration-normal);
    box-sizing: border-box;
    width: 100%;
  }
  .wl-spot-input:focus { border-color: var(--color-success-base); }
  .wl-locatie-wrap { display: flex; gap: var(--space-2); align-items: center; }
  .wl-loc-input { flex: 1; }
  .wl-loc-btn {
    width: var(--btn-height-compact);
    height: var(--btn-height-compact);
    flex-shrink: 0;
    background: var(--bg-accent-subtle);
    border: 1px solid var(--input-border);
    border-radius: var(--btn-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-accent);
  }
  .wl-loc-btn:disabled { opacity: 0.5; cursor: wait; }
  .spin-icon { width: var(--space-4); height: var(--space-4); animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .wl-spot-btn {
    min-height: var(--ui-touch-min);
    width: 100%;
    gap: var(--space-2);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-base);
    font-weight: var(--ui-weight-bold);
    cursor: pointer;
  }
  .wl-unspot {
    min-height: var(--btn-height-compact);
    width: fit-content;
    padding: 0 var(--space-4);
    background: none;
    border: 1px solid var(--border-default);
    border-radius: var(--btn-radius);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: var(--space-3);
    display: inline-flex;
    align-items: center;
  }
  .wl-unspot:active { border-color: var(--text-error); color: var(--text-error); }
  .wl-links { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .wl-link {
    min-height: var(--btn-height-compact);
    padding: 0 14px;
    border-radius: var(--radius-full);
    border: 1px solid var(--input-border);
    font-size: var(--text-sm);
    text-decoration: none;
    font-weight: var(--ui-weight-semibold);
    display: inline-flex;
    align-items: center;
  }
  .wl-link.wiki { background: var(--bg-accent-subtle); color: var(--text-accent); }
  .wl-link.geluid { background: var(--color-warning-light); color: var(--text-warning); }
  .wl-map-links { margin-top: var(--space-2); }
  .wl-link.maps-google { background: var(--color-success-light); color: var(--text-success); }
  .wl-link.maps-osm { background: var(--bg-surface-sunken); color: var(--text-secondary); }
  .wl-link:active { opacity: 0.7; }

  @media (min-width: 900px) {
    .wl-hoofd {
      gap: 14px;
      padding: 14px var(--space-4);
    }
    .wl-foto,
    .wl-foto-ph {
      width: 70px;
      height: 70px;
      border-radius: var(--radius-lg);
    }
    .wl-naam {
      font-size: var(--text-lg);
    }
    .wl-ster {
      font-size: var(--text-sm);
    }
    .wl-detail {
      padding: 0 var(--space-4) var(--space-4) var(--space-4);
      gap: 18px;
    }
    .wl-grote-beeld {
      height: 320px;
    }
    .wl-name-row strong {
      width: var(--space-12);
    }
    .wl-insights {
      gap: 14px;
    }
  }

  @media (min-width: 1100px) {
    .wl-hoofd {
      gap: var(--space-4);
      padding: var(--space-4) 18px;
    }
    .wl-foto,
    .wl-foto-ph {
      width: 76px;
      height: 76px;
    }
    .wl-detail {
      padding: 0 18px 18px 18px;
      gap: var(--space-5);
    }
    .wl-grote-beeld {
      height: 360px;
    }
    .wl-beschrijving {
      font-size: var(--text-base);
    }
    .wl-metric-value {
      font-size: var(--text-base);
    }
    .wl-spotting-row {
      font-size: var(--text-base);
    }
  }
  
  :global(html.dark) .wl-card { background: var(--card-bg); }
  :global(html.dark) .wl-card.gespot { background: color-mix(in srgb, var(--color-success-dark) 34%, var(--bg-surface)); border-color: var(--color-success-base); }
  :global(html.dark) .wl-naam { color: var(--text-primary); }
  :global(html.dark) .wl-foto-ph { background: var(--bg-interactive-active); }
  :global(html.dark) .wl-detail { border-top-color: var(--border-strong); }
  :global(html.dark) .wl-grote-beeld { background: var(--bg-surface); }
  :global(html.dark) .wl-names { background: var(--bg-surface-raised); }
  :global(html.dark) .wl-fact-card { background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary-700) 30%, transparent), var(--bg-surface-raised)); border-color: var(--border-strong); }
  :global(html.dark) .wl-metric { background: var(--bg-surface-raised); border-color: var(--border-strong); }
  :global(html.dark) .wl-name-row strong { color: var(--text-secondary); }
  :global(html.dark) .wl-name-row { color: var(--text-tertiary); }
  :global(html.dark) .wl-fact-card strong,
  :global(html.dark) .wl-section strong { color: var(--text-secondary); }
  :global(html.dark) .wl-metric-label { color: var(--text-tertiary); }
  :global(html.dark) .wl-metric-value,
  :global(html.dark) .wl-beschrijving { color: var(--text-tertiary); }
  :global(html.dark) .wl-spotting { background: color-mix(in srgb, var(--color-success-dark) 34%, var(--bg-surface)); }
  :global(html.dark) .wl-spotting-head { color: var(--color-success-light); }
  :global(html.dark) .wl-spot-input { background: var(--bg-surface-sunken); border-color: var(--border-strong); color: var(--text-primary); }
  :global(html.dark) .wl-loc-btn { background: var(--bg-accent-subtle); border-color: var(--border-strong); color: var(--text-accent); }
  :global(html.dark) .wl-link.wiki { background: var(--bg-accent-subtle); color: var(--text-accent); }
  :global(html.dark) .wl-link.geluid { background: color-mix(in srgb, var(--color-warning-dark) 34%, var(--bg-surface)); color: var(--color-warning-light); }
  :global(html.dark) .wl-link.maps-google { background: color-mix(in srgb, var(--color-success-dark) 34%, var(--bg-surface)); color: var(--color-success-light); }
  :global(html.dark) .wl-link.maps-osm { background: var(--bg-surface-raised); color: var(--text-secondary); }
</style>




