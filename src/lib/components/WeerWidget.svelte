<script>
  import { onMount } from 'svelte';

  let datum = $state('');
  let dagNaam = $state('');
  let weer = $state(null);
  let laden = $state(true);
  let fout = $state('');
  let locatieNaam = $state('');

  const FALLBACK_LAT = 44.5;
  const FALLBACK_LON = 3.5;
  const FALLBACK_NAAM = 'Lozère';

  const weerCodes = {
    0: { emoji: '☀️', tekst: 'Zonnig' },
    1: { emoji: '🌤️', tekst: 'Overwegend zonnig' },
    2: { emoji: '⛅', tekst: 'Half bewolkt' },
    3: { emoji: '☁️', tekst: 'Bewolkt' },
    45: { emoji: '🌫️', tekst: 'Mist' },
    48: { emoji: '🌫️', tekst: 'Rijpmist' },
    51: { emoji: '🌦️', tekst: 'Lichte motregen' },
    53: { emoji: '🌦️', tekst: 'Motregen' },
    55: { emoji: '🌧️', tekst: 'Zware motregen' },
    56: { emoji: '🌧️', tekst: 'Aanvriezende motregen' },
    57: { emoji: '🌧️', tekst: 'Zware aanvriezende motregen' },
    61: { emoji: '🌦️', tekst: 'Lichte regen' },
    63: { emoji: '🌧️', tekst: 'Regen' },
    65: { emoji: '🌧️', tekst: 'Zware regen' },
    66: { emoji: '🧊', tekst: 'Aanvriezende regen' },
    67: { emoji: '🧊', tekst: 'Zware aanvriezende regen' },
    71: { emoji: '🌨️', tekst: 'Lichte sneeuw' },
    73: { emoji: '🌨️', tekst: 'Sneeuw' },
    75: { emoji: '❄️', tekst: 'Zware sneeuw' },
    77: { emoji: '❄️', tekst: 'Sneeuwkorrels' },
    80: { emoji: '🌦️', tekst: 'Lichte buien' },
    81: { emoji: '🌧️', tekst: 'Buien' },
    82: { emoji: '⛈️', tekst: 'Zware buien' },
    85: { emoji: '🌨️', tekst: 'Lichte sneeuwbuien' },
    86: { emoji: '❄️', tekst: 'Zware sneeuwbuien' },
    95: { emoji: '⛈️', tekst: 'Onweer' },
    96: { emoji: '⛈️', tekst: 'Onweer met hagel' },
    99: { emoji: '⛈️', tekst: 'Zwaar onweer met hagel' },
  };

  function getWeerInfo(code) {
    return weerCodes[code] || { emoji: '🌡️', tekst: 'Onbekend' };
  }

  const dagNamen = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const maandNamen = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  function formatDatum(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return dagNamen[d.getDay()];
  }

  function formatDatumKort(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDate() + ' ' + maandNamen[d.getMonth()].slice(0, 3);
  }

  async function laadWeer(lat, lon) {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe/Paris&forecast_days=3';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weer ophalen mislukt');

      const data = await res.json();

      weer = data.daily.time.map((dag, i) => ({
        datum: dag,
        dagNaam: formatDatum(dag),
        datumKort: formatDatumKort(dag),
        weercode: data.daily.weathercode[i],
        weerInfo: getWeerInfo(data.daily.weathercode[i]),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        neerslagKans: data.daily.precipitation_probability_max[i],
        windMax: Math.round(data.daily.windspeed_10m_max[i]),
      }));

      laden = false;
    } catch (e) {
      fout = 'Weer laden mislukt';
      laden = false;
    }
  }

  async function getLocatieNaam(lat, lon) {
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&zoom=10&accept-language=nl');
      if (res.ok) {
        const data = await res.json();
        const parts = [];
        if (data.address?.village || data.address?.town || data.address?.city) {
          parts.push(data.address.village || data.address.town || data.address.city);
        }
        if (data.address?.county || data.address?.state) {
          parts.push(data.address.county || data.address.state);
        }
        locatieNaam = parts.join(', ') || 'Frankrijk';
      }
    } catch (e) {
      locatieNaam = '';
    }
  }

  onMount(() => {
    const nu = new Date();
    dagNaam = dagNamen[nu.getDay()].charAt(0).toUpperCase() + dagNamen[nu.getDay()].slice(1);
    datum = nu.getDate() + ' ' + maandNamen[nu.getMonth()] + ' ' + nu.getFullYear();

    // Probeer GPS met korte timeout, val snel terug op fallback
    let gpsDone = false;

    if ('geolocation' in navigator) {
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

      // Extra fallback: als GPS na 3 sec nog niet reageert, laad alvast
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

<div class="weer-widget">
  <div class="weer-titel-rij">
    <span class="weer-titel">🌤️ Weer</span>
    {#if locatieNaam}
      <span class="weer-locatie">📍 {locatieNaam}</span>
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
          <div class="weer-dag-naam">{i === 0 ? 'Vandaag' : dag.dagNaam.charAt(0).toUpperCase() + dag.dagNaam.slice(1)}</div>
          <div class="weer-dag-datum">{dag.datumKort}</div>
          <div class="weer-emoji">{dag.weerInfo.emoji}</div>
          <div class="weer-beschrijving">{dag.weerInfo.tekst}</div>
          <div class="weer-temps">
            <span class="temp-max">{dag.maxTemp}°</span>
            <span class="temp-min">{dag.minTemp}°</span>
          </div>
          <div class="weer-details">
            {#if dag.neerslagKans > 0}
              <span class="weer-detail">💧 {dag.neerslagKans}%</span>
            {/if}
            <span class="weer-detail">💨 {dag.windMax} km/u</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .datum-header {
    text-align: center;
    margin-bottom: 16px;
  }
  .datum-dag {
    font-size: 1.6rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }
  .datum-volledig {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
  }

  .weer-widget {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
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
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.95);
  }
  .weer-locatie {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.15);
    padding: 3px 10px;
    border-radius: 12px;
  }

  .weer-laden {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
  .weer-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .weer-fout {
    text-align: center;
    color: #FF8A80;
    font-size: 0.85rem;
    padding: 16px;
  }

  .weer-dagen {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .weer-dag {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 12px 8px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .weer-dag.vandaag {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  .weer-dag-naam {
    font-weight: 700;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 2px;
  }
  .weer-dag-datum {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
  }
  .weer-emoji {
    font-size: 2rem;
    line-height: 1;
    margin-bottom: 6px;
  }
  .weer-beschrijving {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .weer-temps {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .temp-max {
    font-weight: 700;
    font-size: 1.1rem;
    color: #FFD54F;
  }
  .temp-min {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
  }
  .weer-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .weer-detail {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
  }
</style>
