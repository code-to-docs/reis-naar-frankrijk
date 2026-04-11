import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

function read(file: string) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

describe("A11y regressie audit", () => {
  it("borgt basis focus en reduced-motion support", () => {
    const appCss = read("src/app.css");
    const tokenCss = read("src/lib/styles/ui-tokens.css");
    expect(appCss.includes(":focus-visible")).toBe(true);
    expect(tokenCss.includes("@media (prefers-reduced-motion: reduce)")).toBe(true);
  });

  it("voorkomt positieve tabindex waarden", () => {
    const files = globSync("src/**/*.svelte");
    const offenders: string[] = [];
    const pattern = /tabindex\s*=\s*["'](\d+)["']/gi;

    for (const file of files) {
      const text = read(file);
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const value = Number(match[1]);
        if (Number.isFinite(value) && value > 0) offenders.push(`${file}:${value}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("eist toetsenbordondersteuning bij role=button gebruik", () => {
    const files = globSync("src/**/*.svelte");
    const offenders: string[] = [];

    for (const file of files) {
      const text = read(file);
      if (!text.includes('role="button"')) continue;
      if (!/onkeydown=|on:keydown=/.test(text)) offenders.push(file);
    }

    expect(offenders).toEqual([]);
  });

  it("valideert minimale kleurcontrast-ratios voor kernparen", () => {
    const tokensCss = read("src/lib/styles/ui-tokens.css");
    const tokenMap = new Map<string, string>();
    const tokenPattern = /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(tokensCss)) !== null) {
      tokenMap.set(match[1], match[2]);
    }

    const pairs: Array<{ fg: string; bg: string; min: number }> = [
      { fg: "color-neutral-900", bg: "color-neutral-0", min: 4.5 },
      { fg: "color-neutral-600", bg: "color-neutral-0", min: 4.5 },
      { fg: "color-neutral-50", bg: "color-neutral-900", min: 4.5 },
      { fg: "color-primary-600", bg: "color-primary-50", min: 4.5 }
    ];

    for (const pair of pairs) {
      const fg = tokenMap.get(pair.fg);
      const bg = tokenMap.get(pair.bg);
      expect(fg, `Ontbrekende token ${pair.fg}`).toBeTruthy();
      expect(bg, `Ontbrekende token ${pair.bg}`).toBeTruthy();
      const ratio = contrastRatio(fg!, bg!);
      expect(ratio, `Contrast ${pair.fg} op ${pair.bg}`).toBeGreaterThanOrEqual(pair.min);
    }
  });
});

function contrastRatio(fgHex: string, bgHex: string) {
  const L1 = relativeLuminance(hexToRgb(fgHex));
  const L2 = relativeLuminance(hexToRgb(bgHex));
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const transform = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
