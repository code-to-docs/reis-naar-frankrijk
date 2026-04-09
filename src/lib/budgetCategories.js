import { E } from "./emojis.js";

export const budgetCategorieen = [
  { id: "dining",       emoji: E.ETEN,     label: "Uit eten",     kleur: "#FF6B6B" },
  { id: "boodschappen", emoji: E.WINKEL,   label: "Boodschappen", kleur: "#4ECDC4" },
  { id: "overnachting", emoji: E.CAMPING,  label: "Overnachting", kleur: "#45B7D1" },
  { id: "benzine",      emoji: E.BENZINE,  label: "Benzine",      kleur: "#F9CA24" },
  { id: "tol",          emoji: E.TOL,      label: "Tol",          kleur: "#A29BFE" },
  { id: "uitjes",       emoji: E.UITJES,   label: "Uitjes",       kleur: "#FD79A8" },
  { id: "overig",       emoji: E.DOOS,     label: "Overig",       kleur: "#636E72" },
];

export const budgetCatMap = budgetCategorieen.reduce((map, cat) => {
  map[cat.id] = cat;
  return map;
}, {});
