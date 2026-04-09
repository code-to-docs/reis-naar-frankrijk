export const config = {
  vertrekMaandIndex: 6,
  vertrekDag: 14,
  routeTekst: "Loz\u00E8re \u2192 Cantal \u2192 Pyr\u00E9n\u00E9es Ari\u00E9geoises",
};

export const TYPE_OPTIES = [
  { id: "hotel", label: "Hotel", emoji: "H" },
  { id: "bnb", label: "BNB", emoji: "B" },
  { id: "camping", label: "Camping", emoji: "C" }
] as const;

export function getVertrekDatum(referenceDate = new Date()) {
  const vertrekDatum = new Date(
    referenceDate.getFullYear(),
    config.vertrekMaandIndex,
    config.vertrekDag
  );

  if (referenceDate > vertrekDatum) {
    vertrekDatum.setFullYear(referenceDate.getFullYear() + 1);
  }

  return vertrekDatum;
}
