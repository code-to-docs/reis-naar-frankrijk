<script lang="ts">
  import { onMount } from "svelte";
  import { collection, onSnapshot } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState } from "$lib/stores.svelte.js";
  import {
    gerechtenData,
    gerechtenDieetLabels,
    gerechtenSmaakLabels,
    gerechtenSoortLabels,
    gerechtenStreekLabels,
    gerechtenStreekLocaties
  } from "$lib/gerechtenData.js";
  import GerechtenStats from "./gerechten/GerechtenStats.svelte";
  import GerechtCard from "./gerechten/GerechtCard.svelte";

  type Coords = { lat: number; lon: number };
  type StreekLocatie = { naam: string; lat: number; lon: number };
  type FotoResultaat = { thumb: string; full: string } | { retry: true } | null;

  const TIP_MAX_AFSTAND_KM = 20;
  const REGIO_DETECTIE_MAX_KM = 70;

  let checksByDish: Record<string, Record<string, any>> = $state({});
  let fotos: Record<string, string> = $state({});
  let fotosGroot: Record<string, string> = $state({});
  let expandedGerecht: string | null = $state(null);
  let stopFotoLoading = false;
  let fotoBatchTimer: ReturnType<typeof setTimeout> | null = null;

  let zoek = $state("");
  let toonFilters = $state(false);
  let filterDieet = $state("alle");
  let filterSmaak = $state("alle");
  let filterSoort = $state("alle");
  let filterStreek = $state("alle");
  let filterStatus = $state("alle");

  let gpsBezig = $state(false);
  let gpsGeprobeerd = $state(false);
  let gpsFout = $state("");
  let huidigeCoords: Coords | null = $state(null);

  let userKey = $derived((appState.gebruiker || "").toLowerCase());
  let isFranzi = $derived(userKey === "franzi");

  function afstandKm(van: Coords, naar: Coords): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(naar.lat - van.lat);
    const dLon = toRad(naar.lon - van.lon);
    const lat1 = toRad(van.lat);
    const lat2 = toRad(naar.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  }

  function dichtstbijzijndeLocatie(
    coords: Coords,
    locaties: StreekLocatie[]
  ): { locatie: StreekLocatie; afstand: number } | null {
    let best: { locatie: StreekLocatie; afstand: number } | null = null;
    for (const locatie of locaties) {
      const afstand = afstandKm(coords, { lat: locatie.lat, lon: locatie.lon });
      if (!best || afstand < best.afstand) {
        best = { locatie, afstand };
      }
    }
    return best;
  }

  function bepaalHuidigeRegio(coords: Coords): string | null {
    let bestRegio: string | null = null;
    let bestAfstand = Number.POSITIVE_INFINITY;

    for (const [regio, locaties] of Object.entries(
      gerechtenStreekLocaties as Record<string, StreekLocatie[]>
    )) {
      if (!Array.isArray(locaties) || locaties.length === 0) continue;
      const dichtbij = dichtstbijzijndeLocatie(coords, locaties);
      if (!dichtbij) continue;
      if (dichtbij.afstand < bestAfstand) {
        bestAfstand = dichtbij.afstand;
        bestRegio = regio;
      }
    }

    if (!bestRegio || bestAfstand > REGIO_DETECTIE_MAX_KM) return null;
    return bestRegio;
  }

  function gerechtVoorFranziToegestaan(gerecht: any): boolean {
    if (!isFranzi) return true;
    return Boolean(gerecht.vegetarisch || gerecht.vis);
  }

  function gerechtBinnen20Km(gerecht: any, coords: Coords, regio: string): boolean {
    if (!Array.isArray(gerecht.streken) || !gerecht.streken.includes(regio)) return false;

    const regioLocaties =
      (gerechtenStreekLocaties as Record<string, StreekLocatie[]>)[regio] || [];

    if (!regioLocaties.length) return false;
    return regioLocaties.some((locatie) =>
      afstandKm(coords, { lat: locatie.lat, lon: locatie.lon }) <= TIP_MAX_AFSTAND_KM
    );
  }

  function isAlAfgevinkt(gerechtId: string): boolean {
    const checks = checksByDish[gerechtId];
    return Boolean(checks && Object.keys(checks).length > 0);
  }

  function getCurrentCoords(): Promise<Coords | null> {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      gpsFout = "GPS wordt niet ondersteund op dit apparaat.";
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            gpsFout = "GPS-toegang geweigerd. Zet locatie aan voor regionale dagtips.";
          } else if (error.code === error.TIMEOUT) {
            gpsFout = "GPS-timeout. Probeer opnieuw op een plek met beter bereik.";
          } else {
            gpsFout = "Kon je GPS-locatie niet ophalen.";
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 60000
        }
      );
    });
  }

  async function refreshGpsTip() {
    if (gpsBezig) return;
    gpsBezig = true;
    gpsGeprobeerd = true;
    gpsFout = "";

    const coords = await getCurrentCoords();
    if (coords) {
      huidigeCoords = coords;
    }

    gpsBezig = false;
  }

  onMount(() => {
    const unsub = onSnapshot(collection(db, "gerechten_checks"), (snapshot) => {
      const grouped: Record<string, Record<string, any>> = {};
      snapshot.forEach((rowDoc) => {
        const row: any = rowDoc.data();
        if (!row?.gerechtId || !row?.door) return;
        const dishId = String(row.gerechtId);
        const key = String(row.door).toLowerCase();
        if (!grouped[dishId]) grouped[dishId] = {};
        grouped[dishId][key] = { id: rowDoc.id, ...row };
      });
      checksByDish = grouped;
    });

    void refreshGpsTip();
    return () => unsub();
  });

  onMount(() => {
    stopFotoLoading = false;
    const CACHE_KEY = "gerechten_fotos_v1";
    const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_MAX_AGE) {
          const parsedThumbs = parsed.data?.thumb || parsed.data || {};
          const parsedFull = parsed.data?.full || {};
          fotos = parsedThumbs;
          fotosGroot = parsedFull;

          const missing = gerechtenData.filter((gerecht) => !fotos[gerecht.id] || !fotosGroot[gerecht.id]);
          if (missing.length === 0) {
            return () => {
              stopFotoLoading = true;
              if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
            };
          }

          laadFotos(missing);
          return () => {
            stopFotoLoading = true;
            if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
          };
        }
      }
    } catch (error) {
      console.warn("Gerechtenfoto-cache kon niet worden gelezen", error);
    }

    laadFotos(gerechtenData);
    return () => {
      stopFotoLoading = true;
      if (fotoBatchTimer) clearTimeout(fotoBatchTimer);
    };
  });

  function maakFotoZoektermen(gerecht: any): string[] {
    const termen = [gerecht.frans, gerecht.naam];

    if (gerecht.soort === "kaas") {
      termen.push(`fromage ${gerecht.naam}`);
      termen.push(`fromage ${gerecht.frans}`);
    }

    if (gerecht.soort === "drank") {
      termen.push(`${gerecht.frans} boisson`);
      termen.push(`${gerecht.naam} aperitif`);
    }

    if (gerecht.soort === "dessert" || gerecht.soort === "koek_cake") {
      termen.push(`${gerecht.frans} dessert`);
      termen.push(`${gerecht.naam} gateau`);
    }

    if (gerecht.soort === "hoofdgerecht" || gerecht.soort === "soep_stoof" || gerecht.soort === "streetfood") {
      termen.push(`${gerecht.frans} cuisine`);
      termen.push(`${gerecht.naam} recette`);
    }

    return [...new Set(termen.map((term) => String(term || "").trim()).filter(Boolean))];
  }

  async function zoekWikipediaFoto(term: string): Promise<FotoResultaat> {
    try {
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: term,
        gsrlimit: "1",
        prop: "pageimages|info",
        piprop: "thumbnail|original",
        pithumbsize: "900",
        inprop: "url",
        format: "json",
        origin: "*"
      });

      const res = await fetch(`https://fr.wikipedia.org/w/api.php?${params.toString()}`, {
        headers: { Accept: "application/json" }
      });

      if (res.status === 429) return { retry: true };
      if (!res.ok) return null;

      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {}) as Array<any>;
      const page = pages.find((entry) => entry?.original?.source || entry?.thumbnail?.source);
      if (!page) return null;

      const thumb = page.thumbnail?.source || page.original?.source || "";
      const full = page.original?.source || page.thumbnail?.source || "";
      if (!thumb && !full) return null;

      return {
        thumb: thumb || full,
        full: full || thumb
      };
    } catch {
      return null;
    }
  }

  async function zoekCommonsFoto(term: string): Promise<FotoResultaat> {
    try {
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: term,
        gsrnamespace: "6",
        gsrlimit: "1",
        prop: "imageinfo",
        iiprop: "url",
        iiurlwidth: "900",
        format: "json",
        origin: "*"
      });

      const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
        headers: { Accept: "application/json" }
      });

      if (res.status === 429) return { retry: true };
      if (!res.ok) return null;

      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {}) as Array<any>;
      const page = pages.find((entry) => entry?.imageinfo?.[0]?.thumburl || entry?.imageinfo?.[0]?.url);
      const imageInfo = page?.imageinfo?.[0];
      if (!imageInfo) return null;

      const thumb = imageInfo.thumburl || imageInfo.url || "";
      const full = imageInfo.url || imageInfo.thumburl || "";
      if (!thumb && !full) return null;

      return {
        thumb: thumb || full,
        full: full || thumb
      };
    } catch {
      return null;
    }
  }

  function bewaarFotoCache() {
    try {
      localStorage.setItem(
        "gerechten_fotos_v1",
        JSON.stringify({
          timestamp: Date.now(),
          data: { thumb: fotos, full: fotosGroot }
        })
      );
    } catch (error) {
      console.warn("Gerechtenfoto-cache kon niet worden opgeslagen", error);
    }
  }

  async function laadEnkeleFoto(gerecht: any) {
    const zoektermen = maakFotoZoektermen(gerecht);

    for (const zoekterm of zoektermen) {
      const wikiFoto = await zoekWikipediaFoto(zoekterm);
      if (wikiFoto && "retry" in wikiFoto) return { id: gerecht.id, retry: true };
      if (wikiFoto && "thumb" in wikiFoto) {
        return { id: gerecht.id, thumb: wikiFoto.thumb, full: wikiFoto.full };
      }

      const commonsFoto = await zoekCommonsFoto(zoekterm);
      if (commonsFoto && "retry" in commonsFoto) return { id: gerecht.id, retry: true };
      if (commonsFoto && "thumb" in commonsFoto) {
        return { id: gerecht.id, thumb: commonsFoto.thumb, full: commonsFoto.full };
      }
    }

    return null;
  }

  function laadFotos(gerechten: any[]) {
    let index = 0;
    const batchSize = 2;
    let retries = 0;

    async function laadBatch() {
      if (stopFotoLoading) return;

      const batch = gerechten.slice(index, index + batchSize);
      if (batch.length === 0) {
        bewaarFotoCache();
        return;
      }

      const results = await Promise.all(batch.map(laadEnkeleFoto));
      if (stopFotoLoading) return;

      let changed = false;
      let gotRateLimited = false;

      results.forEach((result) => {
        if (result && "retry" in result) {
          gotRateLimited = true;
          return;
        }

        if (result && "thumb" in result) {
          fotos[result.id] = result.thumb;
          fotosGroot[result.id] = result.full;
          changed = true;
        }
      });

      if (changed) {
        fotos = { ...fotos };
        fotosGroot = { ...fotosGroot };
        bewaarFotoCache();
      }

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

  let gefilterd = $derived.by(() => {
    const zoekLower = zoek.trim().toLowerCase();
    return gerechtenData.filter((gerecht) => {
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

  let totaal = $derived(gerechtenData.length);
  let dennisCount = $derived(gerechtenData.filter((gerecht) => !!checksByDish[gerecht.id]?.dennis).length);
  let franziCount = $derived(gerechtenData.filter((gerecht) => !!checksByDish[gerecht.id]?.franzi).length);
  let mijnCount = $derived(gerechtenData.filter((gerecht) => !!checksByDish[gerecht.id]?.[userKey]).length);

  let actieveFilters = $derived(
    (filterDieet !== "alle" ? 1 : 0) +
      (filterSmaak !== "alle" ? 1 : 0) +
      (filterSoort !== "alle" ? 1 : 0) +
      (filterStreek !== "alle" ? 1 : 0) +
      (filterStatus !== "alle" ? 1 : 0)
  );

  let huidigeRegio = $derived.by(() => {
    if (!huidigeCoords) return null;
    return bepaalHuidigeRegio(huidigeCoords);
  });

  let regioAfstand = $derived.by(() => {
    if (!huidigeCoords || !huidigeRegio) return null;
    const locaties =
      (gerechtenStreekLocaties as Record<string, StreekLocatie[]>)[huidigeRegio] || [];
    const dichtbij = dichtstbijzijndeLocatie(huidigeCoords, locaties);
    return dichtbij ? dichtbij.afstand : null;
  });

  let dagTipKandidaten = $derived.by(() => {
    const coords = huidigeCoords;
    const regio = huidigeRegio;
    if (!coords || !regio) return [];

    return gefilterd.filter((gerecht) => {
      if (isAlAfgevinkt(gerecht.id)) return false;
      if (!gerechtVoorFranziToegestaan(gerecht)) return false;
      if (!gerechtBinnen20Km(gerecht, coords, regio)) return false;
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
      return `Geen ongeproefde gerechten binnen ${TIP_MAX_AFSTAND_KM} km in ${getStreekLabel(huidigeRegio)}.`;
    }
    return `${dagTipKandidaten.length} passende opties gevonden in ${getStreekLabel(huidigeRegio)}.`;
  });

  function resetFilters() {
    zoek = "";
    filterDieet = "alle";
    filterSmaak = "alle";
    filterSoort = "alle";
    filterStreek = "alle";
    filterStatus = "alle";
  }

  function getSoortLabel(soort: string) {
    return (gerechtenSoortLabels as Record<string, { label: string }>)[soort]?.label || soort;
  }

  function getStreekLabel(streek: string) {
    return (gerechtenStreekLabels as Record<string, { label: string }>)[streek]?.label || streek;
  }
</script>

<section class="gr-page">
  <GerechtenStats {totaal} {dennisCount} {franziCount} {mijnCount} />

  <div class="gr-tip-card">
    <div class="gr-tip-top">
      <div class="gr-tip-label">Proef-tip van vandaag</div>
      <button class="gr-tip-refresh" onclick={refreshGpsTip} disabled={gpsBezig}>
        {gpsBezig ? "GPS..." : "GPS verversen"}
      </button>
    </div>

    {#if dagTip}
      <div class="gr-tip-name">{dagTip.emoji} {dagTip.naam}</div>
      <div class="gr-tip-sub">{dagTip.frans} · {getSoortLabel(dagTip.soort)}</div>
      <div class="gr-tip-meta">
        <span>Regio: {huidigeRegio ? getStreekLabel(huidigeRegio) : "Onbekend"}</span>
        <span>Binnen {TIP_MAX_AFSTAND_KM} km</span>
        {#if regioAfstand !== null}
          <span>GPS match: {regioAfstand.toFixed(1)} km</span>
        {/if}
        {#if isFranzi}
          <span>Franzi-filter: vegetarisch of vis</span>
        {/if}
      </div>
    {:else}
      <div class="gr-tip-empty">{dagTipStatus}</div>
    {/if}
  </div>

  <div class="gr-zoek-rij">
    <input
      type="text"
      class="gr-zoek"
      placeholder="Zoek op naam, Frans of omschrijving..."
      bind:value={zoek}
    />
    <button
      class="gr-filter-toggle"
      class:actief={toonFilters || actieveFilters > 0}
      onclick={() => (toonFilters = !toonFilters)}
      aria-label="Toon filters"
    >
      Filter
      {#if actieveFilters > 0}
        <span class="gr-filter-badge">{actieveFilters}</span>
      {/if}
    </button>
  </div>

  {#if toonFilters}
    <div class="gr-filters-card">
      <div class="gr-filter-block">
        <div class="gr-filter-title">Dieet</div>
        <div class="gr-pills">
          {#each Object.entries(gerechtenDieetLabels) as [key, val]}
            <button class="gr-pill" class:active={filterDieet === key} onclick={() => (filterDieet = key)}>
              {val.emoji} {val.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="gr-filter-block">
        <div class="gr-filter-title">Smaak</div>
        <div class="gr-pills">
          {#each Object.entries(gerechtenSmaakLabels) as [key, val]}
            <button class="gr-pill" class:active={filterSmaak === key} onclick={() => (filterSmaak = key)}>
              {val.emoji} {val.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="gr-filter-block">
        <div class="gr-filter-title">Soort</div>
        <div class="gr-pills">
          {#each Object.entries(gerechtenSoortLabels) as [key, val]}
            <button class="gr-pill" class:active={filterSoort === key} onclick={() => (filterSoort = key)}>
              {val.emoji} {val.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="gr-filter-block">
        <div class="gr-filter-title">Streek</div>
        <div class="gr-pills">
          {#each Object.entries(gerechtenStreekLabels) as [key, val]}
            <button class="gr-pill" class:active={filterStreek === key} onclick={() => (filterStreek = key)}>
              {val.emoji} {val.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="gr-filter-block">
        <div class="gr-filter-title">Status</div>
        <div class="gr-pills">
          <button class="gr-pill" class:active={filterStatus === "alle"} onclick={() => (filterStatus = "alle")}>
            Alles
          </button>
          <button class="gr-pill" class:active={filterStatus === "ik_geproefd"} onclick={() => (filterStatus = "ik_geproefd")}>
            Ik geproefd
          </button>
          <button class="gr-pill" class:active={filterStatus === "ik_niet"} onclick={() => (filterStatus = "ik_niet")}>
            Nog niet
          </button>
        </div>
      </div>

      {#if actieveFilters > 0 || zoek}
        <button class="gr-reset" onclick={resetFilters}>Filters resetten</button>
      {/if}
    </div>
  {/if}

  <div class="gr-resultaten">{gefilterd.length} {gefilterd.length === 1 ? "gerecht" : "gerechten"} gevonden</div>

  <div class="gr-lijst">
    {#each gefilterd as gerecht (gerecht.id)}
      <GerechtCard
        {gerecht}
        checks={checksByDish[gerecht.id]}
        currentUser={appState.gebruiker}
        foto={fotos[gerecht.id]}
        groteFoto={fotosGroot[gerecht.id]}
        isExpanded={expandedGerecht === gerecht.id}
        onToggle={() => (expandedGerecht = expandedGerecht === gerecht.id ? null : gerecht.id)}
      />
    {/each}
  </div>

  {#if gefilterd.length === 0}
    <div class="gr-leeg">
      <p>Geen gerechten gevonden met deze filters.</p>
      <button class="gr-reset" onclick={resetFilters}>Filters resetten</button>
    </div>
  {/if}
</section>

<style>
  .gr-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gr-tip-card {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    border-radius: 14px;
    padding: 12px;
  }

  .gr-tip-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .gr-tip-label {
    font-size: 0.75rem;
    color: #1e3a8a;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .gr-tip-refresh {
    width: auto;
    min-height: 32px;
    border-radius: 999px;
    border: 1px solid #93c5fd;
    background: rgba(255, 255, 255, 0.7);
    color: #1d4ed8;
    font-size: 0.76rem;
    font-weight: 700;
    padding: 0 10px;
  }

  .gr-tip-refresh:disabled {
    opacity: 0.7;
  }

  .gr-tip-name {
    margin-top: 6px;
    font-size: 1rem;
    font-weight: 800;
    color: #0f172a;
  }

  .gr-tip-sub {
    margin-top: 2px;
    font-size: 0.8rem;
    color: #334155;
  }

  .gr-tip-meta {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .gr-tip-meta span {
    font-size: 0.72rem;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.66);
    color: #1e3a8a;
    border: 1px solid #bfdbfe;
    font-weight: 700;
  }

  .gr-tip-empty {
    margin-top: 8px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.66);
    color: #1e3a8a;
    border: 1px dashed #93c5fd;
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .gr-zoek-rij {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }

  .gr-zoek {
    margin: 0;
    min-height: 44px;
    border-radius: 12px;
    border: 1.5px solid var(--input-border);
  }

  .gr-filter-toggle {
    min-width: 92px;
    min-height: 44px;
    padding: 0 10px;
    border-radius: 12px;
    border: 1.5px solid var(--input-border);
    background: var(--card-bg);
    color: var(--tekst);
    position: relative;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .gr-filter-toggle.actief {
    background: #1a5276;
    border-color: #1a5276;
    color: white;
  }

  .gr-filter-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #ef4444;
    color: white;
    font-size: 0.68rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }

  .gr-filters-card {
    background: var(--card-bg);
    border-radius: 14px;
    border: 1px solid var(--border-subtle);
    box-shadow: 0 2px 10px var(--card-shadow);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .gr-filter-title {
    font-size: 0.74rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .gr-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .gr-pill {
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #475569;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 0.8rem;
    line-height: 1;
    font-weight: 600;
  }

  .gr-pill.active {
    background: #1a5276;
    border-color: #1a5276;
    color: #fff;
  }

  .gr-reset {
    margin-top: 2px;
    width: 100%;
    border-radius: 10px;
    background: #fee2e2;
    color: #991b1b;
    font-weight: 700;
  }

  .gr-resultaten {
    font-size: 0.84rem;
    color: #64748b;
    padding: 0 2px;
  }

  .gr-lijst {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .gr-leeg {
    border-radius: 14px;
    padding: 16px;
    text-align: center;
    background: var(--card-bg);
    color: #64748b;
    box-shadow: 0 2px 10px var(--card-shadow);
  }

  :global(html.dark) .gr-tip-card {
    background: linear-gradient(135deg, #12243f, #1e3a5f);
    border-color: #334155;
  }

  :global(html.dark) .gr-tip-label {
    color: #93c5fd;
  }

  :global(html.dark) .gr-tip-name {
    color: #e2e8f0;
  }

  :global(html.dark) .gr-tip-sub {
    color: #cbd5e1;
  }

  :global(html.dark) .gr-tip-refresh {
    background: rgba(15, 23, 42, 0.5);
    border-color: #334155;
    color: #bfdbfe;
  }

  :global(html.dark) .gr-tip-meta span {
    background: rgba(15, 23, 42, 0.5);
    border-color: #334155;
    color: #bfdbfe;
  }

  :global(html.dark) .gr-tip-empty {
    background: rgba(15, 23, 42, 0.5);
    border-color: #334155;
    color: #bfdbfe;
  }

  :global(html.dark) .gr-zoek,
  :global(html.dark) .gr-filter-toggle,
  :global(html.dark) .gr-filters-card {
    border-color: #334155;
  }

  :global(html.dark) .gr-filter-toggle {
    background: var(--card-bg);
    color: #e2e8f0;
  }

  :global(html.dark) .gr-filter-toggle.actief {
    background: #1a5276;
    border-color: #1a5276;
  }

  :global(html.dark) .gr-filter-title,
  :global(html.dark) .gr-resultaten,
  :global(html.dark) .gr-leeg {
    color: #94a3b8;
  }

  :global(html.dark) .gr-pill {
    background: var(--card-bg);
    border-color: #334155;
    color: #94a3b8;
  }

  :global(html.dark) .gr-pill.active {
    background: #1a5276;
    border-color: #1a5276;
    color: white;
  }
</style>
