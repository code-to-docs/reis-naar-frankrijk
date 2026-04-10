import { collection, onSnapshot, query, where, type Unsubscribe } from "firebase/firestore";
import { db } from "$lib/firebase.js";
import type { GerechtCheck } from "../types";
import { chunkArray, CHECKS_QUERY_CHUNK_SIZE } from "$lib/components/gerechten/regionUtils.js";

type GerechtChecksPerUser = Partial<Record<string, GerechtCheck>>;

export function useGerechtenChecks(gerechtIds: string[]) {
  let checksByDish = $state<Record<string, GerechtChecksPerUser>>({});
  let loading = $state(true);

  const idChunks = chunkArray(gerechtIds, CHECKS_QUERY_CHUNK_SIZE);
  const rowsByDocId = new Map<string, Omit<GerechtCheck, "id">>();
  const docIdsPerChunk = new Map<number, Set<string>>();

  const rebuildChecksByDish = () => {
    const grouped: Record<string, GerechtChecksPerUser> = {};
    for (const [docId, row] of rowsByDocId.entries()) {
      if (!row?.gerechtId || !row?.door) continue;
      const dishId = String(row.gerechtId);
      const key = String(row.door).toLowerCase();
      if (!grouped[dishId]) grouped[dishId] = {};
      grouped[dishId][key] = { id: docId, ...row };
    }
    checksByDish = grouped;
  };

  function subscribe() {
    const unsubscribers = idChunks.map((chunk, index) =>
      onSnapshot(
        query(collection(db, "gerechten_checks"), where("gerechtId", "in", chunk)),
        (snapshot) => {
          const vorigeDocIds = docIdsPerChunk.get(index);
          if (vorigeDocIds) {
            for (const docId of vorigeDocIds) {
              rowsByDocId.delete(docId);
            }
          }

          const huidigeDocIds = new Set<string>();
          snapshot.forEach((rowDoc) => {
            const row = rowDoc.data() as Omit<GerechtCheck, "id">;
            if (!row?.gerechtId || !row?.door) return;
            huidigeDocIds.add(rowDoc.id);
            rowsByDocId.set(rowDoc.id, row);
          });

          docIdsPerChunk.set(index, huidigeDocIds);
          rebuildChecksByDish();
          loading = false;
        }
      )
    );

    return () => unsubscribers.forEach((unsub) => unsub());
  }

  // Auto-subscribe
  $effect(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  });

  return {
    get checksByDish() { return checksByDish; },
    get loading() { return loading; }
  };
}
