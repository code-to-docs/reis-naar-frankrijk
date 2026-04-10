import { describe, expect, it } from "vitest";
import { buildWildlifeDeepLink, getBudgetProgressTone, normalizeFrenchRegionName } from "./dashboard";

describe("dashboard utils", () => {
  it("normaliseert regio namen met accenten", () => {
    expect(normalizeFrenchRegionName("Lozere")).toBe("Lozère");
    expect(normalizeFrenchRegionName("Ariege")).toBe("Ariège");
    expect(normalizeFrenchRegionName("Pyrenees Ariegeoises")).toBe("Pyrénées Ariégeoises");
  });

  it("bouwt wildlife deeplink", () => {
    expect(buildWildlifeDeepLink("europese-wolfspin")).toBe("/meer/wildlife?open=europese-wolfspin");
    expect(buildWildlifeDeepLink("")).toBe("/meer/wildlife");
  });

  it("bepaalt budget progress tone", () => {
    expect(getBudgetProgressTone(55)).toBe("ok");
    expect(getBudgetProgressTone(89)).toBe("warn");
    expect(getBudgetProgressTone(120)).toBe("over");
  });
});
