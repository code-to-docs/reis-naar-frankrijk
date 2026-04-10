import type { Gerecht } from "$lib/types.js";

export type Coords = { lat: number; lon: number };
export type StreekLocatie = { naam: string; lat: number; lon: number };

export const TIP_MAX_AFSTAND_KM = 20;
export const REGIO_DETECTIE_MAX_KM = 70;
export const CHECKS_QUERY_CHUNK_SIZE = 10;

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function afstandKm(van: Coords, naar: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(naar.lat - van.lat);
  const dLon = toRad(naar.lon - van.lon);
  const lat1 = toRad(van.lat);
  const lat2 = toRad(naar.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

export function dichtstbijzijndeLocatie(
  coords: Coords,
  locaties: StreekLocatie[]
): { locatie: StreekLocatie; afstand: number } | null {
  let best: { locatie: StreekLocatie; afstand: number } | null = null;
  for (const locatie of locaties) {
    const afstand = afstandKm(coords, { lat: locatie.lat, lon: locatie.lon });
    if (!best || afstand < best.afstand) {
      best = { locatie, afstand };
    }
  }
  return best;
}

export function bepaalHuidigeRegio(
  coords: Coords,
  streekLocaties: Record<string, StreekLocatie[]>
): string | null {
  let bestRegio: string | null = null;
  let bestAfstand = Number.POSITIVE_INFINITY;

  for (const [regio, locaties] of Object.entries(streekLocaties)) {
    if (!Array.isArray(locaties) || locaties.length === 0) continue;
    const dichtbij = dichtstbijzijndeLocatie(coords, locaties);
    if (!dichtbij) continue;
    if (dichtbij.afstand < bestAfstand) {
      bestAfstand = dichtbij.afstand;
      bestRegio = regio;
    }
  }

  if (!bestRegio || bestAfstand > REGIO_DETECTIE_MAX_KM) return null;
  return bestRegio;
}

export function gerechtVoorFranziToegestaan(gerecht: Gerecht, isFranzi: boolean): boolean {
  if (!isFranzi) return true;
  return Boolean(gerecht.vegetarisch || gerecht.vis);
}

export function gerechtBinnen20Km(
  gerecht: Gerecht,
  coords: Coords,
  regio: string,
  streekLocaties: Record<string, StreekLocatie[]>
): boolean {
  if (!Array.isArray(gerecht.streken) || !gerecht.streken.includes(regio)) return false;

  const regioLocaties = streekLocaties[regio] || [];
  if (!regioLocaties.length) return false;

  return regioLocaties.some((locatie) =>
    afstandKm(coords, { lat: locatie.lat, lon: locatie.lon }) <= TIP_MAX_AFSTAND_KM
  );
}

export async function getCurrentCoordsWithMessage(): Promise<{ coords: Coords | null; error: string }> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return { coords: null, error: "GPS wordt niet ondersteund op dit apparaat." };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          },
          error: ""
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ coords: null, error: "GPS-toegang geweigerd. Zet locatie aan voor regionale dagtips." });
          return;
        }
        if (error.code === error.TIMEOUT) {
          resolve({ coords: null, error: "GPS-timeout. Probeer opnieuw op een plek met beter bereik." });
          return;
        }
        resolve({ coords: null, error: "Kon je GPS-locatie niet ophalen." });
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  });
}
