import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { OvernachtingenService } from "./overnachtingenService";

describe("OvernachtingenService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.serverTimestamp.mockImplementation(() => ({ __type: "serverTimestamp" }));
    firestore.collection.mockImplementation((db: any, name: string) => ({ __type: "collectionRef", db, name }));
    firestore.doc.mockImplementation((db: any, name: string, id: string) => ({ __type: "docRef", db, name, id }));
  });

  it("voegt een overnachting toe met herstelde serverTimestamp", async () => {
    const data = { naam: "Camping de la Mer", door: "Dennis", shortlist: true };
    await OvernachtingenService.add(data);

    expect(firestore.collection).toHaveBeenCalledWith(firebaseMock.db, "campings");
    expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ 
            ...data,
            datum: { __type: "serverTimestamp" }
        })
    );
  });

  it("roept deleteDoc aan met de juiste docRef", async () => {
    await OvernachtingenService.delete("test-id");
    expect(firestore.doc).toHaveBeenCalledWith(firebaseMock.db, "campings", "test-id");
    expect(firestore.deleteDoc).toHaveBeenCalled();
  });

  it("stript undefined velden bij add zodat Firestore geen invalid payload krijgt", async () => {
    await OvernachtingenService.add({
      naam: "Test",
      door: "Dennis",
      shortlist: true,
      websiteUrl: undefined,
      bookingUrl: undefined,
      mapsLink: undefined
    });

    const [, payload] = firestore.addDoc.mock.calls[0] ?? [];
    expect(payload).toMatchObject({
      naam: "Test",
      door: "Dennis",
      shortlist: true,
      datum: { __type: "serverTimestamp" }
    });
    expect("websiteUrl" in payload).toBe(false);
    expect("bookingUrl" in payload).toBe(false);
    expect("mapsLink" in payload).toBe(false);
  });

  it("stript undefined velden bij update", async () => {
    await OvernachtingenService.update("abc123", {
      shortlist: false,
      startDatum: "2026-04-11",
      nachten: 2,
      adres: undefined
    });

    expect(firestore.doc).toHaveBeenCalledWith(firebaseMock.db, "campings", "abc123");
    const [, payload] = firestore.updateDoc.mock.calls[0] ?? [];
    expect(payload).toMatchObject({
      shortlist: false,
      startDatum: "2026-04-11",
      nachten: 2,
      datum: { __type: "serverTimestamp" }
    });
    expect("adres" in payload).toBe(false);
  });
});
