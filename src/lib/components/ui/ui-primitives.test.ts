import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button.svelte";
import Card from "./Card.svelte";
import Input from "./Input.svelte";

describe("UI primitives", () => {
  it("Button rendert variant + size + fullWidth classes", () => {
    const { container } = render(Button, {
      variant: "destructive",
      size: "sm",
      fullWidth: true,
      "aria-label": "Verwijder actie"
    });

    const btn = container.querySelector("button.ui-btn");
    expect(btn).toBeTruthy();
    expect(btn?.classList.contains("ui-btn--destructive")).toBe(true);
    expect(btn?.classList.contains("ui-btn--sm")).toBe(true);
    expect(btn?.classList.contains("ui-btn--full")).toBe(true);
  });

  it("Button met href blokkeert click wanneer disabled", async () => {
    const onClick = vi.fn();
    const { container } = render(Button, {
      href: "/meer",
      disabled: true,
      onclick: onClick,
      "aria-label": "Terug"
    });

    const link = container.querySelector("a.ui-btn");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("aria-disabled")).toBe("true");

    if (link) await fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("Card gebruikt button-element als onclick aanwezig is", async () => {
    const onClick = vi.fn();
    const { container } = render(Card, {
      onclick: onClick,
      hoverable: true,
      "aria-label": "Open kaart"
    });

    const cardButton = container.querySelector("button.ui-card");
    expect(cardButton).toBeTruthy();
    expect(cardButton?.classList.contains("ui-card--hoverable")).toBe(true);
    if (cardButton) await fireEvent.click(cardButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Input zet aria-invalid en fouttekst correct", () => {
    const { getByRole, getByText } = render(Input, {
      label: "Naam",
      value: "",
      error: "Verplicht veld"
    });

    const input = getByRole("textbox", { name: "Naam" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(getByText("Verplicht veld")).toBeTruthy();
  });
});
