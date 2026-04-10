import { getContext, setContext } from 'svelte';
import { useGerechtenChecks } from './composables/useGerechtenChecks.svelte';
import { useGerechtenFilters } from './composables/useGerechtenFilters.svelte';
import { useGerechtenWiki } from './composables/useGerechtenWiki.svelte';
import { useGerechtenGps } from './composables/useGerechtenGps.svelte';
import { gerechtenData } from '$lib/gerechtenData.js';
import { appState } from '$lib/stores.svelte.js';
import type { Gerecht } from './types';

const CONTEXT_KEY = Symbol('gerechten-context');

export interface GerechtenContext {
  checks: ReturnType<typeof useGerechtenChecks>;
  filters: ReturnType<typeof useGerechtenFilters>;
  wiki: ReturnType<typeof useGerechtenWiki>;
  gps: ReturnType<typeof useGerechtenGps>;
  userKey: string;
  isFranzi: boolean;
}

/**
 * createGerechtenContext
 * Initialiseert alle domein-logica voor de gerechten-feature en maakt deze
 * beschikbaar via Svelte Context.
 */
export function createGerechtenContext(): GerechtenContext {
  const userKey = (appState.gebruiker || "").toLowerCase();
  const isFranzi = userKey === "franzi";
  
  // 1. Firestore sync
  const checks = useGerechtenChecks(gerechtenData.map((g: any) => g.id));
  
  // 2. Wikipedia images
  const wiki = useGerechtenWiki(gerechtenData as Gerecht[]);
  
  // 3. Filtering logic
  const filters = useGerechtenFilters(gerechtenData as Gerecht[], () => checks.checksByDish, userKey);
  
  // 4. GPS tips
  const gps = useGerechtenGps(
    () => filters.gefilterd, 
    isFranzi, 
    (id) => {
      const c = checks.checksByDish[id];
      return Boolean(c && Object.keys(c).length > 0);
    }
  );

  const context: GerechtenContext = {
    checks,
    wiki,
    filters,
    gps,
    userKey,
    isFranzi
  };

  setContext(CONTEXT_KEY, context);
  return context;
}

/**
 * getGerechtenContext
 * Helper om de context op te halen in sub-componenten.
 */
export function getGerechtenContext(): GerechtenContext {
  const context = getContext<GerechtenContext>(CONTEXT_KEY);
  if (!context) {
    throw new Error("getGerechtenContext moet binnen een createGerechtenContext scope worden aangeroepen.");
  }
  return context;
}
