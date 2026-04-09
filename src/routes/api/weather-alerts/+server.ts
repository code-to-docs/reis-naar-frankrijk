import { json } from "@sveltejs/kit";

const CACHE_TTL_MS = 10 * 60 * 1000;
const METEO_FRANCE_SESSION_URL = "https://vigilance.meteofrance.fr/fr/ariege";
const METEO_FRANCE_API_BASE = "https://rwg.meteofrance.com/wsft/v3";

const DEPARTMENTS = [
  { code: "48", name: "Loz\u00E8re", slug: "lozere" },
  { code: "15", name: "Cantal", slug: "cantal" },
  { code: "09", name: "Ari\u00E8ge", slug: "ariege" }
] as const;

const VIGILANCE_LEVELS: Record<number, { label: string; tone: string }> = {
  1: { label: "Groen", tone: "green" },
  2: { label: "Geel", tone: "yellow" },
  3: { label: "Oranje", tone: "orange" },
  4: { label: "Rood", tone: "red" }
};

const PHENOMENON_LABELS: Record<string, string> = {
  "1": "Wind",
  "2": "Regen / overstroming",
  "3": "Onweer",
  "4": "Hoogwater",
  "5": "Sneeuw / ijzel",
  "6": "Hitte",
  "7": "Koude",
  "8": "Lawines",
  "9": "Hoge golven"
};

let cachedPayload:
  | {
      expiresAt: number;
      payload: WeatherAlertsPayload;
    }
  | null = null;

type MeteoFranceWarningResponse = {
  update_time?: number | null;
  end_validity_time?: number | null;
  color_max?: number | null;
  phenomenons_items?: Array<{
    phenomenon_id?: string | number | null;
    phenomenon_max_color_id?: number | null;
  }>;
};

type OfficialAlert = {
  source: "meteo-france";
  sourceLabel: string;
  regionCode: string;
  regionName: string;
  level: number;
  levelLabel: string;
  tone: string;
  active: boolean;
  updatedAt: string | null;
  validUntil: string | null;
  activePhenomena: Array<{
    id: string;
    label: string;
    level: number;
    levelLabel: string;
    tone: string;
  }>;
  url: string;
};

type WeatherAlertsPayload = {
  generatedAt: string;
  officialAlerts: OfficialAlert[];
  summary: {
    hasOfficialAlert: boolean;
    highestLevel: number;
  };
  sources: {
    meteoFranceUrl: string;
  };
};

export async function GET({ fetch }) {
  if (cachedPayload && cachedPayload.expiresAt > Date.now()) {
    return json(cachedPayload.payload, {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=1800"
      }
    });
  }

  try {
    const officialAlerts = await fetchOfficialAlerts(fetch);

    const payload: WeatherAlertsPayload = {
      generatedAt: new Date().toISOString(),
      officialAlerts,
      summary: {
        hasOfficialAlert: officialAlerts.some((alert) => alert.active),
        highestLevel: officialAlerts.reduce((max, alert) => Math.max(max, alert.level), 1)
      },
      sources: {
        meteoFranceUrl: "https://vigilance.meteofrance.fr/fr"
      }
    };

    cachedPayload = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload
    };

    return json(payload, {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=1800"
      }
    });
  } catch {
    if (cachedPayload) {
      return json(cachedPayload.payload, {
        headers: {
          "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=900"
        }
      });
    }

    return json(
      {
        message: "Weather alerts konden niet worden opgehaald."
      },
      { status: 503 }
    );
  }
}

async function fetchOfficialAlerts(fetchFn: typeof fetch): Promise<OfficialAlert[]> {
  const token = await fetchMeteoFranceToken(fetchFn);

  return Promise.all(
    DEPARTMENTS.map(async (department) => {
      const response = await fetchFn(
        `${METEO_FRANCE_API_BASE}/warning/full?domain=${department.code}&lang=fr`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Origin: "https://vigilance.meteofrance.fr",
            Referer: METEO_FRANCE_SESSION_URL
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Meteo-France warning/full failed with ${response.status}`);
      }

      const data = (await response.json()) as MeteoFranceWarningResponse;
      const level = normalizeLevel(data.color_max);
      const activePhenomena = (data.phenomenons_items ?? [])
        .map((item) => {
          const phenomenonId = String(item.phenomenon_id ?? "");
          const phenomenonLevel = normalizeLevel(item.phenomenon_max_color_id);
          const phenomenonMeta = VIGILANCE_LEVELS[phenomenonLevel];

          return {
            id: phenomenonId,
            label: PHENOMENON_LABELS[phenomenonId] ?? `Fenomeen ${phenomenonId}`,
            level: phenomenonLevel,
            levelLabel: phenomenonMeta.label,
            tone: phenomenonMeta.tone
          };
        })
        .filter((item) => item.level >= 2);

      return {
        source: "meteo-france",
        sourceLabel: "M\u00E9t\u00E9o-France Vigilance",
        regionCode: department.code,
        regionName: department.name,
        level,
        levelLabel: VIGILANCE_LEVELS[level].label,
        tone: VIGILANCE_LEVELS[level].tone,
        active: level >= 2,
        updatedAt: toIsoTimestamp(data.update_time),
        validUntil: toIsoTimestamp(data.end_validity_time),
        activePhenomena,
        url: `https://vigilance.meteofrance.fr/fr/${department.slug}`
      } satisfies OfficialAlert;
    })
  );
}

async function fetchMeteoFranceToken(fetchFn: typeof fetch): Promise<string> {
  const response = await fetchFn(METEO_FRANCE_SESSION_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Meteo-France session page failed with ${response.status}`);
  }

  const anyHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookieHeader =
    (typeof anyHeaders.getSetCookie === "function" ? anyHeaders.getSetCookie().join("; ") : "") ||
    response.headers.get("set-cookie") ||
    "";

  const cookieMatch = setCookieHeader.match(/mfsession=([^;,\s]+)/);
  if (!cookieMatch?.[1]) {
    throw new Error("Meteo-France session token ontbreekt.");
  }

  return decodeMeteoFranceSession(cookieMatch[1]);
}

function normalizeLevel(level: number | null | undefined) {
  if (!level || !(level in VIGILANCE_LEVELS)) return 1;
  return level;
}

function toIsoTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

function decodeMeteoFranceSession(encodedSession: string) {
  const decoded = decodeURIComponent(encodedSession);
  return decoded.replace(/[a-zA-Z]/g, (character) => {
    const base = character <= "Z" ? 65 : 97;
    return String.fromCharCode(base + ((character.charCodeAt(0) - base + 13) % 26));
  });
}
