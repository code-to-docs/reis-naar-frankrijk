<script lang="ts">
  import { onMount } from "svelte";
  import { E } from "$lib/emojis.js";

  let datum = $state("");
  let dagNaam = $state("");
  let weer = $state<any[]>([]);
  let laden = $state(true);
  let fout = $state("");
  let locatieNaam = $state("");
  let isDesktop = $state(false);
  let zichtbareDagen = $state(3);

  const FALLBACK_LAT = 44.5;
  const FALLBACK_LON = 3.5;
  const FALLBACK_NAAM = "Loz\u00E8re";

  // Emoji variabelen (komen nu the E object)

  const weerCodes = {
    0: { emoji: "\u2600\uFE0F", tekst: "Zonnig" },
    1: { emoji: "\u{1F324}\uFE0F", tekst: "Overwegend zonnig" },
    2: { emoji: "\u26C5", tekst: "Half bewolkt" },
    3: { emoji: "\u2601\uFE0F", tekst: "Bewolkt" },
    45: { emoji: "\u{1F32B}\uFE0F", tekst: "Mist" },
    48: { emoji: "\u{1F32B}\uFE0F", tekst: "Rijpmist" },
    51: { emoji: "\u{1F326}\uFE0F", tekst: "Lichte motregen" },
    53: { emoji: "\u{1F326}\uFE0F", tekst: "Motregen" },
    55: { emoji: "\u{1F327}\uFE0F", tekst: "Zware motregen" },
    61: { emoji: "\u{1F326}\uFE0F", tekst: "Lichte regen" },
    63: { emoji: "\u{1F327}\uFE0F", tekst: "Regen" },
    65: { emoji: "\u{1F327}\uFE0F", tekst: "Zware regen" },
    71: { emoji: "\u{1F328}\uFE0F", tekst: "Lichte sneeuw" },
    73: { emoji: "\u{1F328}\uFE0F", tekst: "Sneeuw" },
    75: { emoji: "\u2744\uFE0F", tekst: "Zware sneeuw" },
    80: { emoji: "\u{1F326}\uFE0F", tekst: "Lichte buien" },
    81: { emoji: "\u{1F327}\uFE0F", tekst: "Buien" },
    82: { emoji: "\u26C8\uFE0F", tekst: "Zware buien" },
    95: { emoji: "\u26C8\uFE0F", tekst: "Onweer" },
    96: { emoji: "\u26C8\uFE0F", tekst: "Onweer met hagel" },
    99: { emoji: "\u26C8\uFE0F", tekst: "Zwaar onweer met hagel" },
  };

  function getWeerInfo(code: number) {
    return (weerCodes as any)[code] || { emoji: "\u{1F321}\uFE0F", tekst: "Onbekend" };
  }

  const dagNamen = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
  const maandNamen = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];

  let weergegevenDagen = $derived.by(() => weer.slice(0, zichtbareDagen));

  function weatherCacheKey(lat: number, lon: number) {
    return "weer_v2_" + Math.round(lat * 10) / 10 + "_" + Math.round(lon * 10) / 10;
  }

  function formatDag(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return dagNamen[d.getDay()];
  }

  function formatDatumKort(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.getDate() + " " + maandNamen[d.getMonth()].slice(0, 3);
  }

  function formatTijdKort(isoDate: string | undefined) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  }

  function updateViewportSettings() {
    const w = window.innerWidth;
    isDesktop = w >= 1024;
    zichtbareDagen = w >= 1024 ? 6 : w >= 680 ? 4 : 3;
  }

  async function laadWeer(lat: number, lon: number) {
    const cacheKey = weatherCacheKey(lat, lon);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,windspeed_10m_max,sunrise,sunset&timezone=Europe/Paris&forecast_days=7";

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      timeoutId = null;
      
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      weer = data.daily.time.map((dag: string, i: number) => ({
        datum: dag,
        dagNaam: formatDag(dag),
        datumKort: formatDatumKort(dag),
        weerInfo: getWeerInfo(data.daily.weathercode[i]),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        gevoelMax: Math.round(data.daily.apparent_temperature_max[i]),
        gevoelMin: Math.round(data.daily.apparent_temperature_min[i]),
        neerslagKans: data.daily.precipitation_probability_max[i],
        windMax: Math.round(data.daily.windspeed_10m_max[i]),
        zonsopkomst: formatTijdKort(data.daily.sunrise?.[i]),
        zonsondergang: formatTijdKort(data.daily.sunset?.[i]),
      }));
      laden = false;
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), weer }));
      } catch (e) {}
    } catch (e) {
      // Probeer cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.t < 4 * 3600 * 1000) {
            weer = parsed.weer;
            laden = false;
            return;
          }
        } catch (e) {
          // Corrupted cache, ignore and continue to error state
        }
      }
      fout = "Weer laden mislukt (offline?)";
      laden = false;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async function getLocatieNaam(lat: number, lon: number) {
    const latRnd = Math.round(lat * 100) / 100;
    const lonRnd = Math.round(lon * 100) / 100;
    const cacheKey = "loc_" + latRnd + "_" + lonRnd;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      locatieNaam = cached;
      return;
    }
    
    try {
      const res = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=json&zoom=10&accept-language=nl");
      if (res.ok) {
        const data = await res.json();
        const parts = [];
        if (data.address?.village || data.address?.town || data.address?.city) {
          parts.push(data.address.village || data.address.town || data.address.city);
        }
        if (data.address?.county || data.address?.state) {
          parts.push(data.address.county || data.address.state);
        }
        locatieNaam = parts.join(", ") || "Frankrijk";
        try {
          localStorage.setItem(cacheKey, locatieNaam);
        } catch (e) {}
      }
    } catch (e) {}
  }

  onMount(() => {
    updateViewportSettings();
    const onResize = () => updateViewportSettings();
    window.addEventListener("resize", onResize, { passive: true });

    const nu = new Date();
    dagNaam = dagNamen[nu.getDay()].charAt(0).toUpperCase() + dagNamen[nu.getDay()].slice(1);
    datum = nu.getDate() + " " + maandNamen[nu.getMonth()] + " " + nu.getFullYear();

    let gpsDone = false;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (gpsDone) return;
          gpsDone = true;
          laadWeer(pos.coords.latitude, pos.coords.longitude);
          getLocatieNaam(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          if (gpsDone) return;
          gpsDone = true;
          locatieNaam = FALLBACK_NAAM;
          laadWeer(FALLBACK_LAT, FALLBACK_LON);
        },
        { timeout: 5000, maximumAge: 600000 }
      );
      setTimeout(() => {
        if (!gpsDone) {
          gpsDone = true;
          locatieNaam = FALLBACK_NAAM;
          laadWeer(FALLBACK_LAT, FALLBACK_LON);
        }
      }, 3000);
    } else {
      locatieNaam = FALLBACK_NAAM;
      laadWeer(FALLBACK_LAT, FALLBACK_LON);
    }

    return () => {
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
      <span class="weer-periode">{zichtbareDagen}-daagse verwachting</span>
      {#if locatieNaam}
        <span class="weer-locatie">{E.PIN} {locatieNaam}</span>
      {/if}
    </div>
  </div>

  {#if laden}
    <div class="weer-laden">
      <div class="weer-spinner"></div>
      <span>Weer ophalen...</span>
    </div>
  {:else if fout}
    <div class="weer-fout">{fout}</div>
  {:else if weer.length > 0}
    <div class="weer-dagen">
      {#each weergegevenDagen as dag, i}
        <div class="weer-dag" class:vandaag={i === 0}>
          <div class="weer-dag-naam">{i === 0 ? "Vandaag" : dag.dagNaam.charAt(0).toUpperCase() + dag.dagNaam.slice(1)}</div>
          <div class="weer-dag-datum">{dag.datumKort}</div>
          <div class="weer-emoji">{dag.weerInfo.emoji}</div>
          <div class="weer-beschrijving">{dag.weerInfo.tekst}</div>
          <div class="weer-temps">
            <span class="temp-max">{dag.maxTemp}{E.GRADEN}</span>
            <span class="temp-min">{dag.minTemp}{E.GRADEN}</span>
          </div>
          <div class="weer-extra">
            {#if dag.neerslagKans > 0}
              <span>{E.DRUPPEL} {dag.neerslagKans}%</span>
            {/if}
            <span>{E.WIND} {dag.windMax} km/u</span>
          </div>
          {#if isDesktop}
            <div class="weer-desktop-meta">
              <span>Voelt als {dag.gevoelMax}{E.GRADEN}/{dag.gevoelMin}{E.GRADEN}</span>
              {#if dag.zonsopkomst && dag.zonsondergang}
                <span>☀️ {dag.zonsopkomst} · 🌙 {dag.zonsondergang}</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .datum-header {
    margin-bottom: 10px;
    padding: 2px 2px 0;
  }
  .datum-dag {
    font-size: clamp(1.85rem, 5.4vw, 2.2rem);
    font-weight: 800;
    color: #1a5276;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .weer-card {
    background: var(--card-bg);
    border-radius: 18px;
    padding: 16px 14px 14px;
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
    font-weight: 800;
    font-size: 1.55rem;
    color: #0f172a;
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
  .weer-periode {
    font-size: 0.76rem;
    color: #64748b;
    background: #f1f5f9;
    border-radius: 999px;
    padding: 5px 10px;
    font-weight: 600;
  }
  .weer-locatie {
    font-size: 0.78rem;
    color: #0f4d84;
    background: #e7f0fb;
    padding: 5px 10px;
    border-radius: 999px;
    font-weight: 600;
  }

  .weer-laden {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 20px;
    color: #1565C0;
    font-size: 0.92rem;
  }
  .weer-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #E3F2FD;
    border-top-color: #1565C0;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .weer-fout {
    text-align: center;
    color: #C62828;
    font-size: 0.85rem;
    padding: 14px;
  }

  .weer-dagen {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .weer-dag {
    background: #f8fafc;
    border-radius: 16px;
    padding: 12px 10px 10px;
    text-align: center;
    border: 1.5px solid #e2e8f0;
    transition: border-color 0.2s, background-color 0.2s;
  }
  .weer-dag.vandaag {
    background: #ecf4ff;
    border-color: #2b79c2;
    box-shadow: 0 2px 8px rgba(43, 121, 194, 0.16);
  }
  .weer-dag-naam {
    font-weight: 700;
    font-size: 0.82rem;
    color: #0f172a;
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .weer-dag-datum {
    font-size: 0.78rem;
    color: #475569;
    margin-bottom: 7px;
    font-weight: 500;
  }
  .weer-emoji {
    font-size: 2.2rem;
    line-height: 1;
    margin-bottom: 6px;
  }
  .weer-beschrijving {
    font-size: 0.88rem;
    color: #1f2937;
    margin-bottom: 8px;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.25;
  }
  .weer-temps {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }
  .temp-max {
    font-weight: 800;
    font-size: 2.05rem;
    color: #dd6b20;
    line-height: 1;
  }
  .temp-min {
    font-size: 1.22rem;
    color: #6b7280;
    font-weight: 700;
    align-self: flex-end;
    line-height: 1;
    margin-bottom: 1px;
  }
  .weer-extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 0.9rem;
    color: #111827;
    font-weight: 500;
  }
  .weer-desktop-meta {
    display: none;
  }

  .weer-card.desktop .weer-desktop-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: 8px;
    font-size: 0.78rem;
    color: #475569;
    font-weight: 600;
    line-height: 1.2;
  }

  @media (min-width: 1024px) {
    .datum-dag { font-size: 2.5rem; }
    .weer-card {
      border-radius: 20px;
      padding: 18px 16px 16px;
    }
    .weer-titel {
      font-size: 2rem;
    }
    .weer-periode {
      font-size: 0.82rem;
      padding: 6px 10px;
    }
    .weer-dagen {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 12px;
    }
    .weer-dag {
      padding: 14px 10px 12px;
    }
    .weer-beschrijving {
      min-height: 42px;
      font-size: 0.9rem;
    }
    .temp-max {
      font-size: 2.2rem;
    }
    .temp-min {
      font-size: 1.28rem;
    }
  }

  @media (max-width: 560px) {
    .weer-titel { font-size: 1.45rem; }
    .weer-meta-rij { justify-content: flex-start; }
    .weer-periode {
      order: 2;
    }
    .weer-dagen {
      display: flex;
      overflow-x: auto;
      gap: 10px;
      padding-bottom: 2px;
      scroll-snap-type: x proximity;
    }
    .weer-dag {
      min-width: 150px;
      flex: 0 0 auto;
      scroll-snap-align: start;
    }
  }

  :global(html.dark) .weer-card {
    border-color: #334155;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
  }
</style>
