<script lang="ts">
  import { onMount } from "svelte";
  import { E } from "$lib/emojis.js";

  let datum = $state("");
  let dagNaam = $state("");
  let weer = $state(null);
  let laden = $state(true);
  let fout = $state("");
  let locatieNaam = $state("");

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

  function formatDag(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return dagNamen[d.getDay()];
  }

  function formatDatumKort(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.getDate() + " " + maandNamen[d.getMonth()].slice(0, 3);
  }

  async function laadWeer(lat: number, lon: number) {
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe/Paris&forecast_days=3";
      
      const res = await Promise.race([
        fetch(url).catch(e => { throw e; }),
        new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), 5000))
      ]) as Response;
      
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      weer = data.daily.time.map((dag: string, i: number) => ({
        datum: dag,
        dagNaam: formatDag(dag),
        datumKort: formatDatumKort(dag),
        weerInfo: getWeerInfo(data.daily.weathercode[i]),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        neerslagKans: data.daily.precipitation_probability_max[i],
        windMax: Math.round(data.daily.windspeed_10m_max[i]),
      }));
      laden = false;
      const cacheKey = "weer_" + Math.round(lat*10)/10 + "_" + Math.round(lon*10)/10;
      localStorage.setItem(cacheKey, JSON.stringify({t: Date.now(), weer}));
    } catch (e) {
      // Probeer cache
      const cacheKey = "weer_" + Math.round(lat*10)/10 + "_" + Math.round(lon*10)/10;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < 4 * 3600 * 1000) {
          weer = parsed.weer;
          laden = false;
          return;
        }
      }
      fout = "Weer laden mislukt (offline?)";
      laden = false;
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
        localStorage.setItem(cacheKey, locatieNaam);
      }
    } catch (e) {}
  }

  onMount(() => {
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
  });
</script>

<div class="datum-header">
  <div class="datum-dag">{dagNaam}</div>
  <div class="datum-volledig">{datum}</div>
</div>

<div class="weer-card">
  <div class="weer-titel-rij">
    <span class="weer-titel">{E.WEER} Weer</span>
    {#if locatieNaam}
      <span class="weer-locatie">{E.PIN} {locatieNaam}</span>
    {/if}
  </div>

  {#if laden}
    <div class="weer-laden">
      <div class="weer-spinner"></div>
      <span>Weer ophalen...</span>
    </div>
  {:else if fout}
    <div class="weer-fout">{fout}</div>
  {:else if weer}
    <div class="weer-dagen">
      {#each weer as dag, i}
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
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .datum-header {
    text-align: center;
    margin-bottom: 12px;
    padding-top: 4px;
  }
  .datum-dag {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a5276;
  }
  .datum-volledig {
    font-size: 0.95rem;
    color: #666;
    margin-top: 2px;
  }

  .weer-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }
  .weer-titel-rij {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 6px;
  }
  .weer-titel {
    font-weight: 700;
    font-size: 1rem;
    color: #1a5276;
  }
  .weer-locatie {
    font-size: 0.75rem;
    color: #1976D2;
    background: #E3F2FD;
    padding: 4px 10px;
    border-radius: 12px;
  }

  .weer-laden {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 20px;
    color: #1565C0;
    font-size: 0.9rem;
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
    padding: 16px;
  }

  .weer-dagen {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .weer-dag {
    background: #f8f9fa;
    border-radius: 14px;
    padding: 12px 8px;
    text-align: center;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .weer-dag.vandaag {
    background: #EBF5FB;
    border-color: #1a5276;
  }
  .weer-dag-naam {
    font-weight: 700;
    font-size: 0.8rem;
    color: #1a5276;
    margin-bottom: 2px;
  }
  .weer-dag-datum {
    font-size: 0.7rem;
    color: #999;
    margin-bottom: 8px;
  }
  .weer-emoji {
    font-size: 2rem;
    line-height: 1;
    margin-bottom: 6px;
  }
  .weer-beschrijving {
    font-size: 0.7rem;
    color: #555;
    margin-bottom: 8px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .weer-temps {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .temp-max {
    font-weight: 700;
    font-size: 1.15rem;
    color: #D84315;
  }
  .temp-min {
    font-size: 0.9rem;
    color: #90A4AE;
    align-self: flex-end;
  }
  .weer-extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    color: #777;
  }
</style>