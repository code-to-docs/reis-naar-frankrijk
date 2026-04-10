import type { Gerecht } from "$lib/types.js";

type FotoResultaat = { thumb: string; full: string } | { retry: true } | null;
type GerechtFotoResultaat = { id: string; thumb: string; full: string } | { id: string; retry: true } | null;

type WikipediaPage = {
  title?: string;
  index?: number;
  thumbnail?: { source?: string };
  original?: { source?: string };
  extract?: string;
  categories?: { title?: string }[];
};

type WikipediaSearchResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
};

type CommonsImageInfo = {
  thumburl?: string;
  url?: string;
  extmetadata?: Record<string, { value?: string }>;
};

type CommonsPage = {
  title?: string;
  index?: number;
  imageinfo?: CommonsImageInfo[];
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
};

let nextRequestAt = 0;
const MIN_SCORE = 5.8;
const SEARCH_DELAY_MS = 350;
const WIKI_LIMIT = 6;
const COMMONS_LIMIT = 8;

const STOPWORDS = new Set([
  "de",
  "des",
  "du",
  "d",
  "la",
  "le",
  "les",
  "au",
  "aux",
  "et",
  "van",
  "het",
  "een",
  "the",
  "and",
  "sur",
  "avec",
  "pour"
]);

const NEGATIVE_HINTS = [
  "commune",
  "municipality",
  "village",
  "city",
  "town",
  "department",
  "region",
  "landscape",
  "panorama",
  "mountain",
  "valley",
  "river",
  "map",
  "carte",
  "flag",
  "blason",
  "armoiries",
  "coat of arms",
  "logo",
  "church",
  "cathedral",
  "monument"
];

const BASE_FOOD_HINTS = [
  "food",
  "dish",
  "meal",
  "cuisine",
  "recipe",
  "plat",
  "specialite",
  "gastronomy",
  "gastronomie"
];

