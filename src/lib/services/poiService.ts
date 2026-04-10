import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type FirestoreError
} from "firebase/firestore";
import { db } from "$lib/firebase.js";
import { normalizePoi } from "$lib/utils/poi.js";
import type { Poi } from "$lib/types.js";

const COLLECTION_NAME = "poi_suggesties";

function stripUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;
}

export class PoiService {
  static subscribe(
    onUpdate: (data: Poi[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const items = snapshot.docs.map((entry) => normalizePoi(entry.id, entry.data() as Partial<Poi>));
        onUpdate(items);
      },
      (error) => {
        console.error("Firestore error on pois:", error);
        onError?.(error);
      }
    );
  }

  static async add(poi: Omit<Poi, "id" | "toegevoegdOp" | "bijgewerktOp" | "bezochtOp">) {
    return addDoc(collection(db, COLLECTION_NAME), stripUndefined({
      ...poi,
      bezocht: poi.bezocht === true,
      toegevoegdOp: serverTimestamp(),
      bijgewerktOp: serverTimestamp(),
      bezochtOp: poi.bezocht === true ? serverTimestamp() : null
    }));
  }

  static async update(id: string, updates: Partial<Omit<Poi, "id" | "toegevoegdOp">>) {
    const payload = stripUndefined({
      ...updates,
      bijgewerktOp: serverTimestamp(),
      bezochtOp: typeof updates.bezocht === "boolean"
        ? (updates.bezocht ? serverTimestamp() : null)
        : undefined
    });
    return updateDoc(doc(db, COLLECTION_NAME, id), payload);
  }

  static async delete(id: string) {
    return deleteDoc(doc(db, COLLECTION_NAME, id));
  }

  static async toggleBezocht(id: string, bezocht: boolean) {
    return updateDoc(doc(db, COLLECTION_NAME, id), {
      bezocht,
      bijgewerktOp: serverTimestamp(),
      bezochtOp: bezocht ? serverTimestamp() : null
    });
  }
}
