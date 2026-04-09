import { cacheManager } from "$lib/utils/cacheManager.js";
import type { WeatherAlertsPayload, WeerDag } from "$lib/types.js";

const WEATHER_CACHE_MAX_AGE = 4 * 3600 * 1000;
const ALERTS_CACHE_MAX_AGE = 30 * 60 * 1000;
const GEO_CACHE_MAX_AGE = 30 * 24 * 3600 * 1000;

const weerCodes: Record<number, { emoji: string; tekst: string }> = {
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
  99: { emoji: "\u26C8\uFE0F", tekst: "Zwaar onweer met hagel" }
};

const dagNamen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const maandNamen = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

type OpenMeteoDailyResponse = {
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
    sunrise?: string[];
    sunset?: string[];
  };
};

type NominatimResponse = {
  address?: {
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
  };
};

function getWeerInfo(code: number) {
  return weerCodes[code] || { emoji: "\u{1F321}\uFE0F", tekst: "Onbekend" };
}

function formatDag(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return dagNamen[d.getDay()];
}

function formatDatumKort(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} ${maandNamen[d.getMonth()].slice(0, 3)}`;
}

function formatTijdKort(isoDate: string | undefined) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

function createRequestSignal(parentSignal?: AbortSignal, timeoutMs?: number) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const abortFromParent = () => controller.abort();

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      parentSignal.addEventListener("abort", abortFromParent, { once: true });
    }
  }

  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", abortFromParent);
      }
    }
  };
}

export async function fetchAlerts(signal?: AbortSignal): Promise<WeatherAlertsPayload | null> {
  const cacheKey = "weer_alerts_v2";
  const request = createRequestSignal(signal, 6000);

  try {
    const res = await fetch("/api/weather-alerts", {
      signal: request.signal,
      headers: { "cache-control": "no-cache" }
    });

    if (!res.ok) throw new Error("alerts-fail");

    const data = (await res.json()) as WeatherAlertsPayload;
    cacheManager.set(cacheKey, data);
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    const cached = cacheManager.get<WeatherAlertsPayload>(cacheKey, ALERTS_CACHE_MAX_AGE);
    if (cached) return cached;

    throw new Error("Alerts tijdelijk niet beschikbaar");
  } finally {
    request.cleanup();
  }
}

export async function fetchWeer(lat: number, lon: number, signal?: AbortSignal): Promise<WeerDag[]> {
  const cacheKey = `weer_v2_${Math.round(lat * 10) / 10}_${Math.round(lon * 10) / 10}`;
  const request = createRequestSignal(signal, 5000);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,windspeed_10m_max,sunrise,sunset&timezone=Europe/Paris&forecast_days=7`;
    const res = await fetch(url, { signal: request.signal });
    if (!res.ok) throw new Error("weather-fail");

    const data = (await res.json()) as OpenMeteoDailyResponse;
    const dagen: WeerDag[] = data.daily.time.map((dag, index) => ({
      datum: dag,
      dagNaam: formatDag(dag),
      datumKort: formatDatumKort(dag),
      weerInfo: getWeerInfo(data.daily.weathercode[index]),
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      gevoelMax: Math.round(data.daily.apparent_temperature_max[index]),
      gevoelMin: Math.round(data.daily.apparent_temperature_min[index]),
      neerslagKans: data.daily.precipitation_probability_max[index],
      windMax: Math.round(data.daily.windspeed_10m_max[index]),
      zonsopkomst: formatTijdKort(data.daily.sunrise?.[index]),
      zonsondergang: formatTijdKort(data.daily.sunset?.[index])
    }));

    cacheManager.set(cacheKey, dagen);
    return dagen;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return [];
    }

    const cached = cacheManager.get<WeerDag[]>(cacheKey, WEATHER_CACHE_MAX_AGE);
    if (cached) return cached;

    throw new Error("Weer laden mislukt (offline?)");
  } finally {
    request.cleanup();
  }
}

export async function fetchLocatieNaam(lat: number, lon: number, signal?: AbortSignal): Promise<string> {
  const cacheKey = `loc_${Math.round(lat * 100) / 100}_${Math.round(lon * 100) / 100}`;
  const cached = cacheManager.get<string>(cacheKey, GEO_CACHE_MAX_AGE);
  if (cached) return cached;

  const request = createRequestSignal(signal, 3000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=nl`,
      { signal: request.signal }
    );

    if (!res.ok) return "";

    const data = (await res.json()) as NominatimResponse;
    const parts: string[] = [];

    if (data.address?.village || data.address?.town || data.address?.city) {
      parts.push(data.address.village || data.address.town || data.address.city || "");
    }
    if (data.address?.county || data.address?.state) {
      parts.push(data.address.county || data.address.state || "");
    }

    const locatieNaam = parts.filter(Boolean).join(", ") || "Frankrijk";
    cacheManager.set(cacheKey, locatieNaam);
    return locatieNaam;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "";
    }

    return "";
  } finally {
    request.cleanup();
  }
}
