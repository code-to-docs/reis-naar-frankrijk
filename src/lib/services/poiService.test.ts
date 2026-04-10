import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Poi } from "$lib/types.js";

const firebaseMock = vi.hoisted(() => ({
  db: { __mock: "db" }
}));

const firestore = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn()
}));

vi.mock("$lib/firebase.js", () => firebaseMock);

vi.mock("firebase/firestore", () => ({
  addDoc: firestore.addDoc,
  collection: firestore.collection,
  deleteDoc: firestore.deleteDoc,
  doc: firestore.doc,
  onSnapshot: firestore.onSnapshot,
  serverTimestamp: firestore.serverTimestamp,
  updateDoc: firestore.updateDoc
}));

import { PoiService } from "./poiService";

describe("PoiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    let stamp = 0;
    firestore.serverTimestamp.mockImplementation(() => ({ __type: "serverTimestamp", stamp: ++stamp }));

    firestore.collection.mockImplementation((db: unknown, name: unknown) => ({ __type: "collectionRef", db, name }));
    firestore.addDoc.mockResolvedValue({ id: "new-doc" });
  });

  it("adds a poi (happy flow) and sends normalized timestamp fields", async () => {
    const poi = {
      naam: "Pont du Gard",
      categorie: "cultuur",
      score: 3,
      door: "Dennis"
    } satisfies Omit<Poi, "id" | "toegevoegdOp" | "bijgewerktOp" | "bezochtOp">;

    const result = await PoiService.add(poi);

    expect(firestore.collection).toHaveBeenCalledTimes(1);
    expect(firestore.collection).toHaveBeenCalledWith(firebaseMock.db, "poi_suggesties");

    expect(firestore.serverTimestamp).toHaveBeenCalledTimes(2);

    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    const [collectionRef, payload] = firestore.addDoc.mock.calls[0] ?? [];

    expect(collectionRef).toEqual({ __type: "collectionRef", db: firebaseMock.db, name: "poi_suggesties" });
    expect(payload).toMatchObject({
      naam: "Pont du Gard",
      categorie: "cultuur",
      score: 3,
      door: "Dennis",
      bezocht: false,
      bezochtOp: null
    });

    expect(payload.toegevoegdOp).toEqual({ __type: "serverTimestamp", stamp: 1 });
    expect(payload.bijgewerktOp).toEqual({ __type: "serverTimestamp", stamp: 2 });

    expect(result).toEqual({ id: "new-doc" });
  });

  it("strips undefined optionals and sets bezochtOp only when bezocht is true (edge)", async () => {
    const poi = {
      naam: "Uitzichtpunt",
      categorie: "natuur",
      score: 1,
      door: "Franzi",
      omschrijving: undefined,
      locatieNaam: undefined,
      websiteUrl: undefined,
      mapsLink: undefined,
      bezocht: true
    } satisfies Omit<Poi, "id" | "toegevoegdOp" | "bijgewerktOp" | "bezochtOp">;

    await PoiService.add(poi);

    expect(firestore.serverTimestamp).toHaveBeenCalledTimes(3);

    const [, payload] = firestore.addDoc.mock.calls[0] ?? [];
    expect(payload).toMatchObject({
      naam: "Uitzichtpunt",
      categorie: "natuur",
      score: 1,
      door: "Franzi",
      bezocht: true
    });

    expect(payload.bezochtOp).toEqual({ __type: "serverTimestamp", stamp: 3 });

    expect("omschrijving" in payload).toBe(false);
    expect("locatieNaam" in payload).toBe(false);
    expect("websiteUrl" in payload).toBe(false);
    expect("mapsLink" in payload).toBe(false);
  });
});

