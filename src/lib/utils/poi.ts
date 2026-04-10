import { poiCategorieMap } from "$lib/poiCategories.js";
import type { Poi, PoiCategorieId, PoiScore } from "$lib/types.js";

type DateValue = Date | string | number | { toDate?: () => Date; seconds?: number } | null | undefined;

export type PoiSortering = "prioriteit" | "nieuwst" | "naam";

export type PoiFilterState = {
  zoekterm?: string;
  categorie?: PoiCategorieId | "alle";
  score?: PoiScore | 0;
  sortering?: PoiSortering;
};

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return value !== null && value !== undefined && typeof value === "object" && "toDate" in value && typeof value.toDate === "function";
}

function hasSeconds(value: unknown): value is { seconds: number } {
  return value !== null && value !== undefined && typeof value === "object" && "seconds" in value && typeof value.seconds === "number";
}

export function poiDateToEpoch(value: DateValue): number {
  if (!value) return 0;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? 0 : value.getTime();
  if (hasToDate(value)) return value.toDate().getTime();
  if (hasSeconds(value)) return value.seconds * 1000;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  return 0;
}

export function normalizeExternalUrl(raw: string): string {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildPoiMapsLink(naam: string, locatieNaam = ""): string {
  const query = [naam, locatieNaam].map((part) => String(part || "").trim()).filter(Boolean).join(", ");
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function normalizePoi(id: string, raw: Partial<Poi>): Poi {
  const naam = String(raw.naam || "").trim();
  const categorie = (raw.categorie && raw.categorie in poiCategorieMap ? raw.categorie : "overig") as PoiCategorieId;
  const score = raw.score === 1 || raw.score === 2 || raw.score === 3 ? raw.score : 1;
  const locatieNaam = String(raw.locatieNaam || "").trim();
  const mapsLink = String(raw.mapsLink || "").trim() || buildPoiMapsLink(naam, locatieNaam);
  const websiteUrl = normalizeExternalUrl(String(raw.websiteUrl || ""));

  return {
    id,
    naam,
    categorie,
    score,
    omschrijving: String(raw.omschrijving || "").trim(),
    locatieNaam,
    mapsLink,
    websiteUrl,
    door: String(raw.door || "").trim(),
    toegevoegdOp: raw.toegevoegdOp || null,
    bijgewerktOp: raw.bijgewerktOp || null,
    bezocht: raw.bezocht === true,
    bezochtOp: raw.bezochtOp || null
  };
}

export function sortPois(items: Poi[], sortering: PoiSortering = "prioriteit"): Poi[] {
  return [...items].sort((a, b) => {
    if ((a.bezocht === true) !== (b.bezocht === true)) {
      return a.bezocht === true ? 1 : -1;
    }

    if (sortering === "naam") {
      return a.naam.localeCompare(b.naam, "nl");
    }

    if (sortering === "nieuwst") {
      const bTime = poiDateToEpoch(b.toegevoegdOp);
      const aTime = poiDateToEpoch(a.toegevoegdOp);
      if (bTime !== aTime) return bTime - aTime;
      return a.naam.localeCompare(b.naam, "nl");
    }

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const bTime = poiDateToEpoch(b.toegevoegdOp);
    const aTime = poiDateToEpoch(a.toegevoegdOp);
    if (bTime !== aTime) return bTime - aTime;

    return a.naam.localeCompare(b.naam, "nl");
  });
}

export function matchesPoiSearch(poi: Poi, zoekterm: string): boolean {
  const needle = String(zoekterm || "").trim().toLowerCase();
  if (!needle) return true;

  const categorieLabel = poiCategorieMap[poi.categorie]?.label || poi.categorie;
  const haystack = [
    poi.naam,
    poi.omschrijving,
    poi.locatieNaam,
    categorieLabel,
    poi.door
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  return haystack.includes(needle);
}

export function filterAndSortPois(items: Poi[], state: PoiFilterState = {}): Poi[] {
  const filtered = items.filter((poi) => {
    if (state.categorie && state.categorie !== "alle" && poi.categorie !== state.categorie) return false;
    if (state.score !== undefined && state.score !== 0 && poi.score !== state.score) return false;
    if (!matchesPoiSearch(poi, state.zoekterm || "")) return false;
    return true;
  });

  return sortPois(filtered, state.sortering || "prioriteit");
}
