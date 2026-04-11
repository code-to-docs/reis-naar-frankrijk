import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PoiFormModal from "./PoiFormModal.svelte";

const snackbarMock = vi.hoisted(() => vi.fn());

vi.mock("$lib/stores.svelte.js", () => ({
  toonSnackbar: snackbarMock
}));

describe("PoiFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blokkeert submit bij te korte naam en toont waarschuwing", async () => {
    const onSave = vi.fn();
    const { getByRole } = render(PoiFormModal, {
      open: true,
      poi: null,
      currentUser: "Dennis",
      onClose: vi.fn(),
      onSave
    });

    await fireEvent.click(getByRole("button", { name: "Suggestie opslaan" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(snackbarMock).toHaveBeenCalledWith("Geef de suggestie een duidelijke naam", "warning", expect.any(String));
  });

  it("roept onSave aan met genormaliseerde payload", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByRole } = render(PoiFormModal, {
      open: true,
      poi: null,
      currentUser: "Dennis",
      onClose: vi.fn(),
      onSave
    });

    await fireEvent.input(getByPlaceholderText("Bijv. Pont du Gard"), { target: { value: "Pont du Gard" } });
    await fireEvent.input(getByPlaceholderText("Bijv. Avignon of centrum Toulouse"), { target: { value: "Occitanie" } });
    await fireEvent.input(getByPlaceholderText("Optioneel: officiele website"), { target: { value: "example.com" } });
    await fireEvent.click(getByRole("button", { name: "Suggestie opslaan" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        naam: "Pont du Gard",
        locatieNaam: "Occitanie",
        websiteUrl: "https://example.com",
        door: "Dennis"
      })
    );
  });

  it("toont foutreactie als onSave faalt", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("save failed"));
    const { getByPlaceholderText, getByRole } = render(PoiFormModal, {
      open: true,
      poi: null,
      currentUser: "Dennis",
      onClose: vi.fn(),
      onSave
    });

    await fireEvent.input(getByPlaceholderText("Bijv. Pont du Gard"), { target: { value: "Pont du Gard" } });
    await fireEvent.click(getByRole("button", { name: "Suggestie opslaan" }));

    await waitFor(() =>
      expect(snackbarMock).toHaveBeenCalledWith("Opslaan mislukt", "error", expect.any(String))
    );
  });
});
