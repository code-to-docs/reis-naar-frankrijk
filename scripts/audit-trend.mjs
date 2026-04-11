import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const OUT_JSON = path.join(ROOT, "docs", "AUDIT_TREND.json");
const OUT_MD = path.join(ROOT, "docs", "AUDIT_TREND.md");

const HEX_PATTERN = /#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b/g;
const PX_PATTERN = /\b[0-9.]+px\b/g;
const RGB_PATTERN = /rgba?\([^)]+\)/g;
const COMMENT_PATTERN = /\/\*[\s\S]*?\*\/|\/\/.*/g;
const SVG_DATA_EXCLUSION = /d="[^"]+"/g;
const VIEWBOX_EXCLUSION = /viewBox="[^"]+"/g;
const TRANSFORM_EXCLUSION = /transform="[^"]+"/g;
const ALLOWED_MEDIA_LITERALS = new Set(["640px", "740px", "768px", "880px", "900px", "1099px", "1100px"]);

const SEMANTIC_RULES = [
  {
    name: "Destructieve acties",
    contextPatterns: [
      /class="[^"]*delete[^"]*"/gi,
      /class="[^"]*remove[^"]*"/gi,
      /class="[^"]*verwijder[^"]*"/gi,
      /<button[^>]*on:click=\{[^}]*delete/gi,
      /onclick=\{[^}]*delete/gi
    ],
    requiredTokens: ["--color-error", "--color-danger", "--btn-danger", "--text-error", "btn-danger"],
    forbiddenTokens: ["--color-primary", "--color-success", "btn-primary", "btn-success"]
  },
  {
    name: "Bevestigingsacties",
    contextPatterns: [/class="[^"]*confirm[^"]*"/gi, /class="[^"]*save[^"]*"/gi, /class="[^"]*opslaan[^"]*"/gi],
    requiredTokens: ["--color-success", "--color-primary", "--btn-primary", "--text-success", "btn-primary", "btn-success", "btn-save"],
    forbiddenTokens: ["--color-error", "btn-danger"]
  },
  {
    name: "Waarschuwingen",
    contextPatterns: [/class="[^"]*(?<!weather-)alert[^"]*"/gi, /class="[^"]*alert-card[^"]*"/gi, /<Alert[^>]*type="warning"/gi],
    requiredTokens: ["--color-warning", "--color-caution"],
    forbiddenTokens: []
  },
  {
    name: "Disabled states",
    contextPatterns: [/disabled/gi, /:disabled/gi, /class="[^"]*disabled[^"]*"/gi],
    requiredTokens: ["--color-disabled", "--color-muted", "opacity", "--bg-disabled"],
    forbiddenTokens: []
  }
];

function getGitHash() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

function sanitize(content) {
  return content
    .replace(COMMENT_PATTERN, "")
    .replace(SVG_DATA_EXCLUSION, "")
    .replace(VIEWBOX_EXCLUSION, "")
    .replace(TRANSFORM_EXCLUSION, "");
}

function collectUiViolations() {
  const files = globSync("src/**/*.{svelte,css,ts}", {
    cwd: ROOT,
    ignore: ["**/node_modules/**", "**/ui-norm-audit.test.ts", "**/ui-tokens.css", "**/ui-norm-profile.css", "**/setup.ts"]
  });

  let count = 0;
  for (const rel of files) {
    const file = path.join(ROOT, rel);
    const raw = fs.readFileSync(file, "utf8");
    const text = sanitize(raw);
    const matches = [];
    const hexes = text.match(HEX_PATTERN);
    if (hexes) matches.push(...hexes);
    const pxs = text.match(PX_PATTERN);
    if (pxs) {
      const significant = pxs.filter((p) => parseInt(p, 10) > 2 && !ALLOWED_MEDIA_LITERALS.has(p));
      matches.push(...significant);
    }
    const rgbs = text.match(RGB_PATTERN);
    if (rgbs) matches.push(...rgbs);
    if (matches.length > 0) count += matches.length;
  }
  return count;
}

function extractContextWindow(content, index, size) {
  const start = Math.max(0, index - size);
  const end = Math.min(content.length, index + size);
  return content.slice(start, end);
}

function collectSemanticViolations() {
  const files = globSync("src/**/*.svelte", { cwd: ROOT, ignore: ["**/node_modules/**"] });
  let count = 0;
  for (const rel of files) {
    const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const rule of SEMANTIC_RULES) {
      for (const pattern of rule.contextPatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const context = extractContextWindow(content, match.index, 500);
          const hasRequired = rule.requiredTokens.some((token) => context.includes(token));
          const forbidden = rule.forbiddenTokens.find((token) => context.includes(token));
          if (!hasRequired && rule.requiredTokens.length > 0) count += 1;
          if (forbidden) count += 1;
        }
      }
    }
  }
  return count;
}

function readTrend() {
  if (!fs.existsSync(OUT_JSON)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
  } catch {
    return [];
  }
}

function writeTrend(entries) {
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  const lines = [
    "# AUDIT_TREND.md",
    "",
    "| Datum | Commit | UI violations | Semantische violations |",
    "|---|---|---:|---:|"
  ];
  for (const e of entries) {
    lines.push(`| ${e.date} | ${e.commit} | ${e.uiViolations} | ${e.semanticViolations} |`);
  }
  lines.push("");
  fs.writeFileSync(OUT_MD, lines.join("\n"), "utf8");
}

const today = new Date().toISOString().slice(0, 10);
const commit = getGitHash();
const uiViolations = collectUiViolations();
const semanticViolations = collectSemanticViolations();
const trend = readTrend();
const key = `${today}:${commit}`;
const existingIndex = trend.findIndex((e) => `${e.date}:${e.commit}` === key);
const nextEntry = { date: today, commit, uiViolations, semanticViolations };

if (existingIndex >= 0) trend[existingIndex] = nextEntry;
else trend.push(nextEntry);

trend.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.commit.localeCompare(b.commit)));
writeTrend(trend);

console.log(`audit-trend updated: date=${today} commit=${commit} ui=${uiViolations} semantic=${semanticViolations}`);
