<script lang="ts">
  import { onMount } from "svelte";
  import { E } from "$lib/emojis.js";
  import type { WeatherAlertsPayload, WeerDag } from "$lib/types.js";
  import { fetchAlerts, fetchLocatieNaam, fetchWeer } from "$lib/api/weatherApi.js";
  import WeerAlerts from "./weer/WeerAlerts.svelte";
  import WeerDagen from "./weer/WeerDagen.svelte";

  let datum = $state("");
  let dagNaam = $state("");
  let weer = $state<WeerDag[]>([]);
  let laden = $state(true);
  let fout = $state("");
  let locatieNaam = $state("");
  let isDesktop = $state(false);
  let zichtbareDagen = $state(3);
  
  let alerts = $state<WeatherAlertsPayload | null>(null);
  let alertsLaden = $state(true);
  let alertsFout = $state("");

  const FALLBACK_LAT = 44.5;
  const FALLBACK_LON = 3.5;
  const FALLBACK_NAAM = "Loz\u00E8re";
  
  let weergegevenDagen = $derived.by(() => weer.slice(0, zichtbareDagen));

  function updateViewportSettings() {
    const w = window.innerWidth;
    isDesktop = w >= 1024;
    zichtbareDagen = w >= 1024 ? 6 : w >= 680 ? 4 : 3;
  }

  onMount(() => {
    updateViewportSettings();
    const onResize = () => updateViewportSettings();
    window.addEventListener("resize", onResize, { passive: true });

    const nu = new Date();
    const dagNamenInit = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
    const maandNamenInit = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
    
    dagNaam = dagNamenInit[nu.getDay()].charAt(0).toUpperCase() + dagNamenInit[nu.getDay()].slice(1);
    datum = nu.getDate() + " " + maandNamenInit[nu.getMonth()] + " " + nu.getFullYear();
    
    const controller = new AbortController();

    async function loadData(lat: number, lon: number, customName?: string) {
      laden = true;
      fout = "";
      locatieNaam = customName || locatieNaam || FALLBACK_NAAM;

      if (!customName) {
        void fetchLocatieNaam(lat, lon, controller.signal).then((naam) => {
          if (naam) locatieNaam = naam;
        });
      }

      try {
        const result = await fetchWeer(lat, lon, controller.signal);
        weer = result;
      } catch (err) {
        fout = err instanceof Error ? err.message : "Weer ophalen mislukt";
      } finally {
        laden = false;
      }
    }

    async function loadAlertsData() {
      try {
        const result = await fetchAlerts(controller.signal);
        if (result) {
          alerts = result;
          alertsFout = "";
        }
      } catch (err) {
        alertsFout = err instanceof Error ? err.message : "Alerts onbeschikbaar";
      } finally {
        alertsLaden = false;
      }
    }

    loadAlertsData();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadData(pos.coords.latitude, pos.coords.longitude),
        () => loadData(FALLBACK_LAT, FALLBACK_LON, FALLBACK_NAAM),
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      loadData(FALLBACK_LAT, FALLBACK_LON, FALLBACK_NAAM);
    }

    return () => {
      controller.abort();
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<div class="datum-header">
  <div class="datum-dag">{dagNaam} {datum}</div>
</div>

<div class="weer-card" class:desktop={isDesktop}>
  <div class="weer-titel-rij">
    <span class="weer-titel">{E.WEER} Weer</span>
    <div class="weer-meta-rij">
      <span class="ui-chip ui-chip--muted weer-chip">{zichtbareDagen}-daagse verwachting</span>
      {#if locatieNaam}
        <span class="ui-chip ui-chip--info weer-chip">{locatieNaam}</span>
      {/if}
    </div>
  </div>

  <WeerAlerts {alerts} {alertsLaden} {alertsFout} />
  
  <WeerDagen {weer} {laden} {fout} {isDesktop} {weergegevenDagen} />
</div>

<style>
  .datum-header {
    margin-bottom: 10px;
    padding: 2px 2px 0;
  }
  .datum-dag {
    font-size: clamp(1.85rem, 5.4vw, 2.2rem);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .weer-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--ui-space-4);
    margin-bottom: 12px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    border: 1px solid var(--border-subtle);
  }
  .weer-titel-rij {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .weer-titel {
    font-weight: var(--ui-weight-heavy);
    font-size: var(--font-size-xl);
    color: var(--heading);
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .weer-meta-rij {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .weer-chip {
    min-height: 28px;
  }
</style>
