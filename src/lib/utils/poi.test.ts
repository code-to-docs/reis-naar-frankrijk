import { describe, expect, it } from "vitest";
import {
  buildPoiMapsLink,
  filterAndSortPois,
  normalizeExternalUrl,
  normalizePoi,
  poiDateToEpoch
} from "./poi";
import type { Poi } from "$lib/types.js";

describe("poi utils", () => {
  it("normalizes urls and adds protocol when needed", () => {
    expect(normalizeExternalUrl("example.com")).toBe("https://example.com");
    expect(normalizeExternalUrl("https://openai.com")).toBe("https://openai.com");
  });

  it("builds a maps link from name and location", () => {
    expect(buildPoiMapsLink("Pont du Gard", "Occitanie")).toContain("Pont%20du%20Gard%2C%20Occitanie");
  });

  it("normalizes poi defaults and derives a map link", () => {
    const poi = normalizePoi("x1", {
      naam: "Pont du Gard",
      categorie: "cultuur",
      score: 3,
      locatieNaam: "Occitanie",
      door: "Dennis"
    });

    expect(poi.mapsLink).toContain("Pont%20du%20Gard%2C%20Occitanie");
    expect(poi.bezocht).toBe(false);
    expect(poi.websiteUrl).toBe("");
  });

  it("sorts unvisited high-priority pois first", () => {
    const pois: Poi[] = [
      { id: "1", naam: "A", categorie: "cultuur", score: 2, door: "Dennis", bezocht: false, toegevoegdOp: "2026-04-10T10:00:00Z" },
      { id: "2", naam: "B", categorie: "cultuur", score: 3, door: "Dennis", bezocht: true, toegevoegdOp: "2026-04-10T12:00:00Z" },
      { id: "3", naam: "C", categorie: "natuur", score: 3, door: "Dennis", bezocht: false, toegevoegdOp: "2026-04-10T11:00:00Z" }
    ];

    const result = filterAndSortPois(pois, { sortering: "prioriteit" });
    expect(result.map((poi) => poi.id)).toEqual(["3", "1", "2"]);
  });

  it("filters by query, category and score", () => {
    const pois: Poi[] = [
      { id: "1", naam: "Pont du Gard", categorie: "cultuur", score: 3, door: "Dennis", locatieNaam: "Gard", bezocht: false },
      { id: "2", naam: "Markt in Cahors", categorie: "winkelen", score: 1, door: "Franzi", bezocht: false }
    ];

    const result = filterAndSortPois(pois, { zoekterm: "gard", categorie: "cultuur", score: 3 });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("converts supported date values to epoch", () => {
    expect(poiDateToEpoch({ seconds: 12 })).toBe(12000);
    expect(poiDateToEpoch("1970-01-01T00:00:10Z")).toBe(10000);
  });
});
