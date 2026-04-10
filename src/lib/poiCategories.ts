import { E } from "./emojis.js";
import type { PoiCategorie, PoiCategorieId, PoiScore } from "./types.js";

export const poiCategorieen: PoiCategorie[] = [
  { id: "cultuur", label: "Cultuur", emoji: E.BOEK, kleur: "#335CFF" },
  { id: "natuur", label: "Natuur", emoji: E.VOGEL, kleur: "#15803d" },
  { id: "activiteit", label: "Activiteit", emoji: E.TARGET, kleur: "#c2410c" },
  { id: "eten_drinken", label: "Eten & drinken", emoji: E.ETEN, kleur: "#b45309" },
  { id: "winkelen", label: "Winkelen", emoji: E.WINKEL, kleur: "#7c3aed" },
  { id: "overig", label: "Overig", emoji: E.DOOS, kleur: "#475569" }
];

export const poiCategorieMap = poiCategorieen.reduce<Record<PoiCategorieId, PoiCategorie>>((map, categorie) => {
  map[categorie.id] = categorie;
  return map;
}, {} as Record<PoiCategorieId, PoiCategorie>);

export const poiScoreMeta: Record<PoiScore, { label: string; korteLabel: string; beschrijving: string }> = {
  1: {
    label: "Leuk als we tijd hebben",
    korteLabel: "Optioneel",
    beschrijving: "Rustige suggestie voor als het goed uitkomt."
  },
  2: {
    label: "Graag bezoeken",
    korteLabel: "Graag",
    beschrijving: "Sterke kandidaat voor onderweg of een vrije middag."
  },
  3: {
    label: "Must-see",
    korteLabel: "Must-see",
    beschrijving: "Hoogste prioriteit, hier willen we echt heen."
  }
};
