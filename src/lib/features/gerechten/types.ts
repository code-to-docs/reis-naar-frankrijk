import type { Timestamp } from "firebase/firestore";

export interface Gerecht {
  id: string;
  naam: string;
  frans: string;
  soort: string;
  streken: string[];
  omschrijving: string;
  emoji: string;
  vegetarisch: boolean;
  vis: boolean;
  smaak: string;
}

export interface GerechtCheck {
  id?: string;
  gerechtId: string;
  door: string;
  geproefd?: boolean;
  rating?: number;
  datum?: Timestamp;
}

export interface FilterState {
  search: string;
  dieet: string;
  smaak: string;
  soort: string;
  streek: string;
  status: string;
}

export interface FotoCache {
  thumb: Record<string, string>;
  full: Record<string, string>;
  missing: string[];
}
