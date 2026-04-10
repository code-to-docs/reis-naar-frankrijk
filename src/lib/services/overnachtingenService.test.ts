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
});
