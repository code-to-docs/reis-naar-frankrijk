import type { Gerecht } from "../types";

/**
 * useGerechtenFilters
 * Beheert de filter- en zoeklogica voor de gerechtenlijst.
 */
export function useGerechtenFilters(
  allGerechten: Gerecht[], 
  getChecksByDish: () => any, 
  userKey: string
) {
  let zoek = $state("");
  let filterDieet = $state("alle");
  let filterSmaak = $state("alle");
  let filterSoort = $state("alle");
  let filterStreek = $state("alle");
  let filterStatus = $state("alle");

  let gefilterd = $derived.by(() => {
    const zoekLower = zoek.trim().toLowerCase();
    const checksByDish = getChecksByDish();

    return allGerechten.filter((gerecht) => {
      const check = checksByDish[gerecht.id]?.[userKey];
      
      const zoekMatch =
        !zoekLower ||
        gerecht.naam.toLowerCase().includes(zoekLower) ||
        gerecht.frans.toLowerCase().includes(zoekLower) ||
        gerecht.omschrijving.toLowerCase().includes(zoekLower);

      const dieetMatch =
        filterDieet === "alle" ||
        (filterDieet === "vegetarisch" && gerecht.vegetarisch) ||
        (filterDieet === "non_vegetarisch" && !gerecht.vegetarisch);

      const smaakMatch = filterSmaak === "alle" || gerecht.smaak === filterSmaak;
      const soortMatch = filterSoort === "alle" || gerecht.soort === filterSoort;
      const streekMatch = filterStreek === "alle" || gerecht.streken.includes(filterStreek);

      const statusMatch =
        filterStatus === "alle" ||
        (filterStatus === "ik_geproefd" && !!check) ||
        (filterStatus === "ik_niet" && !check);

      return zoekMatch && dieetMatch && smaakMatch && soortMatch && streekMatch && statusMatch;
    });
  });

  const activeFilterCount = $derived(
    (filterDieet !== "alle" ? 1 : 0) +
    (filterSmaak !== "alle" ? 1 : 0) +
    (filterSoort !== "alle" ? 1 : 0) +
    (filterStreek !== "alle" ? 1 : 0) +
    (filterStatus !== "alle" ? 1 : 0)
  );

  function resetFilters() {
    zoek = "";
    filterDieet = "alle";
    filterSmaak = "alle";
    filterSoort = "alle";
    filterStreek = "alle";
    filterStatus = "alle";
  }

  return {
    get zoek() { return zoek; },
    set zoek(v) { zoek = v; },
    get filterDieet() { return filterDieet; },
    set filterDieet(v) { filterDieet = v; },
    get filterSmaak() { return filterSmaak; },
    set filterSmaak(v) { filterSmaak = v; },
    get filterSoort() { return filterSoort; },
    set filterSoort(v) { filterSoort = v; },
    get filterStreek() { return filterStreek; },
    set filterStreek(v) { filterStreek = v; },
    get filterStatus() { return filterStatus; },
    set filterStatus(v) { filterStatus = v; },
    get gefilterd() { return gefilterd; },
    get activeFilterCount() { return activeFilterCount; },
    resetFilters
  };
}
