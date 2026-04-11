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
import type { Overnachting } from "$lib/types.js";

const COLLECTION_NAME = "campings";

function stripUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;
}

export class OvernachtingenService {
  static subscribe(
    onUpdate: (data: Overnachting[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const items = snapshot.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<Overnachting, "id">)
        }));
        onUpdate(items);
      },
      (error) => {
        console.error("Firestore error on overnachtingen:", error);
        onError?.(error);
      }
    );
  }

  static async add(overnachting: Omit<Overnachting, "id" | "datum">) {
    return addDoc(collection(db, COLLECTION_NAME), stripUndefined({
      ...overnachting,
      datum: serverTimestamp()
    }));
  }

  static async update(id: string, updates: Partial<Omit<Overnachting, "id">>) {
    return updateDoc(doc(db, COLLECTION_NAME, id), stripUndefined({
      ...updates,
      datum: serverTimestamp()
    }));
  }

  static async delete(id: string) {
    return deleteDoc(doc(db, COLLECTION_NAME, id));
  }
}
