import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GerechtCard from "./GerechtCard.svelte";

const firestore = vi.hoisted(() => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn()
}));

const snackbarMock = vi.hoisted(() => vi.fn());
const dbMock = vi.hoisted(() => ({ __db: true }));

vi.mock("firebase/firestore", () => ({
  deleteDoc: firestore.deleteDoc,
  doc: firestore.doc,
  serverTimestamp: firestore.serverTimestamp,
  setDoc: firestore.setDoc,
  updateDoc: firestore.updateDoc
}));

vi.mock("$lib/firebase.js", () => ({
  db: dbMock
}));

vi.mock("$lib/stores.svelte.js", () => ({
  toonSnackbar: snackbarMock
}));

describe("GerechtCard", () => {
  const gerecht = {
    id: "ratatouille",
    naam: "Ratatouille",
    frans: "Ratatouille",
    omschrijving: "Een klassiek gerecht uit de Provence.",
    soort: "hoofdgerecht",
    smaak: "hartig",
    streken: ["provence"],
    vegetarisch: true,
    vis: false,
    emoji: "🍲"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestore.doc.mockImplementation((db: unknown, collection: string, id: string) => ({ db, collection, id }));
    firestore.serverTimestamp.mockReturnValue({ __type: "serverTimestamp" });
  });

  it("activeert de toggle-knop en markeert als geproefd", async () => {
    const onToggle = vi.fn();
    firestore.setDoc.mockResolvedValue(undefined);
    const { getByRole, getByText } = render(GerechtCard, {
      gerecht,
      checks: {},
      currentUser: "Dennis",
      isExpanded: true,
      onToggle
    });

    await fireEvent.click(getByRole("button", { name: "Ratatouille geproefd" }));

    await waitFor(() => expect(firestore.setDoc).toHaveBeenCalledTimes(1));
    expect(getByText("Ratatouille")).toBeInTheDocument();
    expect(snackbarMock).toHaveBeenCalledWith("Ratatouille geproefd!", "success", expect.any(String));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("slaat rating op wanneer gebruiker al geproefd heeft", async () => {
    firestore.updateDoc.mockResolvedValue(undefined);
    const { getByRole } = render(GerechtCard, {
      gerecht,
      checks: {
        dennis: {
          gerechtId: "ratatouille",
          door: "Dennis",
          geproefd: true,
          rating: 2
        }
      },
      currentUser: "Dennis",
      isExpanded: true,
      onToggle: vi.fn()
    });

    await fireEvent.click(getByRole("button", { name: "Geef 5 sterren" }));

    await waitFor(() => expect(firestore.updateDoc).toHaveBeenCalledTimes(1));
    expect(snackbarMock).toHaveBeenCalledWith("Rating opgeslagen: 5/5", "success", expect.any(String));
  });
});
