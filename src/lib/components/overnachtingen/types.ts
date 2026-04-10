import type { Overnachting, OvernachtingType } from "$lib/types.js";

export type OvernachtingView = Overnachting & {
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

export type KalenderCel = {
  key: string;
  dagNummer: number | null;
  entries: OvernachtingView[];
  isVandaag: boolean;
  isLeeg: boolean;
};

export type LocatieLegendaItem = {
  key: string;
  naam: string;
  kleur: string;
  count: number;
};
