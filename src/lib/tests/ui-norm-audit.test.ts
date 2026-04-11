import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * UI NORM AUDIT
 * Geautomatiseerde check op hardcoded CSS-waarden conform UI_NORMPROFIEL.
 * Streeft naar 100% token-based styling.
 */

const SRC_DIR = './src';
// Regex voor verboden patterns
const PROHIBITED_HEX = /#(?!([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b)[a-fA-F0-9]+/g; // Simplified for focus
const HEX_PATTERN = /#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\b/g;
const PX_PATTERN = /\b[0-9.]+px\b/g;
const RGB_PATTERN = /rgba?\([^)]+\)/g;
const ALLOWED_MEDIA_LITERALS = new Set(["640px", "740px", "768px", "880px", "900px", "1099px", "1100px"]);

// Uitzonderingen voor SVG metadata
const SVG_DATA_EXCLUSION = /d="[^"]+"/g;
const VIEWBOX_EXCLUSION = /viewBox="[^"]+"/g;
const TRANSFORM_EXCLUSION = /transform="[^"]+"/g;

function walk(dir: string, callback: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.svelte-kit') {
        walk(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}
describe('UI Normprofiel Audit', () => {
  // Parse tokens uit alle bronbestanden
  const tokenFiles = [
    './src/lib/styles/ui-tokens.css',
    './src/lib/styles/ui-norm-profile.css',
    './src/app.css'
  ];
  const DEFINED_TOKENS = new Set<string>();

  tokenFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const tokenMatches = content.match(/--[a-zA-Z0-9-]+(?=:)/g);
      if (tokenMatches) {
        tokenMatches.forEach(t => DEFINED_TOKENS.add(t));
      }
    }
  });

  console.log(`DEBUG: DEFINED_TOKENS size = ${DEFINED_TOKENS.size}`);

  it('identificeert niet-getokeniseerde CSS waarden en onopgeloste variabelen', () => {
    const violations: { file: string; matches: string[] }[] = [];
    const brokenTokens: { file: string; tokens: string[] }[] = [];

    walk(SRC_DIR, (file) => {
      const ext = path.extname(file);
      if (ext === '.svelte' || ext === '.css' || ext === '.ts') {
        if (
          file.includes('ui-norm-audit.test.ts') ||
          file.includes('ui-tokens.css') ||
          file.includes('ui-norm-profile.css') ||
          file.includes('setup.ts')
        ) {
          return;
        }

        const content = fs.readFileSync(file, 'utf8');
        
        const COMMENT_PATTERN = /\/\*[\s\S]*?\*\/|\/\/.*/g;
        const sanitized = content
          .replace(COMMENT_PATTERN, '')
          .replace(SVG_DATA_EXCLUSION, '')
          .replace(VIEWBOX_EXCLUSION, '')
          .replace(TRANSFORM_EXCLUSION, '');

        const matches: string[] = [];
        
        // Check HEX
        const hexes = sanitized.match(HEX_PATTERN);
        if (hexes) matches.push(...hexes);

        // Check PX
        const pxs = sanitized.match(PX_PATTERN);
        if (pxs) {
          const significantPxs = pxs.filter(p => parseInt(p) > 2);
          if (significantPxs.length > 0) matches.push(...significantPxs);
        }

        // Check RGB
        const rgbs = sanitized.match(RGB_PATTERN);
        if (rgbs) matches.push(...rgbs);

        const normalizedFile = file.replace(/\\/g, '/');
        const filteredMatches = matches.filter((match) => !ALLOWED_MEDIA_LITERALS.has(match));

        if (filteredMatches.length > 0) {
          violations.push({ file: normalizedFile, matches: filteredMatches });
        }

        // --- NEW: Check voor 'Broken Tokens' ---
        const varMatches = sanitized.match(/var\((--[a-zA-Z0-9-]+)\)/g);
        if (varMatches) {
          const invalid = varMatches
            .map(v => v.match(/--[a-zA-Z0-9-]+/)![0])
            .filter(t => !DEFINED_TOKENS.has(t));
          
          if (invalid.length > 0) {
            brokenTokens.push({ file: normalizedFile, tokens: invalid });
          }
        }
      }
    });

    if (violations.length > 0) {
      console.warn('\n⚠️  UI NORM VIOLATIONS (Hardcoded values)\n' + '='.repeat(30));
      violations.forEach(v => {
        console.warn(`${v.file}: [ ${v.matches.join(', ')} ]`);
      });
    }

    if (brokenTokens.length > 0) {
      console.error('\n❌ BROKEN TOKENS (Variables not found in ui-tokens.css)\n' + '='.repeat(30));
      brokenTokens.forEach(b => {
        console.error(`${b.file}: [ ${b.tokens.join(', ')} ]`);
      });
    }

    expect(violations.length, 'Geen hardcoded kleuren/pixels toegestaan').toBe(0);
    expect(brokenTokens.length, 'Alle var() aanroepen moeten verwijzen naar bestaande tokens').toBe(0);
  });
});
