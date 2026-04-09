<script lang="ts">
  import { onMount } from "svelte";
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
  } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { appState, toonSnackbar } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";
  import { parseLocalizedNumber } from "$lib/utils/formatters.js";
  import type { Overnachting, OvernachtingType } from "$lib/types";

  type OvernachtingView = Overnachting & {
    id: string;
    shortlistSafe: boolean;
    typeSafe: OvernachtingType;
    nachtenSafe: number;
    startDateObj: Date | null;
    lastNightObj: Date | null;
    latSafe: number | null;
    lonSafe: number | null;
    locatieKey: string;
    kleur: string;
    googleMapsUrl: string | null;
    openStreetMapLink: string | null;
  };

  type KalenderCel = {
    key: string;
    dagNummer: number | null;
    entries: OvernachtingView[];
    isVandaag: boolean;
    isLeeg: boolean;
  };

  const TYPE_OPTIES: Array<{ id: OvernachtingType; label: string; emoji: string }> = [
    { id: "hotel", label: "Hotel", emoji: "H" },
    { id: "bnb", label: "BNB", emoji: "B" },
    { id: "camping", label: "Camping", emoji: "C" }
  ];

  const WEEKDAGEN = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const LOCATIE_KLEUREN = [
    "#1d4ed8",
    "#0284c7",
    "#2563eb",
    "#0f766e",
    "#0ea5a4",
    "#1e40af",
    "#10b981",
    "#0369a1",
    "#1f7a8c",
    "#14532d"
  ];

  let ruweOvernachtingen = $state<Overnachting[]>([]);
  let unsubscribe: (() => void) | undefined;

  let toonForm = $state(false);
  let toonShortlistForm = $state(false);
  let gpsBezig = $state(false);
  let selectieActief = $state(false);
  let selectieStartKey = $state<string | null>(null);
  let selectieEindKey = $state<string | null>(null);
  let activeTouchId = $state<number | null>(null);
  let onderdrukKlikTot = 0;

  let naamInput = $state("");
  let typeInput = $state<OvernachtingType>("camping");
  let startDatumInput = $state("");
  let nachtenInput = $state("1");
  let latitudeInput = $state("");
  let longitudeInput = $state("");
  let notitiesInput = $state("");
  let websiteUrlInput = $state("");
  let bookingUrlInput = $state("");

  const huidigeMaandKey = maandKeyVanDatum(new Date());
  let geselecteerdeMaand = $state(huidigeMaandKey);

  function naarLokaleDag(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  }

  function parseInputDatum(value?: string | null) {
    if (!value || typeof value !== "string") return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    const parsed = new Date(y, m - 1, d, 12, 0, 0, 0);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function dagKeyVanDatum(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseDagKey(dayKey: string) {
    return parseInputDatum(dayKey);
  }

  function maandKeyVanDatum(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  }

  function maandLabel(maandKey: string) {
    const [year, month] = maandKey.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("nl-NL", {
      month: "long",
      year: "numeric"
    });
  }

  function plusDagen(d: Date, dagen: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + dagen);
    return naarLokaleDag(x);
  }

  function hashCode(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function kleurVoorLocatie(key: string) {
    return LOCATIE_KLEUREN[hashCode(key) % LOCATIE_KLEUREN.length];
  }

  function typeSafe(input: unknown): OvernachtingType {
    return input === "hotel" || input === "bnb" || input === "camping" ? input : "camping";
  }

  function coordOrNull(raw: string): number | null {
    if (!raw.trim()) return null;
    const parsed = parseLocalizedNumber(raw);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function getGoogleMapsUrl(lat: number, lon: number) {
    const q = `${lat},${lon}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
  }

  function getOpenStreetMapUrl(lat: number, lon: number) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
  }

  function normalizeOvernachting(id: string, raw: Overnachting): OvernachtingView {
    const naam = typeof raw.naam === "string" && raw.naam.trim() ? raw.naam.trim() : "Onbekende overnachting";
    const startDateObj = parseInputDatum(raw.startDatum || "");
    const nachtenSafe = Math.max(1, Math.min(60, Number(raw.nachten) || 1));
    const lastNightObj = startDateObj ? plusDagen(startDateObj, nachtenSafe - 1) : null;

    const latSafe = typeof raw.latitude === "number" && Number.isFinite(raw.latitude) ? raw.latitude : null;
    const lonSafe = typeof raw.longitude === "number" && Number.isFinite(raw.longitude) ? raw.longitude : null;

    const locatieKey = latSafe !== null && lonSafe !== null
      ? `${latSafe.toFixed(3)},${lonSafe.toFixed(3)}`
      : naam.toLowerCase();

    const googleMapsUrl = raw.mapsLink || (latSafe !== null && lonSafe !== null ? getGoogleMapsUrl(latSafe, lonSafe) : null);
    const openStreetMapLink =
      raw.openStreetMapUrl || (latSafe !== null && lonSafe !== null ? getOpenStreetMapUrl(latSafe, lonSafe) : null);

    return {
      ...raw,
      id,
      shortlistSafe: raw.shortlist === true,
      naam,
      typeSafe: typeSafe(raw.type),
      nachtenSafe,
      startDateObj,
      lastNightObj,
      latSafe,
      lonSafe,
      locatieKey,
      kleur: kleurVoorLocatie(locatieKey),
      googleMapsUrl,
      openStreetMapLink
    };
  }

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
  let uniekeLocaties = $derived.by(() => new Set(overnachtingenMetDatum.map((o) => o.locatieKey)).size);

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

  function commitSelectie() {
    if (!selectieStartKey || !selectieEindKey) return;
    const start = parseDagKey(selectieStartKey);
    const end = parseDagKey(selectieEindKey);
    if (!start || !end) return;
    const dagen = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
    startDatumInput = selectieStartKey;
    nachtenInput = String(dagen);
    toonForm = true;
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

  function handleDayClick(dayKey: string, isLeeg: boolean) {
    if (isLeeg) return;
    if (Date.now() < onderdrukKlikTot) return;
    zetSelectie(dayKey, dayKey);
    commitSelectie();
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
    commitSelectie();
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
    commitSelectie();
    onderdrukKlikTot = Date.now() + 360;
  }

  function handleDayKeydown(event: KeyboardEvent, dayKey: string, isLeeg: boolean) {
    if (isLeeg) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleDayClick(dayKey, false);
  }

  function resetForm() {
    naamInput = "";
    typeInput = "camping";
    startDatumInput = "";
    nachtenInput = "1";
    latitudeInput = "";
    longitudeInput = "";
    notitiesInput = "";
    websiteUrlInput = "";
    bookingUrlInput = "";
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
    if (!naamInput.trim()) {
      toonSnackbar("Vul een naam in", "warning", E.WARN);
      return;
    }
    const coord = haalCoordinatenUitForm();
    if (!coord) return;

    const websiteUrl = normalizeUrl(websiteUrlInput);
    const bookingUrl = normalizeUrl(bookingUrlInput);
    try {
      await addDoc(collection(db, "campings"), {
        naam: naamInput.trim(),
        shortlist: true,
        type: typeInput,
        latitude: coord.latNum,
        longitude: coord.lonNum,
        mapsLink: coord.mapsLink,
        openStreetMapUrl: coord.osmLink,
        websiteUrl: websiteUrl || "",
        bookingUrl: bookingUrl || "",
        notities: notitiesInput.trim() || "",
        door: appState.gebruiker || "",
        datum: serverTimestamp()
      });
      toonShortlistForm = false;
      resetForm();
      toonSnackbar("Locatie aan shortlist toegevoegd", "success", E.CHECK);
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
    if (!naamInput.trim()) {
      toonSnackbar("Vul een naam in", "warning", E.WARN);
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
    const websiteUrl = normalizeUrl(websiteUrlInput);
    const bookingUrl = normalizeUrl(bookingUrlInput);

    try {
      await addDoc(collection(db, "campings"), {
        naam: naamInput.trim(),
        shortlist: false,
        type: typeInput,
        startDatum: startDatumInput,
        nachten,
        latitude: coord.latNum,
        longitude: coord.lonNum,
        mapsLink: coord.mapsLink,
        openStreetMapUrl: coord.osmLink,
        websiteUrl: websiteUrl || "",
        bookingUrl: bookingUrl || "",
        notities: notitiesInput.trim() || "",
        door: appState.gebruiker || "",
        datum: serverTimestamp()
      });
      geselecteerdeMaand = maandKeyVanDatum(start);
      toonForm = false;
      resetForm();
      toonSnackbar("Overnachting toegevoegd", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon overnachting niet opslaan", "error", E.KRUIS);
    }
  }

  async function planShortlistItem(item: OvernachtingView) {
    if (!startDatumInput) {
      const vandaag = dagKeyVanDatum(naarLokaleDag(new Date()));
      startDatumInput = vandaag;
    }
    naamInput = item.naam;
    typeInput = item.typeSafe;
    latitudeInput = item.latSafe !== null ? item.latSafe.toFixed(5) : "";
    longitudeInput = item.lonSafe !== null ? item.lonSafe.toFixed(5) : "";
    websiteUrlInput = item.websiteUrl || "";
    bookingUrlInput = item.bookingUrl || "";
    notitiesInput = item.notities || "";
    nachtenInput = "1";
    toonForm = true;
    toonShortlistForm = false;
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
      await updateDoc(doc(db, "campings", id), {
        shortlist: false,
        startDatum,
        nachten: nights,
        datum: serverTimestamp()
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
      await deleteDoc(doc(db, "campings", id));
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

    const ref = collection(db, "campings");
    const sorted = query(ref, orderBy("startDatum", "asc"));

    unsubscribe = onSnapshot(
      sorted,
      (snapshot) => {
        ruweOvernachtingen = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Overnachting) }));
      },
      () => {
        unsubscribe?.();
        unsubscribe = onSnapshot(ref, (snapshot) => {
          ruweOvernachtingen = snapshot.docs
            .map((d) => ({ id: d.id, ...(d.data() as Overnachting) }))
            .sort((a, b) => String(a.startDatum || "").localeCompare(String(b.startDatum || "")));
        });
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
      <button class="btn-primary ov-add" onclick={() => { toonForm = !toonForm; if (toonForm) toonShortlistForm = false; }}>
        {toonForm ? "Sluit planning" : "+ Plan overnachting"}
      </button>
      <button class="ov-secondary-btn" onclick={() => { toonShortlistForm = !toonShortlistForm; if (toonShortlistForm) toonForm = false; }}>
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
      <span>Unieke locaties</span>
      <strong>{uniekeLocaties}</strong>
    </div>
    <div class="ov-stat card">
      <span>Shortlist locaties</span>
      <strong>{shortlistOvernachtingen.length}</strong>
    </div>
  </div>

  {#if toonForm}
    <div class="card ov-form-card">
      <h3>Nieuwe overnachting</h3>
      <form class="ov-form" onsubmit={(e) => { e.preventDefault(); voegOvernachtingToe(); }}>
        <label>
          <span>Naam</span>
          <input bind:value={naamInput} placeholder="Bijv. Camping Le Lac" />
        </label>

        <label>
          <span>Type</span>
          <select bind:value={typeInput}>
            {#each TYPE_OPTIES as optie}
              <option value={optie.id}>{optie.label}</option>
            {/each}
          </select>
        </label>

        <label>
          <span>Aankomst datum</span>
          <input type="date" bind:value={startDatumInput} />
        </label>

        <label>
          <span>Aantal nachten</span>
          <input type="number" min="1" max="60" bind:value={nachtenInput} />
        </label>

        <label>
          <span>Latitude</span>
          <input bind:value={latitudeInput} placeholder="44.51234" inputmode="decimal" />
        </label>

        <label>
          <span>Longitude</span>
          <input bind:value={longitudeInput} placeholder="3.12345" inputmode="decimal" />
        </label>

        <label>
          <span>Website</span>
          <input bind:value={websiteUrlInput} placeholder="site.fr/locatie" />
        </label>

        <label>
          <span>Boekingslink</span>
          <input bind:value={bookingUrlInput} placeholder="booking.com/..." />
        </label>

        <label class="ov-notes">
          <span>Notities (optioneel)</span>
          <textarea rows="2" bind:value={notitiesInput} placeholder="Bijv. late check-in mogelijk"></textarea>
        </label>

        <div class="ov-preview">
          {#if vertrekPreview}
            <span>{E.KALENDER} Uitcheck: {vertrekPreview}</span>
          {/if}
          <button type="button" class="ov-gps-btn" onclick={gebruikHuidigeGps} disabled={gpsBezig}>
            {gpsBezig ? "GPS ophalen..." : `${E.PIN} Gebruik huidige GPS`}
          </button>
        </div>

        <div class="ov-actions">
          <button class="btn-success" type="submit">{E.CHECK} Opslaan</button>
          <button class="btn-danger" type="button" onclick={() => { toonForm = false; resetForm(); }}>{E.X}</button>
        </div>
      </form>
    </div>
  {/if}

  {#if toonShortlistForm}
    <div class="card ov-form-card">
      <h3>Nieuwe shortlist-locatie</h3>
      <form class="ov-form" onsubmit={(e) => { e.preventDefault(); voegShortlistToe(); }}>
        <label>
          <span>Naam</span>
          <input bind:value={naamInput} placeholder="Bijv. Eco BNB vallée du Tarn" />
        </label>

        <label>
          <span>Type</span>
          <select bind:value={typeInput}>
            {#each TYPE_OPTIES as optie}
              <option value={optie.id}>{optie.label}</option>
            {/each}
          </select>
        </label>

        <label>
          <span>Latitude</span>
          <input bind:value={latitudeInput} placeholder="44.51234" inputmode="decimal" />
        </label>

        <label>
          <span>Longitude</span>
          <input bind:value={longitudeInput} placeholder="3.12345" inputmode="decimal" />
        </label>

        <label>
          <span>Website</span>
          <input bind:value={websiteUrlInput} placeholder="site.fr/locatie" />
        </label>

        <label>
          <span>Boekingslink</span>
          <input bind:value={bookingUrlInput} placeholder="booking.com/..." />
        </label>

        <label class="ov-notes">
          <span>Waarom geschikt / notities</span>
          <textarea rows="2" bind:value={notitiesInput} placeholder="Bijv. rustig, aan rivier, honden welkom"></textarea>
        </label>

        <div class="ov-preview">
          <span>{E.PIN} Tip: voeg GPS toe voor snelle route in Google Maps.</span>
          <button type="button" class="ov-gps-btn" onclick={gebruikHuidigeGps} disabled={gpsBezig}>
            {gpsBezig ? "GPS ophalen..." : `${E.PIN} Gebruik huidige GPS`}
          </button>
        </div>

        <div class="ov-actions">
          <button class="btn-success" type="submit">{E.CHECK} Naar shortlist</button>
          <button class="btn-danger" type="button" onclick={() => { toonShortlistForm = false; resetForm(); }}>{E.X}</button>
        </div>
      </form>
    </div>
  {/if}

  <div class="card ov-calendar-card">
    <div class="ov-calendar-head">
      <button class="ov-month-btn" onclick={() => stapMaand(-1)} disabled={!kanVorigeMaand}>Vorige</button>
      <strong>{maandLabel(geselecteerdeMaand)}</strong>
      <button class="ov-month-btn" onclick={() => stapMaand(1)} disabled={!kanVolgendeMaand}>Volgende</button>
    </div>
    <p class="ov-calendar-hint">Tik op een dag voor 1 nacht, of swipe/drag over meerdere dagen voor een reeks.</p>

    <div class="ov-weekdays">
      {#each WEEKDAGEN as wd}
        <div>{wd}</div>
      {/each}
    </div>

    <div class="ov-grid" class:selecting={selectieActief}>
      {#each kalenderCels as cel (cel.key)}
        <button
          type="button"
          class="ov-day"
          class:leeg={cel.isLeeg}
          class:vandaag={cel.isVandaag}
          class:geselecteerd={dagInSelectie(cel.key, cel.isLeeg)}
          class:selectiestart={dagIsSelectieStart(cel.key, cel.isLeeg)}
          class:selectieeinde={dagIsSelectieEinde(cel.key, cel.isLeeg)}
          data-daykey={cel.isLeeg ? undefined : cel.key}
          disabled={cel.isLeeg}
          aria-label={cel.isLeeg ? undefined : `Kies datum ${cel.key}`}
          onmousedown={(event) => handleDayMouseDown(event, cel.key, cel.isLeeg)}
          onmouseenter={() => handleDayMouseEnter(cel.key, cel.isLeeg)}
          onclick={() => handleDayClick(cel.key, cel.isLeeg)}
          ontouchstart={(event) => handleDayTouchStart(event, cel.key, cel.isLeeg)}
          onkeydown={(event) => handleDayKeydown(event, cel.key, cel.isLeeg)}
        >
          {#if cel.dagNummer !== null}
            <div class="ov-day-number">{cel.dagNummer}</div>
            {#if cel.entries.length > 0}
              <div class="ov-day-events">
                {#each cel.entries.slice(0, 2) as ent}
                  <div class="ov-chip" style={`--loc-kleur:${ent.kleur}`} title={`${ent.naam} (${ent.nachtenSafe} nacht${ent.nachtenSafe > 1 ? "en" : ""})`}>
                    <span>{ent.naam}</span>
                  </div>
                {/each}
                {#if cel.entries.length > 2}
                  <div class="ov-more">+{cel.entries.length - 2}</div>
                {/if}
              </div>
            {/if}
          {/if}
        </button>
      {/each}
    </div>

    {#if locatieLegenda.length > 0}
      <div class="ov-legend">
        {#each locatieLegenda as l}
          <div class="ov-legend-item">
            <span class="ov-legend-dot" style={`background:${l.kleur}`}></span>
            <span>{l.naam}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="card ov-list-card">
    <h3>Shortlist geschikte locaties</h3>
    {#if shortlistOvernachtingen.length === 0}
      <p class="ov-empty">Nog geen shortlist-locaties. Voeg plekken toe die je later wilt boeken.</p>
    {:else}
      <div class="ov-list">
        {#each shortlistOvernachtingen as o (o.id)}
          <article class="ov-item ov-shortlist-item" style={`--loc-kleur:${o.kleur}`}>
            <div class="ov-item-head">
              <strong>{o.naam}</strong>
              <button class="ov-delete" onclick={() => verwijderOvernachting(o.id, o.naam)}>{E.PRULLENBAK}</button>
            </div>
            <div class="ov-meta">
              <span>Type: {TYPE_OPTIES.find((x) => x.id === o.typeSafe)?.label || "Camping"}</span>
              <span>Status: Shortlist</span>
              {#if o.latSafe !== null && o.lonSafe !== null}
                <span>GPS klaar</span>
              {/if}
            </div>

            {#if o.latSafe !== null && o.lonSafe !== null}
              <div class="ov-coords">
                GPS: {o.latSafe.toFixed(5)}, {o.lonSafe.toFixed(5)}
              </div>
            {/if}

            <div class="ov-links">
              {#if o.googleMapsUrl}
                <a href={o.googleMapsUrl} target="_blank" rel="noopener noreferrer">{E.PIN} Google Maps</a>
              {/if}
              {#if o.websiteUrl}
                <a href={o.websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>
              {/if}
              {#if o.bookingUrl}
                <a href={o.bookingUrl} target="_blank" rel="noopener noreferrer">Boeken</a>
              {/if}
            </div>

            {#if o.notities}
              <p class="ov-note">{o.notities}</p>
            {/if}

            <div class="ov-shortlist-actions">
              <button class="ov-secondary-btn" onclick={() => planShortlistItem(o)}>Plan met formulier</button>
              <button class="btn-primary" onclick={() => planShortlistVanafVandaag(o)}>Plan vanaf vandaag</button>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>

  <div class="card ov-list-card">
    <h3>Alle overnachtingen</h3>
    {#if ingeplandeOvernachtingen.length === 0}
      <p class="ov-empty">Nog geen overnachtingen toegevoegd.</p>
    {:else}
      <div class="ov-list">
        {#each ingeplandeOvernachtingen as o (o.id)}
          <article class="ov-item" style={`--loc-kleur:${o.kleur}`}>
            <div class="ov-item-head">
              <strong>{o.naam}</strong>
              <button class="ov-delete" onclick={() => verwijderOvernachting(o.id, o.naam)}>{E.PRULLENBAK}</button>
            </div>
            <div class="ov-meta">
              <span>Type: {TYPE_OPTIES.find((x) => x.id === o.typeSafe)?.label || "Camping"}</span>
              {#if o.startDateObj}
                <span>Aankomst: {o.startDateObj.toLocaleDateString("nl-NL")}</span>
                <span>Nachten: {o.nachtenSafe}</span>
                <span>Laatste nacht: {(o.lastNightObj as Date).toLocaleDateString("nl-NL")}</span>
              {:else}
                <span>Datum nog niet ingevuld</span>
              {/if}
              <span>Door: {o.door || "-"}</span>
            </div>

            {#if o.latSafe !== null && o.lonSafe !== null}
              <div class="ov-coords">
                GPS: {o.latSafe.toFixed(5)}, {o.lonSafe.toFixed(5)}
              </div>
            {/if}

            <div class="ov-links">
              {#if o.googleMapsUrl}
                <a href={o.googleMapsUrl} target="_blank" rel="noopener noreferrer">{E.PIN} Google Maps</a>
              {/if}
              {#if o.openStreetMapLink}
                <a href={o.openStreetMapLink} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
              {/if}
            </div>

            {#if o.notities}
              <p class="ov-note">{o.notities}</p>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </div>

  {#if overnachtingenZonderDatum.length > 0}
    <div class="card ov-warning">
      <strong>{E.WARN} Nog zonder kalenderdatum</strong>
      <p>{overnachtingenZonderDatum.length} ingeplande item(s) missen een aankomstdatum en staan daarom nog niet in de kalender.</p>
    </div>
  {/if}
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
    min-height: 42px;
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
    min-height: 40px;
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, #e8f2fc);
    color: var(--blauw);
    font-weight: 700;
    padding: 0 12px;
    border-radius: 10px;
  }

  .ov-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
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

  .ov-form-card {
    margin: 0;
  }
  .ov-form-card h3 {
    margin-bottom: 10px;
    font-size: var(--font-size-xl);
  }
  .ov-form {
    display: grid;
    gap: 10px;
  }
  .ov-form label {
    display: grid;
    gap: 5px;
  }
  .ov-form label span {
    font-size: 0.74rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--nav-text);
  }
  .ov-form input,
  .ov-form select,
  .ov-form textarea {
    margin: 0;
    font-size: var(--font-size-md);
    font-family: inherit;
  }
  .ov-notes {
    grid-column: 1 / -1;
  }
  .ov-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--blauw);
    font-weight: 600;
    font-size: var(--font-size-sm);
  }
  .ov-gps-btn {
    width: auto;
    min-height: 36px;
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, #e8f2fc);
    color: var(--blauw);
    font-weight: 700;
    padding: 6px 10px;
  }
  .ov-actions {
    display: flex;
    gap: 8px;
  }
  .ov-actions .btn-success {
    flex: 1;
    font-weight: 700;
  }
  .ov-actions .btn-danger {
    width: 52px;
    font-weight: 700;
    padding: 0;
  }

  .ov-calendar-card {
    margin: 0;
    padding: 14px;
  }
  .ov-calendar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .ov-calendar-head strong {
    font-size: var(--font-size-lg);
    text-transform: capitalize;
    color: var(--heading);
  }
  .ov-calendar-hint {
    margin: -2px 0 10px;
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    font-weight: 500;
  }
  .ov-month-btn {
    width: auto;
    min-height: 34px;
    padding: 0 10px;
    font-size: var(--font-size-sm);
    font-weight: 700;
    border: 1px solid var(--input-border);
    background: var(--hover-bg);
    color: var(--heading);
  }
  .ov-month-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ov-weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 6px;
  }
  .ov-weekdays div {
    text-align: center;
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: var(--nav-text);
  }

  .ov-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
  }
  .ov-grid.selecting {
    user-select: none;
  }
  .ov-day {
    appearance: none;
    width: 100%;
    min-height: 88px;
    border: 1px solid var(--input-border);
    border-radius: 10px;
    padding: 6px;
    background: var(--card-bg);
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
    touch-action: none;
    text-align: left;
    font: inherit;
  }
  .ov-day.leeg {
    background: var(--hover-bg);
    border-style: dashed;
    opacity: 0.55;
    cursor: default;
    touch-action: auto;
  }
  .ov-day:disabled {
    pointer-events: none;
  }
  .ov-day.vandaag {
    border-color: var(--blauw);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--blauw) 30%, transparent);
  }
  .ov-day.geselecteerd {
    background: color-mix(in srgb, var(--card-bg) 80%, #dbeafe);
    border-color: color-mix(in srgb, var(--blauw) 40%, #cbd5e1);
  }
  .ov-day.selectiestart,
  .ov-day.selectieeinde {
    border-color: var(--blauw);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--blauw) 35%, transparent);
  }
  .ov-day-number {
    font-size: var(--font-size-sm);
    font-weight: 800;
    color: var(--heading);
  }
  .ov-day-events {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ov-chip {
    --loc-kleur: #2563eb;
    font-size: 0.72rem;
    font-weight: 700;
    border-radius: 8px;
    padding: 3px 5px;
    background: color-mix(in srgb, var(--loc-kleur) 16%, white);
    border: 1px solid color-mix(in srgb, var(--loc-kleur) 35%, white);
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ov-chip span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ov-more {
    font-size: 0.72rem;
    color: var(--nav-text);
    font-weight: 700;
    padding-left: 2px;
  }

  .ov-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 7px 12px;
    margin-top: 12px;
  }
  .ov-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-xs);
    color: var(--tekst);
    font-weight: 600;
  }
  .ov-legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  .ov-list-card {
    margin: 0;
  }
  .ov-list-card h3 {
    margin-bottom: 10px;
  }
  .ov-list {
    display: grid;
    gap: 10px;
  }
  .ov-item {
    --loc-kleur: #2563eb;
    border: 1px solid var(--border-subtle);
    border-left: 6px solid var(--loc-kleur);
    border-radius: 12px;
    padding: 10px 10px 10px 12px;
    background: var(--card-bg);
  }
  .ov-shortlist-item {
    border-left-color: color-mix(in srgb, var(--loc-kleur) 70%, #10b981);
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.52) 0%, #fff 72%);
  }
  .ov-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ov-item-head strong {
    font-size: var(--font-size-lg);
    color: var(--heading);
  }
  .ov-delete {
    width: auto;
    padding: 2px 6px;
    font-size: 1rem;
    background: transparent;
    border: none;
    opacity: 0.7;
  }
  .ov-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 5px;
  }
  .ov-meta span {
    font-size: var(--font-size-sm);
    color: var(--tekst);
    background: var(--hover-bg);
    border: 1px solid var(--border-subtle);
    border-radius: 999px;
    padding: 3px 8px;
  }
  .ov-coords {
    margin-top: 7px;
    font-size: var(--font-size-sm);
    color: var(--blauw);
    font-weight: 600;
  }
  .ov-links {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ov-links a {
    font-size: var(--font-size-sm);
    color: var(--blauw);
    text-decoration: none;
    font-weight: 700;
  }
  .ov-note {
    margin-top: 7px;
    font-size: var(--font-size-sm);
    color: var(--tekst);
  }
  .ov-shortlist-actions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ov-shortlist-actions .btn-primary {
    width: auto;
    min-height: 38px;
    padding: 0 12px;
  }
  .ov-empty {
    color: var(--nav-text);
    margin: 0;
  }

  .ov-warning {
    margin: 0;
    border: 1px solid #f7d5aa;
    background: color-mix(in srgb, var(--card-bg) 84%, #fff7ed);
  }
  .ov-warning strong {
    color: #9a3412;
  }
  .ov-warning p {
    margin-top: 4px;
    color: #9a3412;
    font-size: 0.9rem;
  }

  @media (max-width: 760px) {
    .ov-stats {
      grid-template-columns: 1fr 1fr;
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
      width: calc(50% - 4px);
    }
    .ov-secondary-btn {
      width: calc(50% - 4px);
      text-align: center;
    }
    .ov-day {
      min-height: 76px;
    }
    .ov-chip {
      font-size: 0.64rem;
      padding: 2px 4px;
    }
  }

  @media (min-width: 840px) {
    .ov-form {
      grid-template-columns: 1fr 1fr;
    }
    .ov-preview,
    .ov-actions {
      grid-column: 1 / -1;
    }
  }

  :global(html.dark) .ov-top p,
  :global(html.dark) .ov-weekdays div,
  :global(html.dark) .ov-more,
  :global(html.dark) .ov-empty,
  :global(html.dark) .ov-calendar-hint {
    color: #94a3b8;
  }
  :global(html.dark) .ov-stat,
  :global(html.dark) .ov-day,
  :global(html.dark) .ov-item,
  :global(html.dark) .ov-month-btn,
  :global(html.dark) .ov-meta span {
    background: #111827;
    border-color: #334155;
  }
  :global(html.dark) .ov-day.leeg {
    background: #0f172a;
  }
  :global(html.dark) .ov-day.geselecteerd {
    background: #10233f;
    border-color: #3b82f6;
  }
  :global(html.dark) .ov-day-number,
  :global(html.dark) .ov-calendar-head strong,
  :global(html.dark) .ov-item-head strong,
  :global(html.dark) .ov-stat strong {
    color: #e2e8f0;
  }
  :global(html.dark) .ov-stat span,
  :global(html.dark) .ov-meta span,
  :global(html.dark) .ov-note,
  :global(html.dark) .ov-legend-item {
    color: #cbd5e1;
  }
  :global(html.dark) .ov-chip {
    color: #e2e8f0;
  }
  :global(html.dark) .ov-gps-btn {
    background: #1e3a8a;
    color: #dbeafe;
    border-color: #2563eb;
  }
  :global(html.dark) .ov-secondary-btn {
    background: #1e3a8a;
    color: #dbeafe;
    border-color: #2563eb;
  }
  :global(html.dark) .ov-shortlist-item {
    background: linear-gradient(180deg, rgba(30, 58, 138, 0.35) 0%, #111827 72%);
  }
</style>
