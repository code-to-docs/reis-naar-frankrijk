<script lang="ts">
  import { onMount, tick } from "svelte";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";
  import { TYPE_OPTIES } from "$lib/config.js";
  import { OvernachtingenService } from "$lib/services/overnachtingenService.js";
  import type { Overnachting, OvernachtingType } from "$lib/types.js";
  import OvernachtingenFormPanel from "./overnachtingen/OvernachtingenFormPanel.svelte";
  import OvernachtingenCalendarBoard from "./overnachtingen/OvernachtingenCalendarBoard.svelte";
  import OvernachtingenListsSection from "./overnachtingen/OvernachtingenListsSection.svelte";
  import type { KalenderCel, OvernachtingView } from "./overnachtingen/types.js";
  import {
    WEEKDAGEN,
    coordOrNull,
    dagKeyVanDatum,
    getGoogleMapsAddressUrl,
    getGoogleMapsUrl,
    getOpenStreetMapUrl,
    maandKeyVanDatum,
    maandLabel,
    naarLokaleDag,
    normalizeOvernachting,
    parseDagKey,
    parseInputDatum,
    plusDagen
  } from "./overnachtingen/plannerUtils.js";

  let ruweOvernachtingen = $state<Overnachting[]>([]);
  let unsubscribe: (() => void) | undefined;

  let toonForm = $state(false);
  let toonShortlistForm = $state(false);
  let bewerkItemId = $state<string | null>(null);
  let gpsBezig = $state(false);
  let actieveWeergave = $state<"overzicht" | "kalender">("overzicht");
  let selectieActief = $state(false);
  let selectieStartKey = $state<string | null>(null);
  let selectieEindKey = $state<string | null>(null);
  let activeTouchId = $state<number | null>(null);
  let onderdrukKlikTot = 0;

  let overnachtingFormEl = $state<HTMLDivElement | null>(null);
  let shortlistFormEl = $state<HTMLDivElement | null>(null);

  let naamInput = $state("");
  let typeInput = $state<OvernachtingType>("camping");
  let startDatumInput = $state("");
  let nachtenInput = $state("1");
  let latitudeInput = $state("");
  let longitudeInput = $state("");
  let notitiesInput = $state("");
  let websiteUrlInput = $state("");
  let bookingUrlInput = $state("");
  let adresInput = $state("");

  const huidigeMaandKey = maandKeyVanDatum(new Date());
  let geselecteerdeMaand = $state(huidigeMaandKey);

  let overnachtingen = $derived.by(() => {
    return ruweOvernachtingen
      .map((row, i) => normalizeOvernachting(row.id || `tmp-${i}`, row))
      .sort((a, b) => {
        const aTime = a.startDateObj ? a.startDateObj.getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.startDateObj ? b.startDateObj.getTime() : Number.POSITIVE_INFINITY;
        if (aTime !== bTime) return aTime - bTime;
        return a.naam.localeCompare(b.naam, "nl");
      });
  });

  let shortlistOvernachtingen = $derived.by(() =>
    overnachtingen
      .filter((o) => o.shortlistSafe)
      .sort((a, b) => a.naam.localeCompare(b.naam, "nl"))
  );
  let ingeplandeOvernachtingen = $derived.by(() => overnachtingen.filter((o) => !o.shortlistSafe));
  let overnachtingenMetDatum = $derived.by(() => ingeplandeOvernachtingen.filter((o) => o.startDateObj && o.lastNightObj));
  let overnachtingenZonderDatum = $derived.by(() => ingeplandeOvernachtingen.filter((o) => !o.startDateObj));

  let totaalNachten = $derived.by(() => overnachtingenMetDatum.reduce((sum, o) => sum + o.nachtenSafe, 0));

  let maandSleutels = $derived.by(() => {
    if (overnachtingenMetDatum.length === 0) return [huidigeMaandKey];

    const starts = overnachtingenMetDatum.map((o) => o.startDateObj as Date);
    const ends = overnachtingenMetDatum.map((o) => o.lastNightObj as Date);
    const minStart = starts.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
    const maxEnd = ends.reduce((a, b) => (a.getTime() >= b.getTime() ? a : b));

    const keys: string[] = [];
    const cursor = new Date(minStart.getFullYear(), minStart.getMonth(), 1, 12, 0, 0, 0);
    const limit = new Date(maxEnd.getFullYear(), maxEnd.getMonth(), 1, 12, 0, 0, 0);
    while (cursor.getTime() <= limit.getTime()) {
      keys.push(maandKeyVanDatum(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys.length ? keys : [huidigeMaandKey];
  });

  $effect(() => {
    if (!maandSleutels.includes(geselecteerdeMaand)) {
      geselecteerdeMaand = maandSleutels[0];
    }
  });

  let vertrekPreview = $derived.by(() => {
    const start = parseInputDatum(startDatumInput);
    const nights = Math.max(1, Number(nachtenInput) || 1);
    if (!start) return "";
    const vertrek = plusDagen(start, nights);
    return vertrek.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  });

  let kalenderCels = $derived.by(() => {
    const [jaar, maand] = geselecteerdeMaand.split("-").map(Number);
    const eerste = new Date(jaar, maand - 1, 1, 12, 0, 0, 0);
    const dagenInMaand = new Date(jaar, maand, 0).getDate();
    const offset = (eerste.getDay() + 6) % 7;

    const cels: KalenderCel[] = [];
    for (let i = 0; i < offset; i++) {
      cels.push({ key: `empty-${i}`, dagNummer: null, entries: [], isVandaag: false, isLeeg: true });
    }

    const vandaagKey = dagKeyVanDatum(naarLokaleDag(new Date()));
    for (let dag = 1; dag <= dagenInMaand; dag++) {
      const datum = new Date(jaar, maand - 1, dag, 12, 0, 0, 0);
      const key = dagKeyVanDatum(datum);
      const entries = overnachtingenMetDatum.filter((o) => {
        const start = o.startDateObj as Date;
        const end = o.lastNightObj as Date;
        const t = datum.getTime();
        return t >= start.getTime() && t <= end.getTime();
      });
      cels.push({
        key,
        dagNummer: dag,
        entries,
        isVandaag: key === vandaagKey,
        isLeeg: false
      });
    }

    while (cels.length % 7 !== 0) {
      cels.push({ key: `pad-${cels.length}`, dagNummer: null, entries: [], isVandaag: false, isLeeg: true });
    }
    return cels;
  });

  let locatieLegenda = $derived.by(() => {
    const byKey = new Map<string, { key: string; naam: string; kleur: string; count: number }>();
    for (const row of overnachtingenMetDatum) {
      const found = byKey.get(row.locatieKey);
      if (found) {
        found.count += 1;
      } else {
        byKey.set(row.locatieKey, {
          key: row.locatieKey,
          naam: row.naam,
          kleur: row.kleur,
          count: 1
        });
      }
    }
    return Array.from(byKey.values()).sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  });

  let maandIndex = $derived.by(() => maandSleutels.indexOf(geselecteerdeMaand));
  let kanVorigeMaand = $derived(maandIndex > 0);
  let kanVolgendeMaand = $derived(maandIndex >= 0 && maandIndex < maandSleutels.length - 1);

  function stapMaand(delta: number) {
    const target = maandIndex + delta;
    if (target < 0 || target >= maandSleutels.length) return;
    geselecteerdeMaand = maandSleutels[target];
  }

  function resetSelectie() {
    selectieActief = false;
    selectieStartKey = null;
    selectieEindKey = null;
    activeTouchId = null;
  }

  function vulFormMetItem(item: OvernachtingView) {
    naamInput = item.naam;
    typeInput = item.typeSafe;
    startDatumInput = item.startDatum || "";
    nachtenInput = String(item.nachtenSafe || 1);
    latitudeInput = item.latSafe !== null ? item.latSafe.toFixed(5) : "";
    longitudeInput = item.lonSafe !== null ? item.lonSafe.toFixed(5) : "";
    adresInput = item.adres || "";
    websiteUrlInput = item.websiteUrl || "";
    bookingUrlInput = item.bookingUrl || "";
    notitiesInput = item.notities || "";
  }

  async function scrollNaarFormulier(type: "overnachting" | "shortlist") {
    await tick();
    const target = type === "shortlist" ? shortlistFormEl : overnachtingFormEl;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openNieuwOvernachtingForm() {
    bewerkItemId = null;
    resetSelectie();
    resetForm();
    toonShortlistForm = false;
    toonForm = true;
    await scrollNaarFormulier("overnachting");
  }

  async function openNieuweShortlistForm() {
    bewerkItemId = null;
    resetSelectie();
    resetForm();
    toonForm = false;
    toonShortlistForm = true;
    await scrollNaarFormulier("shortlist");
  }

  function sluitFormulieren() {
    toonForm = false;
    toonShortlistForm = false;
    bewerkItemId = null;
    resetSelectie();
    resetForm();
  }

  async function openItemEditor(item: OvernachtingView) {
    bewerkItemId = item.id;
    resetSelectie();
    vulFormMetItem(item);
    if (item.startDateObj) {
      geselecteerdeMaand = maandKeyVanDatum(item.startDateObj);
    }
    if (item.shortlistSafe) {
      toonForm = false;
      toonShortlistForm = true;
      await scrollNaarFormulier("shortlist");
      return;
    }
    toonShortlistForm = false;
    toonForm = true;
    await scrollNaarFormulier("overnachting");
  }

  function zetSelectie(startKey: string, eindKey: string) {
    const start = parseDagKey(startKey);
    const end = parseDagKey(eindKey);
    if (!start || !end) return;
    if (start.getTime() <= end.getTime()) {
      selectieStartKey = startKey;
      selectieEindKey = eindKey;
      return;
    }
    selectieStartKey = eindKey;
    selectieEindKey = startKey;
  }

  async function commitSelectie() {
    if (!selectieStartKey || !selectieEindKey) return;
    const start = parseDagKey(selectieStartKey);
    const end = parseDagKey(selectieEindKey);
    if (!start || !end) return;
    const dagen = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
    bewerkItemId = null;
    startDatumInput = selectieStartKey;
    nachtenInput = String(dagen);
    toonShortlistForm = false;
    toonForm = true;
    await scrollNaarFormulier("overnachting");
  }

  function selectieBereik() {
    if (!selectieStartKey || !selectieEindKey) return null;
    const start = parseDagKey(selectieStartKey);
    const end = parseDagKey(selectieEindKey);
    if (!start || !end) return null;
    return { start: start.getTime(), end: end.getTime() };
  }

  function dagInSelectie(dayKey: string, isLeeg: boolean) {
    if (isLeeg) return false;
    const bounds = selectieBereik();
    const day = parseDagKey(dayKey);
    if (!bounds || !day) return false;
    const t = day.getTime();
    return t >= bounds.start && t <= bounds.end;
  }

  function dagIsSelectieStart(dayKey: string, isLeeg: boolean) {
    return !isLeeg && dayKey === selectieStartKey;
  }

  function dagIsSelectieEinde(dayKey: string, isLeeg: boolean) {
    return !isLeeg && dayKey === selectieEindKey;
  }

  function handleDayClick(dayKey: string, isLeeg: boolean, entries: OvernachtingView[]) {
    if (isLeeg) return;
    if (Date.now() < onderdrukKlikTot) return;
    if (entries.length === 1) {
      void openItemEditor(entries[0]);
      return;
    }
    zetSelectie(dayKey, dayKey);
    void commitSelectie();
  }

  function handleDayMouseDown(event: MouseEvent, dayKey: string, isLeeg: boolean) {
    if (isLeeg || event.button !== 0) return;
    event.preventDefault();
    selectieActief = true;
    zetSelectie(dayKey, dayKey);
  }

  function handleDayMouseEnter(dayKey: string, isLeeg: boolean) {
    if (!selectieActief || !selectieStartKey || isLeeg) return;
    zetSelectie(selectieStartKey, dayKey);
  }

  function handleGlobalMouseUp() {
    if (!selectieActief) return;
    selectieActief = false;
    void commitSelectie();
    onderdrukKlikTot = Date.now() + 260;
  }

  function handleDayTouchStart(event: TouchEvent, dayKey: string, isLeeg: boolean) {
    if (isLeeg) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    activeTouchId = touch.identifier;
    selectieActief = true;
    zetSelectie(dayKey, dayKey);
  }

  function handleGlobalTouchMove(event: TouchEvent) {
    if (!selectieActief || activeTouchId === null || !selectieStartKey) return;
    const activeTouch = Array.from(event.touches).find((t) => t.identifier === activeTouchId);
    if (!activeTouch) return;
    const element = document.elementFromPoint(activeTouch.clientX, activeTouch.clientY) as HTMLElement | null;
    const dayEl = element?.closest<HTMLElement>("[data-daykey]");
    const dayKey = dayEl?.dataset.daykey;
    if (!dayKey) return;
    event.preventDefault();
    zetSelectie(selectieStartKey, dayKey);
  }

  function finishTouchSelection(event: TouchEvent) {
    if (activeTouchId === null) return;
    const changed = Array.from(event.changedTouches).some((t) => t.identifier === activeTouchId);
    if (!changed) return;
    activeTouchId = null;
    if (!selectieActief) return;
    selectieActief = false;
    void commitSelectie();
    onderdrukKlikTot = Date.now() + 360;
  }

  function handleDayKeydown(event: KeyboardEvent, dayKey: string, isLeeg: boolean, entries: OvernachtingView[]) {
    if (isLeeg) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleDayClick(dayKey, false, entries);
  }

  function resetForm() {
    naamInput = "";
    typeInput = "camping";
    adresInput = "";
    startDatumInput = "";
    nachtenInput = "1";
    latitudeInput = "";
    longitudeInput = "";
    notitiesInput = "";
    websiteUrlInput = "";
    bookingUrlInput = "";
  }

  type FormField =
    | "naam"
    | "type"
    | "startDatum"
    | "nachten"
    | "latitude"
    | "longitude"
    | "adres"
    | "websiteUrl"
    | "bookingUrl"
    | "notities";

  function setFormField(field: FormField, value: string) {
    if (field === "naam") {
      naamInput = value;
      return;
    }
    if (field === "type") {
      if (value === "hotel" || value === "bnb" || value === "camping") {
        typeInput = value;
      }
      return;
    }
    if (field === "startDatum") {
      startDatumInput = value;
      return;
    }
    if (field === "nachten") {
      nachtenInput = value;
      return;
    }
    if (field === "latitude") {
      latitudeInput = value;
      return;
    }
    if (field === "longitude") {
      longitudeInput = value;
      return;
    }
    if (field === "adres") {
      adresInput = value;
      return;
    }
    if (field === "websiteUrl") {
      websiteUrlInput = value;
      return;
    }
    if (field === "bookingUrl") {
      bookingUrlInput = value;
      return;
    }
    notitiesInput = value;
  }

  function normalizeUrl(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function haalCoordinatenUitForm() {
    const lat = coordOrNull(latitudeInput);
    const lon = coordOrNull(longitudeInput);
    const hasLat = lat !== null;
    const hasLon = lon !== null;
    if (hasLat !== hasLon) {
      toonSnackbar("Vul zowel latitude als longitude in", "warning", E.WARN);
      return null;
    }
    if (hasLat && hasLon) {
      if (Number.isNaN(lat as number) || Number.isNaN(lon as number)) {
        toonSnackbar("GPS coordinaten zijn ongeldig", "warning", E.WARN);
        return null;
      }
      if ((lat as number) < -90 || (lat as number) > 90 || (lon as number) < -180 || (lon as number) > 180) {
        toonSnackbar("GPS coordinaten vallen buiten bereik", "warning", E.WARN);
        return null;
      }
    }
    const latNum = hasLat ? (lat as number) : null;
    const lonNum = hasLon ? (lon as number) : null;
    return {
      latNum,
      lonNum,
      mapsLink: latNum !== null && lonNum !== null ? getGoogleMapsUrl(latNum, lonNum) : null,
      osmLink: latNum !== null && lonNum !== null ? getOpenStreetMapUrl(latNum, lonNum) : null
    };
  }

  async function voegShortlistToe() {
    const naam = naamInput.trim();
    const adres = adresInput.trim();
    if (!naam) {
      toonSnackbar("Vul een naam in", "warning", E.WARN);
      return;
    }
    if (!typeInput || !TYPE_OPTIES.some((optie) => optie.id === typeInput)) {
      toonSnackbar("Kies een geldig type", "warning", E.WARN);
      return;
    }
    if (!adres) {
      toonSnackbar("Adres is verplicht voor shortlistlocatie", "warning", E.WARN);
      return;
    }
    const coord = haalCoordinatenUitForm();
    if (!coord) return;
    const isUpdate = Boolean(bewerkItemId);

    const websiteUrl = normalizeUrl(websiteUrlInput);
    const bookingUrl = normalizeUrl(bookingUrlInput);
    const payload: Omit<Overnachting, "id" | "datum"> = {
      naam,
      shortlist: true,
      type: typeInput,
      adres,
      latitude: coord.latNum,
      longitude: coord.lonNum,
      mapsLink: coord.mapsLink || getGoogleMapsAddressUrl(adres),
      openStreetMapUrl: coord.osmLink || undefined,
      websiteUrl: websiteUrl || "",
      bookingUrl: bookingUrl || "",
      notities: notitiesInput.trim() || "",
      door: appState.gebruiker || ""
    };
    try {
      if (bewerkItemId) {
        await OvernachtingenService.update(bewerkItemId, payload);
      } else {
        await OvernachtingenService.add(payload);
      }
      bewerkItemId = null;
      toonShortlistForm = false;
      resetForm();
      toonSnackbar(isUpdate ? "Shortlist-locatie bijgewerkt" : "Locatie aan shortlist toegevoegd", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon shortlist-locatie niet opslaan", "error", E.KRUIS);
    }
  }

  async function gebruikHuidigeGps() {
    if (gpsBezig) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      toonSnackbar("GPS niet beschikbaar op dit apparaat", "warning", E.WARN);
      return;
    }
    gpsBezig = true;
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latitudeInput = pos.coords.latitude.toFixed(5);
          longitudeInput = pos.coords.longitude.toFixed(5);
          gpsBezig = false;
          toonSnackbar("GPS coordinaten overgenomen", "success", E.PIN);
          resolve();
        },
        () => {
          gpsBezig = false;
          toonSnackbar("Kon GPS locatie niet ophalen", "error", E.KRUIS);
          resolve();
        },
        { timeout: 12000, maximumAge: 60000, enableHighAccuracy: true }
      );
    });
  }

  async function voegOvernachtingToe() {
    const naam = naamInput.trim();
    const adres = adresInput.trim();
    if (!naam) {
      toonSnackbar("Vul een naam in", "warning", E.WARN);
      return;
    }
    if (!typeInput || !TYPE_OPTIES.some((optie) => optie.id === typeInput)) {
      toonSnackbar("Kies een geldig type", "warning", E.WARN);
      return;
    }
    const start = parseInputDatum(startDatumInput);
    if (!start) {
      toonSnackbar("Kies een geldige datum", "warning", E.WARN);
      return;
    }

    const nachten = Math.max(1, Math.min(60, Number(nachtenInput) || 0));
    if (!Number.isFinite(nachten) || nachten < 1) {
      toonSnackbar("Aantal nachten moet minimaal 1 zijn", "warning", E.WARN);
      return;
    }

    const coord = haalCoordinatenUitForm();
    if (!coord) return;
    const isUpdate = Boolean(bewerkItemId);
    const websiteUrl = normalizeUrl(websiteUrlInput);
    const bookingUrl = normalizeUrl(bookingUrlInput);
    const payload: Omit<Overnachting, "id" | "datum"> = {
      naam,
      shortlist: false,
      type: typeInput,
      adres: adres || "",
      startDatum: startDatumInput,
      nachten,
      latitude: coord.latNum,
      longitude: coord.lonNum,
      mapsLink: coord.mapsLink || (adres ? getGoogleMapsAddressUrl(adres) : undefined),
      openStreetMapUrl: coord.osmLink || undefined,
      websiteUrl: websiteUrl || "",
      bookingUrl: bookingUrl || "",
      notities: notitiesInput.trim() || "",
      door: appState.gebruiker || ""
    };

    try {
      if (bewerkItemId) {
        await OvernachtingenService.update(bewerkItemId, payload);
      } else {
        await OvernachtingenService.add(payload);
      }
      geselecteerdeMaand = maandKeyVanDatum(start);
      bewerkItemId = null;
      toonForm = false;
      resetForm();
      toonSnackbar(isUpdate ? "Overnachting bijgewerkt" : "Overnachting toegevoegd", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon overnachting niet opslaan", "error", E.KRUIS);
    }
  }

  async function planShortlistItem(item: OvernachtingView) {
    vulFormMetItem(item);
    if (!startDatumInput) {
      const vandaag = dagKeyVanDatum(naarLokaleDag(new Date()));
      startDatumInput = vandaag;
    }
    nachtenInput = "1";
    bewerkItemId = item.id;
    toonShortlistForm = false;
    toonForm = true;
    await scrollNaarFormulier("overnachting");
    toonSnackbar("Shortlist item geladen. Kies datum en aantal nachten.", "success", E.KALENDER);
  }

  function planShortlistVanafVandaag(item: OvernachtingView) {
    const vandaag = dagKeyVanDatum(naarLokaleDag(new Date()));
    verplaatsNaarPlanning(item.id, item.naam, vandaag, "1");
  }

  async function verplaatsNaarPlanning(id: string, naam: string, startDatum: string, nachten: string) {
    const parsed = parseInputDatum(startDatum);
    const nights = Math.max(1, Math.min(60, Number(nachten) || 1));
    if (!parsed) {
      toonSnackbar("Kies eerst een geldige startdatum", "warning", E.WARN);
      return;
    }
    try {
      await OvernachtingenService.update(id, {
        shortlist: false,
        startDatum,
        nachten: nights
      });
      geselecteerdeMaand = maandKeyVanDatum(parsed);
      toonSnackbar(`"${naam}" ingepland op de kalender`, "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon shortlist-item niet plannen", "error", E.KRUIS);
    }
  }

  async function verwijderOvernachting(id: string, naam: string) {
    if (!confirm(`Verwijder overnachting "${naam}"?`)) return;
    try {
      await OvernachtingenService.delete(id);
      toonSnackbar("Overnachting verwijderd", "success", E.PRULLENBAK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Verwijderen mislukt", "error", E.KRUIS);
    }
  }

  onMount(() => {
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    window.addEventListener("touchend", finishTouchSelection);
    window.addEventListener("touchcancel", finishTouchSelection);

    unsubscribe = OvernachtingenService.subscribe(
      (items) => {
        ruweOvernachtingen = items;
      },
      () => {
        toonSnackbar("Overnachtingen konden niet live worden geladen", "error", E.KRUIS);
      }
    );

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", finishTouchSelection);
      window.removeEventListener("touchcancel", finishTouchSelection);
      unsubscribe?.();
    };
  });
</script>

<section class="ov-page">
  <div class="ov-top card">
    <div>
      <h2>{E.CAMPING} Overnachtingen planner</h2>
      <p>Plan verblijven op de kalender en bewaar kansrijke plekken in je shortlist.</p>
    </div>
    <div class="ov-top-actions">
      <button class="btn-primary ov-add" onclick={() => { if (toonForm) { sluitFormulieren(); } else { void openNieuwOvernachtingForm(); } }}>
        {toonForm ? "Sluit planning" : "+ Plan overnachting"}
      </button>
      <button class="ov-secondary-btn" onclick={() => { if (toonShortlistForm) { sluitFormulieren(); } else { void openNieuweShortlistForm(); } }}>
        {toonShortlistForm ? "Sluit shortlist" : "+ Shortlist locatie"}
      </button>
    </div>
  </div>

  <div class="ov-stats">
    <div class="ov-stat card">
      <span>Totaal verblijven</span>
      <strong>{ingeplandeOvernachtingen.length}</strong>
    </div>
    <div class="ov-stat card">
      <span>Totaal nachten</span>
      <strong>{totaalNachten}</strong>
    </div>
    <div class="ov-stat card">
      <span>Shortlist locaties</span>
      <strong>{shortlistOvernachtingen.length}</strong>
    </div>
  </div>

  <div class="ov-view-switch">
    <button
      type="button"
      class="ov-view-btn"
      class:active={actieveWeergave === "overzicht"}
      onclick={() => {
        actieveWeergave = "overzicht";
        resetSelectie();
      }}
    >
      Overzicht
    </button>
    <button
      type="button"
      class="ov-view-btn"
      class:active={actieveWeergave === "kalender"}
      onclick={() => {
        actieveWeergave = "kalender";
        resetSelectie();
      }}
    >
      Kalender
    </button>
  </div>

  <OvernachtingenFormPanel
    showPlanningForm={toonForm}
    showShortlistForm={toonShortlistForm}
    editItemId={bewerkItemId}
    typeOpties={TYPE_OPTIES}
    formValues={{
      naam: naamInput,
      type: typeInput,
      startDatum: startDatumInput,
      nachten: nachtenInput,
      latitude: latitudeInput,
      longitude: longitudeInput,
      adres: adresInput,
      websiteUrl: websiteUrlInput,
      bookingUrl: bookingUrlInput,
      notities: notitiesInput
    }}
    vertrekPreview={vertrekPreview}
    gpsBezig={gpsBezig}
    emojiKalender={E.KALENDER}
    emojiPin={E.PIN}
    onFieldChange={setFormField}
    onSubmitPlanning={() => void voegOvernachtingToe()}
    onSubmitShortlist={() => void voegShortlistToe()}
    onGebruikGps={() => void gebruikHuidigeGps()}
    onCloseForms={sluitFormulieren}
    setPlanningFormEl={(el) => {
      overnachtingFormEl = el;
    }}
    setShortlistFormEl={(el) => {
      shortlistFormEl = el;
    }}
  />

  <OvernachtingenCalendarBoard
    actieveWeergave={actieveWeergave}
    maandLabelText={maandLabel(geselecteerdeMaand)}
    kanVorigeMaand={kanVorigeMaand}
    kanVolgendeMaand={kanVolgendeMaand}
    weekdagen={WEEKDAGEN}
    kalenderCels={kalenderCels}
    selectieActief={selectieActief}
    locatieLegenda={locatieLegenda}
    isDagInSelectie={dagInSelectie}
    isDagSelectieStart={dagIsSelectieStart}
    isDagSelectieEinde={dagIsSelectieEinde}
    onOpenKalender={() => {
      actieveWeergave = "kalender";
    }}
    onPrevMaand={() => stapMaand(-1)}
    onNextMaand={() => stapMaand(1)}
    onDayMouseDown={handleDayMouseDown}
    onDayMouseEnter={handleDayMouseEnter}
    onDayClick={handleDayClick}
    onDayTouchStart={handleDayTouchStart}
    onDayKeydown={handleDayKeydown}
    onOpenItemEditor={(item) => {
      void openItemEditor(item);
    }}
    emojiKalender={E.KALENDER}
  />

  <OvernachtingenListsSection
    shortlistOvernachtingen={shortlistOvernachtingen}
    ingeplandeOvernachtingen={ingeplandeOvernachtingen}
    overnachtingenZonderDatumCount={overnachtingenZonderDatum.length}
    typeOpties={TYPE_OPTIES}
    emojiPin={E.PIN}
    emojiPrullenbak={E.PRULLENBAK}
    emojiWarn={E.WARN}
    onOpenItemEditor={(item) => {
      void openItemEditor(item);
    }}
    onDeleteItem={verwijderOvernachting}
    onPlanShortlistItem={(item) => {
      void planShortlistItem(item);
    }}
    onPlanShortlistVanafVandaag={planShortlistVanafVandaag}
  />
</section>

<style>
  .ov-page {
    display: grid;
    gap: 12px;
  }

  .ov-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 0;
  }
  .ov-top h2 {
    margin: 0;
    font-size: var(--font-size-2xl);
    letter-spacing: -0.02em;
  }
  .ov-top p {
    margin: 2px 0 0;
    color: var(--nav-text);
    font-size: var(--font-size-sm);
    font-weight: 500;
  }
  .ov-add {
    min-height: var(--ui-touch-min);
    white-space: nowrap;
    font-weight: 700;
  }
  .ov-top-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .ov-secondary-btn {
    width: auto;
    min-height: var(--btn-height);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, #e8f2fc);
    color: var(--blauw);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    padding: 0 12px;
    border-radius: var(--btn-radius);
  }

  .ov-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .ov-view-switch {
    margin: 0;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ov-view-btn {
    width: auto;
    min-height: var(--btn-height-compact);
    padding: 0 14px;
    border-radius: 999px;
    border: 1.5px solid #e2e8f0;
    background: #ffffff;
    color: #475569;
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    transition: all 0.15s ease;
  }
  .ov-view-btn.active {
    background: #1a5276;
    color: #ffffff;
    border-color: #1a5276;
  }
  .ov-stat {
    margin: 0;
    padding: 12px;
    border: 1px solid var(--border-subtle);
  }
  .ov-stat span {
    display: block;
    color: var(--nav-text);
    font-size: var(--font-size-xs);
  }
  .ov-stat strong {
    font-size: clamp(1.3rem, 3vw, 1.55rem);
    line-height: 1.05;
    color: var(--heading);
  }

  @media (max-width: 760px) {
    .ov-stats {
      grid-template-columns: 1fr;
    }
    .ov-top {
      flex-direction: column;
      align-items: flex-start;
    }
    .ov-top-actions {
      width: 100%;
      justify-content: flex-start;
    }
    .ov-add {
      width: 100%;
    }
    .ov-secondary-btn {
      width: 100%;
      text-align: center;
    }
    .ov-view-switch {
      width: 100%;
      justify-content: flex-start;
    }
    .ov-view-btn {
      flex: 0 0 auto;
    }
  }

  :global(html.dark) .ov-top p {
    color: #94a3b8;
  }
  :global(html.dark) .ov-stat,
  :global(html.dark) .ov-view-btn {
    background: #111827;
    border-color: #334155;
  }
  :global(html.dark) .ov-stat strong {
    color: #e2e8f0;
  }
  :global(html.dark) .ov-stat span {
    color: #cbd5e1;
  }
  :global(html.dark) .ov-secondary-btn,
  :global(html.dark) .ov-view-btn.active {
    background: #1e3a8a;
    color: #dbeafe;
    border-color: #2563eb;
  }
  :global(html.dark) .ov-view-btn {
    background: #111827;
    border-color: #334155;
    color: #94a3b8;
  }
  :global(html.dark) .ov-view-btn.active {
    background: #1a5276;
    border-color: #1a5276;
    color: #ffffff;
  }
</style>