const HINTS_BY_SOORT: Record<string, string[]> = {
  hoofdgerecht: ["main course", "main dish", "potato", "meat", "stew", "traditional food"],
  soep_stoof: ["soup", "stew", "broth", "ragout"],
  streetfood: ["street food", "snack", "pancake", "crepe"],
  kaas: ["cheese", "fromage", "dairy"],
  drank: ["drink", "boisson", "beverage", "wine", "beer", "liqueur", "aperitif", "cocktail"],
  dessert: ["dessert", "sweet", "pastry", "cake", "tart", "confectionery"],
  koek_cake: ["cake", "biscuit", "cookie", "pastry", "tart", "sweet"]
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitedFetch(url: string, init?: RequestInit) {
  const now = Date.now();
  const waitMs = Math.max(0, nextRequestAt - now);
  nextRequestAt = now + waitMs + SEARCH_DELAY_MS;

  if (waitMs > 0) {
    await sleep(waitMs);
  }

  return fetch(url, init);
}

function normalizeText(text: string): string {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function stripHtml(value: string): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNamePhrases(gerecht: Gerecht): string[] {
  return unique([normalizeText(gerecht.naam), normalizeText(gerecht.frans)]);
}

function getNameTokens(gerecht: Gerecht): string[] {
  return unique([
    ...tokenize(gerecht.naam),
    ...tokenize(gerecht.frans)
  ]);
}

function getFoodHints(gerecht: Gerecht): string[] {
  const soortHints = HINTS_BY_SOORT[gerecht.soort] || [];
  return unique([...BASE_FOOD_HINTS, ...soortHints].map(normalizeText));
}

type MatchScore = {
  score: number;
  phraseHits: number;
  tokenHits: number;
  foodHits: number;
  negativeHits: number;
};

function scoreCandidate(gerecht: Gerecht, title: string, details: string): MatchScore {
  const haystack = normalizeText(`${title} ${details}`);
  const phrases = getNamePhrases(gerecht);
  const tokens = getNameTokens(gerecht);
  const foodHints = getFoodHints(gerecht);

  let score = 0;
  let phraseHits = 0;
  let tokenHits = 0;
  let foodHits = 0;
  let negativeHits = 0;

  for (const phrase of phrases) {
    if (phrase && haystack.includes(phrase)) {
      phraseHits += 1;
      score += 4.4;
    }
  }

  for (const token of tokens) {
    if (token && haystack.includes(token)) {
      tokenHits += 1;
      score += 1.3;
    }
  }

  if (tokenHits >= 2) score += 1.7;
  if (phraseHits >= 2) score += 1.4;

  for (const foodHint of foodHints) {
    if (foodHint && haystack.includes(foodHint)) {
      foodHits += 1;
    }
  }

  score += Math.min(foodHits, 4) * 1.1;

  for (const hint of NEGATIVE_HINTS) {
    const normalizedHint = normalizeText(hint);
    if (normalizedHint && haystack.includes(normalizedHint)) {
      negativeHits += 1;
      score -= 2.5;
    }
  }

  const normalizedTitle = normalizeText(title);
  if (
    normalizedTitle.includes("logo") ||
    normalizedTitle.includes("flag") ||
    normalizedTitle.includes("map") ||
    normalizedTitle.includes("blason") ||
    normalizedTitle.includes("armoiries")
  ) {
    score -= 6;
  }

  if (phraseHits === 0 && tokenHits === 0) {
    score -= 4;
  }

  return { score, phraseHits, tokenHits, foodHits, negativeHits };
}

function isReliableMatch(gerecht: Gerecht, match: MatchScore): boolean {
  if (match.score < MIN_SCORE) return false;
  if (match.phraseHits === 0 && match.tokenHits < 2) return false;
  if (match.foodHits >= 1) return true;

  const strictKinds = new Set(["kaas", "drank", "dessert", "koek_cake"]);
  if (strictKinds.has(gerecht.soort)) return false;

  return match.phraseHits >= 1 && match.tokenHits >= 1 && match.negativeHits === 0 && match.score >= MIN_SCORE + 0.7;
}

function getCommonsMetaText(imageInfo: CommonsImageInfo): string {
  const ext = imageInfo.extmetadata || {};
  return Object.values(ext)
    .map((entry) => stripHtml(entry?.value || ""))
    .filter(Boolean)
    .join(" ");
}

export async function zoekWikipediaFoto(term: string, gerecht: Gerecht): Promise<FotoResultaat> {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: term,
      gsrlimit: String(WIKI_LIMIT),
      prop: "pageimages|info|extracts|categories",
      piprop: "thumbnail|original",
      pithumbsize: "900",
      inprop: "url",
      exintro: "1",
      explaintext: "1",
      exchars: "240",
      clshow: "!hidden",
      cllimit: "20",
      format: "json",
      origin: "*"
    });

    const res = await rateLimitedFetch(`https://fr.wikipedia.org/w/api.php?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });

    if (res.status === 429) return { retry: true };
    if (!res.ok) return null;

    const data = (await res.json()) as WikipediaSearchResponse;
    const pages = Object.values(data.query?.pages || {});

    let best: { score: MatchScore; thumb: string; full: string } | null = null;

    for (const page of pages) {
      const thumb = page.thumbnail?.source || page.original?.source || "";
      const full = page.original?.source || page.thumbnail?.source || "";
      if (!thumb && !full) continue;

      const catText = (page.categories || [])
        .map((category) => category.title || "")
        .join(" ");
      const details = `${page.extract || ""} ${catText}`;
      const score = scoreCandidate(gerecht, page.title || "", details);

      if (!best || score.score > best.score.score) {
        best = { score, thumb: thumb || full, full: full || thumb };
      }
    }

    if (!best) return null;
    if (!isReliableMatch(gerecht, best.score)) return null;

    return { thumb: best.thumb, full: best.full };
  } catch {
    return null;
  }
}

export async function zoekCommonsFoto(term: string, gerecht: Gerecht): Promise<FotoResultaat> {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: term,
      gsrnamespace: "6",
      gsrlimit: String(COMMONS_LIMIT),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "900",
      format: "json",
      origin: "*"
    });

    const res = await rateLimitedFetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });

    if (res.status === 429) return { retry: true };
    if (!res.ok) return null;

    const data = (await res.json()) as CommonsSearchResponse;
    const pages = Object.values(data.query?.pages || {});

    let best: { score: MatchScore; thumb: string; full: string } | null = null;

    for (const page of pages) {
      const imageInfo = page.imageinfo?.[0];
      if (!imageInfo) continue;

      const thumb = imageInfo.thumburl || imageInfo.url || "";
      const full = imageInfo.url || imageInfo.thumburl || "";
      if (!thumb && !full) continue;

      const details = getCommonsMetaText(imageInfo);
      const score = scoreCandidate(gerecht, page.title || "", details);

      if (!best || score.score > best.score.score) {
        best = { score, thumb: thumb || full, full: full || thumb };
      }
    }

    if (!best) return null;
    if (!isReliableMatch(gerecht, best.score)) return null;

    return { thumb: best.thumb, full: best.full };
  } catch {
    return null;
  }
}

export function maakFotoZoektermen(gerecht: Gerecht): string[] {
  const termen = [gerecht.frans, gerecht.naam];

  if (gerecht.soort === "kaas") {
    termen.push(`fromage ${gerecht.naam}`);
    termen.push(`fromage ${gerecht.frans}`);
    termen.push(`${gerecht.naam} cheese`);
  } else if (gerecht.soort === "drank") {
    termen.push(`${gerecht.frans} boisson`);
    termen.push(`${gerecht.naam} aperitif`);
    termen.push(`${gerecht.naam} drink`);
  } else if (gerecht.soort === "dessert" || gerecht.soort === "koek_cake") {
    termen.push(`${gerecht.frans} dessert`);
    termen.push(`${gerecht.naam} gateau`);
    termen.push(`${gerecht.naam} cake`);
  } else if (gerecht.soort === "hoofdgerecht" || gerecht.soort === "soep_stoof" || gerecht.soort === "streetfood") {
    termen.push(`${gerecht.frans} cuisine`);
    termen.push(`${gerecht.naam} recette`);
    termen.push(`${gerecht.naam} food`);
  }

  return [...new Set(termen.map((term) => String(term || "").trim()).filter(Boolean))];
}

export async function laadEnkeleFotoVoorGerecht(gerecht: Gerecht): Promise<GerechtFotoResultaat> {
  const zoektermen = maakFotoZoektermen(gerecht);

  for (const zoekterm of zoektermen) {
    const wikiFoto = await zoekWikipediaFoto(zoekterm, gerecht);
    if (wikiFoto && "retry" in wikiFoto) return { id: gerecht.id, retry: true };
    if (wikiFoto && "thumb" in wikiFoto) {
      return { id: gerecht.id, thumb: wikiFoto.thumb, full: wikiFoto.full };
    }

    const commonsFoto = await zoekCommonsFoto(zoekterm, gerecht);
    if (commonsFoto && "retry" in commonsFoto) return { id: gerecht.id, retry: true };
    if (commonsFoto && "thumb" in commonsFoto) {
      return { id: gerecht.id, thumb: commonsFoto.thumb, full: commonsFoto.full };
    }
  }

  return null;
}
