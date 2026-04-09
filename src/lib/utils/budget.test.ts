import { describe, expect, it } from "vitest";
import {
  berekenVerrekening,
  getEpoch,
  groepeerUitgaven,
  normalizeUitgave,
  type UitgaveItem
} from "./budget";

describe("budget utils", () => {
  it("normalizes and defaults missing fields", () => {
    const item = normalizeUitgave("x1", { bedrag: "12.5", door: "Dennis" });
    expect(item).toEqual({
      id: "x1",
      bedrag: 12.5,
      categorie: "overig",
      omschrijving: "",
      door: "Dennis",
      datum: null
    });
  });

  it("groups items per day and totals per day", () => {
    const items: UitgaveItem[] = [
      { id: "1", bedrag: 10, categorie: "overig", omschrijving: "A", door: "Franzi", datum: "2026-07-14T10:00:00Z" },
      { id: "2", bedrag: 5, categorie: "overig", omschrijving: "B", door: "Dennis", datum: "2026-07-14T12:00:00Z" },
      { id: "3", bedrag: 7, categorie: "overig", omschrijving: "C", door: "Franzi", datum: "2026-07-15T08:00:00Z" }
    ];

    const grouped = groepeerUitgaven(items);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].totaal).toBe(15);
    expect(grouped[1].totaal).toBe(7);
  });

  it("computes settlement split correctly", () => {
    const items: UitgaveItem[] = [
      { id: "1", bedrag: 100, categorie: "overig", omschrijving: "", door: "Franzi" },
      { id: "2", bedrag: 40, categorie: "overig", omschrijving: "", door: "Dennis" }
    ];

    const result = berekenVerrekening(items);
    expect(result.franziBetaald).toBe(100);
    expect(result.dennisBetaald).toBe(40);
    expect(result.verschil).toBe(30);
  });

  it("parses supported date formats to epoch seconds", () => {
    expect(getEpoch({ seconds: 12 })).toBe(12);
    expect(getEpoch("1970-01-01T00:00:10Z")).toBe(10);
    expect(getEpoch(new Date("1970-01-01T00:00:15Z"))).toBe(15);
  });
});
