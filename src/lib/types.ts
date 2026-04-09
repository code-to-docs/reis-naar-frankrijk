import type { Timestamp } from "firebase/firestore";

export interface Uitgave {
    id?: string;
    bedrag: number;
    categorie: string;
    omschrijving: string;
    door: string;
    datum: Timestamp;
}

export interface Spotting {
    id?: string;
    gespot: boolean;
    door: string;
    datum: Timestamp | string;
    notitie?: string;
    locatie?: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    openStreetMapUrl?: string;
}

export interface LijstItem {
    id?: string;
    naam: string;
    door: string;
    datum: Timestamp;
    gedaan?: boolean;
    notities?: string;
    mapsLink?: string;
    afgevinktDoor?: string;
}

export type OvernachtingType = "hotel" | "bnb" | "camping";

export interface Overnachting {
    id?: string;
    naam: string;
    door: string;
    datum?: Timestamp;
    shortlist?: boolean;
    type?: OvernachtingType;
    adres?: string;
    startDatum?: string;
    nachten?: number;
    latitude?: number | null;
    longitude?: number | null;
    notities?: string;
    websiteUrl?: string;
    bookingUrl?: string;
    mapsLink?: string;
    openStreetMapUrl?: string;
}

export interface BudgetCategorie {
    id: string;
    emoji: string;
    label: string;
    kleur: string;
}

export interface WeerInfo {
    emoji: string;
    tekst: string;
}

export interface WeerDag {
    datum: string;
    dagNaam: string;
    datumKort: string;
    weerInfo: WeerInfo;
    maxTemp: number;
    minTemp: number;
    gevoelMax: number;
    gevoelMin: number;
    neerslagKans: number;
    windMax: number;
    zonsopkomst?: string;
    zonsondergang?: string;
}

export interface AlertPhenomenon {
    id?: string;
    label: string;
    level?: number;
    levelLabel?: string;
    tone?: string;
}

export interface Alert {
    active: boolean;
    regionName: string;
    level: number;
    levelLabel: string;
    sourceLabel: string;
    url: string;
    tone?: string;
    activePhenomena: AlertPhenomenon[];
    validUntil?: string | null;
    updatedAt?: string | null;
}

export interface WeatherAlertsPayload {
    generatedAt: string;
    officialAlerts: Alert[];
    summary: {
        hasOfficialAlert: boolean;
        highestLevel: number;
    };
    sources: {
        meteoFranceUrl: string;
    };
}

export type WildlifeCategorie = "roofvogel" | "zoogdier" | "reptiel_amfibie" | "insect";
export type WildlifeRegio = "lozere" | "cantal" | "pyrenees";
export type WildlifeZeldzaamheid = 1 | 2 | 3;

export interface Wildlife {
    id: string;
    naam: string;
    duits: string;
    latijn: string;
    wiki: string;
    kenmerken: string;
    waar_wanneer: string;
    categorie: WildlifeCategorie;
    regios: WildlifeRegio[];
    zeldzaamheid: WildlifeZeldzaamheid;
    geluid: string | null;
}

export interface Gerecht {
    id: string;
    naam: string;
    frans: string;
    omschrijving: string;
    soort: string;
    smaak: string;
    streken: string[];
    vegetarisch: boolean;
    vis?: boolean;
    emoji?: string;
}

export interface GerechtCheck {
    id?: string;
    gerechtId: string;
    door: string;
    geproefd?: boolean;
    datum?: Timestamp | string | null;
    rating?: number;
}
