import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import OvernachtingenFormPanel from "./OvernachtingenFormPanel.svelte";

const baseProps = {
  showPlanningForm: true,
  showShortlistForm: false,
  editItemId: null,
  typeOpties: [
    { id: "camping", label: "Camping", emoji: "🏕️" },
    { id: "hotel", label: "Hotel", emoji: "🏨" }
  ],
  formValues: {
    naam: "",
    type: "camping" as const,
    startDatum: "",
    nachten: "1",
    latitude: "",
    longitude: "",
    adres: "",
    websiteUrl: "",
    bookingUrl: "",
    notities: ""
  },
  vertrekPreview: "",
  gpsBezig: false,
  emojiKalender: "📅",
  emojiPin: "📍",
  onFieldChange: vi.fn(),
  onSubmitPlanning: vi.fn(),
  onSubmitShortlist: vi.fn(),
  onGebruikGps: vi.fn(),
  onCloseForms: vi.fn(),
  setPlanningFormEl: vi.fn(),
  setShortlistFormEl: vi.fn()
};

describe("OvernachtingenFormPanel", () => {
  it("triggert planning submit en veldwijzigingen", async () => {
    const props = {
      ...baseProps,
      onFieldChange: vi.fn(),
      onSubmitPlanning: vi.fn()
    };
    const { getByPlaceholderText, getByRole } = render(OvernachtingenFormPanel, props);

    await fireEvent.input(getByPlaceholderText("Bijv. Camping Le Lac"), {
      target: { value: "Camping de Test" }
    });
    await fireEvent.submit(getByRole("button", { name: "Opslaan" }).closest("form") as HTMLFormElement);

    expect(props.onFieldChange).toHaveBeenCalledWith("naam", "Camping de Test");
    expect(props.onSubmitPlanning).toHaveBeenCalledTimes(1);
  });

  it("triggert shortlist submit en GPS knop", async () => {
    const props = {
      ...baseProps,
      showPlanningForm: false,
      showShortlistForm: true,
      onSubmitShortlist: vi.fn(),
      onGebruikGps: vi.fn()
    };
    const { getByRole } = render(OvernachtingenFormPanel, props);

    await fireEvent.click(getByRole("button", { name: "📍 Gebruik huidige GPS" }));
    await fireEvent.submit(getByRole("button", { name: "Naar shortlist" }).closest("form") as HTMLFormElement);

    expect(props.onGebruikGps).toHaveBeenCalledTimes(1);
    expect(props.onSubmitShortlist).toHaveBeenCalledTimes(1);
  });
});
