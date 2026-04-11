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
  it('identificeert niet-getokeniseerde CSS waarden in de src directory', () => {
    const violations: { file: string; matches: string[] }[] = [];

    walk(SRC_DIR, (file) => {
      const ext = path.extname(file);
      if (ext === '.svelte' || ext === '.css' || ext === '.ts') {
        // Sla configuratiebestanden en de audit zelf over
        if (
          file.includes('ui-norm-audit.test.ts') ||
          file.includes('ui-tokens.css') ||
          file.includes('ui-norm-profile.css') ||
          file.includes('setup.ts')
        ) {
          return;
        }

        const content = fs.readFileSync(file, 'utf8');
        
        // Verwijder SVG data en comments om false positives te voorkomen
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

        // Check PX (alleen waarden > 2px om kleine borders/stroke-width te gedogen indien nodig)
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
      }
    });

    if (violations.length > 0) {
      console.warn('\n⚠️  UI NORM VIOLATIONS\n' + '='.repeat(30));
      violations.forEach(v => {
        console.warn(`${v.file}: [ ${v.matches.join(', ')} ]`);
      });
      console.warn('='.repeat(30) + '\n');
    }

    expect(violations.length).toBe(0);
  });
});
