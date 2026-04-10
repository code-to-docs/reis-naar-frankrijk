export type BudgetTone = "ok" | "warn" | "over";

export function getBudgetProgressTone(percentage: number): BudgetTone {
  if (percentage <= 70) return "ok";
  if (percentage <= 90) return "warn";
  return "over";
}

export function normalizeFrenchRegionName(name: string): string {
  return String(name || "")
    .replace(/Lozere/gi, "Loz\u00E8re")
    .replace(/Ariege/gi, "Ari\u00E8ge")
    .replace(/Ari\u00E8geoises/gi, "Ari\u00E9geoises")
    .replace(/Pyrenees/gi, "Pyr\u00E9n\u00E9es");
}

export function buildWildlifeDeepLink(id: string): string {
  if (!id) return "/meer/wildlife";
  return `/meer/wildlife?open=${encodeURIComponent(id)}`;
}
