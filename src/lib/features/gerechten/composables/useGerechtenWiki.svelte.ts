import { laadEnkeleFotoVoorGerecht } from "$lib/api/wikiApi.js";
import { cacheManager } from "$lib/utils/cacheManager.js";
import type { Gerecht, FotoCache } from "../types";

export type FotoStatus = "loading" | "ready" | "missing";

/**
 * useGerechtenWiki
 * Beheert het asynchroon inladen en cachen van Wikipedia foto's voor gerechten.
 */
export function useGerechtenWiki(allGerechten: Gerecht[]) {
  let fotos = $state<Record<string, string>>({});
  let fotosGroot = $state<Record<string, string>>({});
  let fotoStatusById = $state<Record<string, FotoStatus>>(
    Object.fromEntries(allGerechten.map((g) => [g.id, "loading" as FotoStatus]))
  );
  
  let stopFotoLoading = false;
  let fotoBatchTimer: ReturnType<typeof setTimeout> | null = null;
  let missingFotoIds = new Set<string>();

  const CACHE_KEY = "gerechten_fotos_v3_quality";
  const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  function bewaarFotoCache() {
    cacheManager.set(CACHE_KEY, {
      thumb: fotos,
      full: fotosGroot,
      missing: [...missingFotoIds]
    });
  }

  function laadFotos(gerechtenToLoad: Gerecht[]) {
    let index = 0;
    const batchSize = 2;
    let retries = 0;

    async function laadBatch() {
      if (stopFotoLoading) return;

      const batch = gerechtenToLoad.slice(index, index + batchSize);
      if (batch.length === 0) {
        const status = { ...fotoStatusById };
        let statusChanged = false;

        for (const gerecht of allGerechten) {
          if (status[gerecht.id] === "loading") {
            status[gerecht.id] = "missing";
            missingFotoIds.add(gerecht.id);
            statusChanged = true;
          }
        }

        if (statusChanged) fotoStatusById = status;
        bewaarFotoCache();
        return;
      }

      const results = await Promise.all(batch.map(laadEnkeleFotoVoorGerecht));
      if (stopFotoLoading) return;

      let changed = false;
      let gotRateLimited = false;
      const status = { ...fotoStatusById };
      let statusChanged = false;

      results.forEach((result, idx) => {
        const batchItem = batch[idx];
        if (!batchItem) return;

        if (result && "retry" in result) {
          gotRateLimited = true;
          return;
        }

        if (result && "thumb" in result) {
          fotos[result.id] = result.thumb;
          fotosGroot[result.id] = result.full;
          status[result.id] = "ready";
          missingFotoIds.delete(result.id);
          changed = true;
          statusChanged = true;
          return;
        }

        status[batchItem.id] = "missing";
        missingFotoIds.add(batchItem.id);
        statusChanged = true;
      });

      if (changed) {
        fotos = { ...fotos };
        fotosGroot = { ...fotosGroot };
      }

      if (statusChanged) fotoStatusById = status;
      if (changed || statusChanged) bewaarFotoCache();

      if (gotRateLimited && retries < 5) {
        retries += 1;
        fotoBatchTimer = setTimeout(laadBatch, 2500 * retries);
        return;
      }

      retries = 0;
      index += batchSize;
      fotoBatchTimer = setTimeout(laadBatch, 700);
    }

    void laadBatch();
  }

  $effect(() => {
    stopFotoLoading = false;
    const cached = cacheManager.get<FotoCache>(CACHE_KEY, CACHE_MAX_AGE);

    if (cached) {
      fotos = cached.thumb || {};
      fotosGroot = cached.full || {};
      missingFotoIds = new Set(Array.isArray(cached.missing) ? cached.missing.map(String) : []);

      const status = Object.fromEntries(
        allGerechten.map((g) => {
          const heeftFoto = Boolean(fotos[g.id] && fotosGroot[g.id]);
          if (heeftFoto) return [g.id, "ready"];
          if (missingFotoIds.has(g.id)) return [g.id, "missing"];
          return [g.id, "loading"];
        })
      ) as Record<string, FotoStatus>;
      
      fotoStatusById = status;

      const nogTeLaden = allGerechten.filter((g) => status[g.id] === "loading");
      if (nogTeLaden.length > 0) laadFotos(nogTeLaden);
    } else {
      missingFotoIds = new Set<string>();
      laadFotos(allGerechten);
    }

    return () => {
      stopFotoLoading = true;
      if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
    };
  });

  return {
    get fotos() { return fotos; },
    get fotosGroot() { return fotosGroot; },
    get fotoStatusById() { return fotoStatusById; }
  };
}
