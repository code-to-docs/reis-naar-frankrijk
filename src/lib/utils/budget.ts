import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { getDayKey, getFriendlyDayLabel } from "./formatters.js";

export type DatumLike = { seconds?: number } | Date | string | null | undefined;

export type UitgaveItem = {
  id: string;
  bedrag: number;
  categorie: string;
  omschrijving: string;
  door: string;
  datum?: DatumLike;
};

export type DagGroep = { key: string; label: string; items: UitgaveItem[]; totaal: number };

export function getEpoch(datum?: DatumLike) {
  if (datum && typeof datum === "object" && "seconds" in datum && typeof datum.seconds === "number") {
    return datum.seconds;
  }
  if (datum instanceof Date) return Math.floor(datum.getTime() / 1000);
  if (typeof datum === "string") return Math.floor(new Date(datum).getTime() / 1000) || 0;
  return 0;
}

type UitgaveInput = Omit<Partial<UitgaveItem>, "bedrag"> & { bedrag?: number | string };

export function normalizeUitgave(id: string, data: UitgaveInput): UitgaveItem {
  return {
    id,
    bedrag: Number(data.bedrag) || 0,
    categorie: data.categorie || "overig",
    omschrijving: data.omschrijving || "",
    door: data.door || "",
    datum: data.datum ?? null
  };
}

export function mapUitgavenSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs
    .map((d) => normalizeUitgave(d.id, d.data() as UitgaveInput))
    .sort((a, b) => getEpoch(b.datum) - getEpoch(a.datum));
}

export function groepeerUitgaven(items: UitgaveItem[]): DagGroep[] {
  const groepen: DagGroep[] = [];
  const groepMap: Record<string, DagGroep> = {};

  for (const u of items) {
    const key = getDayKey(u.datum);
    if (!groepMap[key]) {
      groepMap[key] = { key, label: getFriendlyDayLabel(u.datum), items: [], totaal: 0 };
      groepen.push(groepMap[key]);
    }
    groepMap[key].items.push(u);
    groepMap[key].totaal += Number(u.bedrag) || 0;
  }
  return groepen;
}

export function berekenVerrekening(items: UitgaveItem[]) {
  let franziBetaald = 0;
  let dennisBetaald = 0;

  for (const u of items) {
    if (u.door === "Franzi") franziBetaald += Number(u.bedrag) || 0;
    else if (u.door === "Dennis") dennisBetaald += Number(u.bedrag) || 0;
  }

  return {
    franziBetaald,
    dennisBetaald,
    verschil: Math.abs(franziBetaald - dennisBetaald) / 2
  };
}
