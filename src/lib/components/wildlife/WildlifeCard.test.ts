import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WildlifeCard from "./WildlifeCard.svelte";

const firestore = vi.hoisted(() => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn()
}));

const locationMock = vi.hoisted(() => ({
  buildMapsLinks: vi.fn(),
  getCurrentCoords: vi.fn(),
  reverseGeocode: vi.fn()
}));

const snackbarMock = vi.hoisted(() => vi.fn());
const hapticMock = vi.hoisted(() => vi.fn());
const dbMock = vi.hoisted(() => ({ __db: true }));

vi.mock("firebase/firestore", () => ({
  deleteDoc: firestore.deleteDoc,
  doc: firestore.doc,
  serverTimestamp: firestore.serverTimestamp,
  setDoc: firestore.setDoc
}));

vi.mock("$lib/firebase.js", () => ({
  db: dbMock
}));

vi.mock("$lib/stores.svelte.js", () => ({
  toonSnackbar: snackbarMock
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: hapticMock
}));

vi.mock("./locationUtils.js", () => ({
  buildMapsLinks: locationMock.buildMapsLinks,
  getCurrentCoords: locationMock.getCurrentCoords,
  reverseGeocode: locationMock.reverseGeocode
}));

describe("WildlifeCard", () => {
  const dier = {
    id: "vos",
    naam: "Vos",
    duits: "Fuchs",
    latijn: "Vulpes vulpes",
    wiki: "Red_fox",
    kenmerken: "Roodbruin, snelle jager",
    waar_wanneer: "Schemering in bosranden",
    categorie: "zoogdier",
    regios: ["lozere"],
    zeldzaamheid: 1,
    geluid: null
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    firestore.doc.mockImplementation((db: unknown, collection: string, id: string) => ({ db, collection, id }));
    firestore.serverTimestamp.mockReturnValue({ __type: "serverTimestamp" });
    locationMock.getCurrentCoords.mockResolvedValue({ lat: 44.1, lon: 3.2 });
    locationMock.reverseGeocode.mockResolvedValue("Lozere");
    locationMock.buildMapsLinks.mockReturnValue({
      google: "https://maps.google.com/?q=44.1,3.2",
      osm: "https://www.openstreetmap.org/?mlat=44.1&mlon=3.2"
    });
  });

  it("slaat een spotting op via de knop en toont succesreactie", async () => {
    const onToggle = vi.fn();
    firestore.setDoc.mockResolvedValue(undefined);
    const { getByRole } = render(WildlifeCard, {
      dier,
      spotting: null,
      foto: "",
      groteFoto: "",
      isExpanded: true,
      currentUser: "Dennis",
      onToggle
    });

    await fireEvent.click(getByRole("button", { name: "Vos gespot!" }));

    await waitFor(() => expect(firestore.setDoc).toHaveBeenCalledTimes(1));
    expect(snackbarMock).toHaveBeenCalledWith("Vos gespot!", "success", expect.any(String));
    expect(hapticMock).toHaveBeenCalledWith("success");
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("kan spotting ongedaan maken met juiste reactie", async () => {
    firestore.deleteDoc.mockResolvedValue(undefined);
    const { getByRole } = render(WildlifeCard, {
      dier,
      spotting: {
        gespot: true,
        door: "Dennis",
        datum: "2026-04-11T10:00:00Z"
      },
      foto: "",
      groteFoto: "",
      isExpanded: true,
      currentUser: "Dennis",
      onToggle: vi.fn()
    });

    await fireEvent.click(getByRole("button", { name: "↩️ Spotting ongedaan maken" }));

    await waitFor(() => expect(firestore.deleteDoc).toHaveBeenCalledTimes(1));
    expect(snackbarMock).toHaveBeenCalledWith("Spotting ongedaan gemaakt", "warning", expect.any(String));
    expect(hapticMock).toHaveBeenCalledWith("light");
  });
});
