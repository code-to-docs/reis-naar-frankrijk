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
