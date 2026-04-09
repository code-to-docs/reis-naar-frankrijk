import type { Gerecht } from "$lib/types.js";

type FotoResultaat = { thumb: string; full: string } | { retry: true } | null;
type GerechtFotoResultaat = { id: string; thumb: string; full: string } | { id: string; retry: true } | null;

type WikipediaPage = {
  thumbnail?: { source?: string };
  original?: { source?: string };
};

type WikipediaSearchResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
};

type CommonsImageInfo = {
  thumburl?: string;
  url?: string;
};

type CommonsPage = {
  imageinfo?: CommonsImageInfo[];
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
};

let nextRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitedFetch(url: string, init?: RequestInit) {
  const now = Date.now();
  const waitMs = Math.max(0, nextRequestAt - now);
  nextRequestAt = now + waitMs + 350;

  if (waitMs > 0) {
    await sleep(waitMs);
  }

  return fetch(url, init);
}

export async function zoekWikipediaFoto(term: string): Promise<FotoResultaat> {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: term,
      gsrlimit: "1",
      prop: "pageimages|info",
      piprop: "thumbnail|original",
      pithumbsize: "900",
      inprop: "url",
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
    const page = pages.find((entry) => entry.original?.source || entry.thumbnail?.source);
    if (!page) return null;

    const thumb = page.thumbnail?.source || page.original?.source || "";
    const full = page.original?.source || page.thumbnail?.source || "";
    if (!thumb && !full) return null;

    return { thumb: thumb || full, full: full || thumb };
  } catch {
    return null;
  }
}

export async function zoekCommonsFoto(term: string): Promise<FotoResultaat> {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: term,
      gsrnamespace: "6",
      gsrlimit: "1",
      prop: "imageinfo",
      iiprop: "url",
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
    const page = pages.find((entry) => entry.imageinfo?.[0]?.thumburl || entry.imageinfo?.[0]?.url);
    const imageInfo = page?.imageinfo?.[0];
    if (!imageInfo) return null;

    const thumb = imageInfo.thumburl || imageInfo.url || "";
    const full = imageInfo.url || imageInfo.thumburl || "";
    if (!thumb && !full) return null;

    return { thumb: thumb || full, full: full || thumb };
  } catch {
    return null;
  }
}

export function maakFotoZoektermen(gerecht: Gerecht): string[] {
  const termen = [gerecht.frans, gerecht.naam];

  if (gerecht.soort === "kaas") {
    termen.push(`fromage ${gerecht.naam}`);
    termen.push(`fromage ${gerecht.frans}`);
  } else if (gerecht.soort === "drank") {
    termen.push(`${gerecht.frans} boisson`);
    termen.push(`${gerecht.naam} aperitif`);
  } else if (gerecht.soort === "dessert" || gerecht.soort === "koek_cake") {
    termen.push(`${gerecht.frans} dessert`);
    termen.push(`${gerecht.naam} gateau`);
  } else if (gerecht.soort === "hoofdgerecht" || gerecht.soort === "soep_stoof" || gerecht.soort === "streetfood") {
    termen.push(`${gerecht.frans} cuisine`);
    termen.push(`${gerecht.naam} recette`);
  }

  return [...new Set(termen.map((term) => String(term || "").trim()).filter(Boolean))];
}

export async function laadEnkeleFotoVoorGerecht(gerecht: Gerecht): Promise<GerechtFotoResultaat> {
  const zoektermen = maakFotoZoektermen(gerecht);

  for (const zoekterm of zoektermen) {
    const wikiFoto = await zoekWikipediaFoto(zoekterm);
    if (wikiFoto && "retry" in wikiFoto) return { id: gerecht.id, retry: true };
    if (wikiFoto && "thumb" in wikiFoto) {
      return { id: gerecht.id, thumb: wikiFoto.thumb, full: wikiFoto.full };
    }

    const commonsFoto = await zoekCommonsFoto(zoekterm);
    if (commonsFoto && "retry" in commonsFoto) return { id: gerecht.id, retry: true };
    if (commonsFoto && "thumb" in commonsFoto) {
      return { id: gerecht.id, thumb: commonsFoto.thumb, full: commonsFoto.full };
    }
  }

  return null;
}
