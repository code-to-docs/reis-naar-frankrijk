import { parseLocalizedNumber } from "$lib/utils/formatters.js";
import type { Overnachting, OvernachtingType } from "$lib/types.js";
import type { OvernachtingView } from "./types.js";

export const WEEKDAGEN = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

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

export function naarLokaleDag(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

export function parseInputDatum(value?: string | null) {
  if (!value || typeof value !== "string") return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const parsed = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function dagKeyVanDatum(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDagKey(dayKey: string) {
  return parseInputDatum(dayKey);
}

export function maandKeyVanDatum(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export function maandLabel(maandKey: string) {
  const [year, month] = maandKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric"
  });
}

export function plusDagen(d: Date, dagen: number) {
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

export function coordOrNull(raw: string): number | null {
  if (!raw.trim()) return null;
  const parsed = parseLocalizedNumber(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function getGoogleMapsUrl(lat: number, lon: number) {
  const q = `${lat},${lon}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
}

export function getGoogleMapsAddressUrl(adres: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`;
}

export function getOpenStreetMapUrl(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
}

export function normalizeOvernachting(id: string, raw: Overnachting): OvernachtingView {
  const naam = typeof raw.naam === "string" && raw.naam.trim() ? raw.naam.trim() : "Onbekende overnachting";
  const adres = typeof raw.adres === "string" && raw.adres.trim() ? raw.adres.trim() : "";
  const startDateObj = parseInputDatum(raw.startDatum || "");
  const nachtenSafe = Math.max(1, Math.min(60, Number(raw.nachten) || 1));
  const lastNightObj = startDateObj ? plusDagen(startDateObj, nachtenSafe - 1) : null;

  const latSafe = typeof raw.latitude === "number" && Number.isFinite(raw.latitude) ? raw.latitude : null;
  const lonSafe = typeof raw.longitude === "number" && Number.isFinite(raw.longitude) ? raw.longitude : null;

  const locatieKey = latSafe !== null && lonSafe !== null
    ? `${latSafe.toFixed(3)},${lonSafe.toFixed(3)}`
    : (adres || naam).toLowerCase();

  const googleMapsUrl =
    raw.mapsLink ||
    (latSafe !== null && lonSafe !== null
      ? getGoogleMapsUrl(latSafe, lonSafe)
      : adres
        ? getGoogleMapsAddressUrl(adres)
        : null);
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
