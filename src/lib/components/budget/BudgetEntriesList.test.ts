import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import BudgetEntriesList from "./BudgetEntriesList.svelte";

describe("BudgetEntriesList", () => {
  it("toont entries en triggert delete-knop", async () => {
    const onDelete = vi.fn();
    const { getByRole, getByText } = render(BudgetEntriesList, {
      uitgavenCount: 1,
      gegroepeerdeUitgaven: [
        {
          key: "vandaag",
          label: "Vandaag",
          totaal: 12.5,
          items: [
            {
              id: "u1",
              bedrag: 12.5,
              categorie: "dining",
              omschrijving: "Lunch",
              door: "Dennis",
              datum: "2026-04-11T09:00:00Z"
            }
          ]
        }
      ],
      gefilterdeUitgaven: [
        {
          id: "u1",
          bedrag: 12.5,
          categorie: "dining",
          omschrijving: "Lunch",
          door: "Dennis",
          datum: "2026-04-11T09:00:00Z"
        }
      ],
      isGefilterd: false,
      onDelete
    });

    expect(getByText("Uitgaven (1)")).toBeInTheDocument();
    expect(getByText("Lunch")).toBeInTheDocument();
    await fireEvent.click(getByRole("button", { name: "Verwijder Lunch" }));

    expect(onDelete).toHaveBeenCalledWith("u1");
  });

  it("toont lege staat als filter actief is zonder resultaten", () => {
    const { getByText } = render(BudgetEntriesList, {
      uitgavenCount: 0,
      gegroepeerdeUitgaven: [],
      gefilterdeUitgaven: [],
      isGefilterd: true,
      onDelete: vi.fn()
    });

    expect(getByText("Geen uitgaven voor dit filter")).toBeInTheDocument();
  });
});
