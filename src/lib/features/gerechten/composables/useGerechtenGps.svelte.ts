import { 
  getCurrentCoordsWithMessage, 
  bepaalHuidigeRegio, 
  dichtstbijzijndeLocatie, 
  gerechtVoorFranziToegestaan, 
  gerechtBinnen20Km, 
  TIP_MAX_AFSTAND_KM,
  type Coords
} from "../utils/regionUtils.js";
import { gerechtenStreekLocaties, gerechtenStreekLabels } from "$lib/gerechtenData.js";
import type { Gerecht } from "../types";

/**
 * useGerechtenGps
 * Beheert de GPS-locatie en de daarop gebaseerde "Proeftip van vandaag".
 */
export function useGerechtenGps(
  getGefilterd: () => Gerecht[], 
  isFranzi: boolean, 
  isAlAfgevinkt: (id: string) => boolean
) {
  let gpsBezig = $state(false);
  let gpsGeprobeerd = $state(false);
  let gpsFout = $state("");
  let huidigeCoords = $state<Coords | null>(null);

  async function refreshGpsTip() {
    if (gpsBezig) return;
    gpsBezig = true;
    gpsGeprobeerd = true;
    gpsFout = "";
    
    const { coords, error } = await getCurrentCoordsWithMessage();
    if (error) gpsFout = error;
    if (coords) huidigeCoords = coords;

    gpsBezig = false;
  }

  let huidigeRegio = $derived.by(() => {
    if (!huidigeCoords) return null;
    return bepaalHuidigeRegio(huidigeCoords, gerechtenStreekLocaties as any);
  });

  let regioAfstand = $derived.by(() => {
    if (!huidigeCoords || !huidigeRegio) return null;
    const locaties = (gerechtenStreekLocaties as any)[huidigeRegio] || [];
    const dichtbij = dichtstbijzijndeLocatie(huidigeCoords, locaties);
    return dichtbij ? dichtbij.afstand : null;
  });

  let dagTipKandidaten = $derived.by(() => {
    const coords = huidigeCoords;
    const regio = huidigeRegio;
    if (!coords || !regio) return [];

    return getGefilterd().filter((gerecht) => {
      if (isAlAfgevinkt(gerecht.id)) return false;
      if (!gerechtVoorFranziToegestaan(gerecht, isFranzi)) return false;
      if (!gerechtBinnen20Km(gerecht, coords, regio, gerechtenStreekLocaties as any)) return false;
      return true;
    });
  });

  let dagTip = $derived.by(() => {
    if (!dagTipKandidaten.length) return null;
    const now = new Date();
    const daySeed = Number(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
    );
    return dagTipKandidaten[daySeed % dagTipKandidaten.length];
  });

  let dagTipStatus = $derived.by(() => {
    if (gpsBezig) return "GPS-locatie wordt opgehaald...";
    if (!gpsGeprobeerd) return "Tik op GPS verversen om een regionale proeftip te laden.";
    if (gpsFout) return gpsFout;
    if (!huidigeCoords) return "Geen GPS-locatie beschikbaar.";
    if (!huidigeRegio) return "Je locatie valt buiten de ingestelde streekzones.";

    if (!dagTipKandidaten.length) {
      const label = (gerechtenStreekLabels as any)[huidigeRegio]?.label || huidigeRegio;
      return `Geen ongeproefde gerechten binnen ${TIP_MAX_AFSTAND_KM} km in ${label}.`;
    }
    
    const label = (gerechtenStreekLabels as any)[huidigeRegio]?.label || huidigeRegio;
    return `${dagTipKandidaten.length} passende opties gevonden in ${label}.`;
  });

  return {
    get gpsBezig() { return gpsBezig; },
    get gpsGeprobeerd() { return gpsGeprobeerd; },
    get gpsFout() { return gpsFout; },
    get huidigeCoords() { return huidigeCoords; },
    get huidigeRegio() { return huidigeRegio; },
    get regioAfstand() { return regioAfstand; },
    get dagTip() { return dagTip; },
    get dagTipStatus() { return dagTipStatus; },
    refreshGpsTip
  };
}
