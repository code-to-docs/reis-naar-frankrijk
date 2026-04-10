import { E } from "./emojis.js";
import type { BudgetCategorie } from "./types.js";

export const budgetCategorieen: BudgetCategorie[] = [
  { id: "dining", emoji: E.ETEN, label: "Uit eten", kleur: "var(--budget-cat-dining)" },
  { id: "boodschappen", emoji: E.WINKEL, label: "Boodschappen", kleur: "var(--budget-cat-boodschappen)" },
  { id: "overnachting", emoji: E.CAMPING, label: "Overnachting", kleur: "var(--budget-cat-overnachting)" },
  { id: "benzine", emoji: E.BENZINE, label: "Benzine", kleur: "var(--budget-cat-benzine)" },
  { id: "tol", emoji: E.TOL, label: "Tol", kleur: "var(--budget-cat-tol)" },
  { id: "uitjes", emoji: E.UITJES, label: "Uitjes", kleur: "var(--budget-cat-uitjes)" },
  { id: "overig", emoji: E.DOOS, label: "Overig", kleur: "var(--budget-cat-overig)" }
];

export const budgetCatMap = budgetCategorieen.reduce<Record<string, BudgetCategorie>>((map, cat) => {
  map[cat.id] = cat;
  return map;
}, {});
