import { describe, it, expect } from 'vitest';
import { glob } from 'glob';
import fs from 'fs';

/**
 * SEMANTISCHE KLEUR AUDIT
 * Valideert of tokens correct worden gebruikt in de juiste context.
 */

interface SemanticRule {
  name: string;
  contextPatterns: RegExp[];
  requiredTokens: string[];
  forbiddenTokens: string[];
}

interface Violation {
  file: string;
  line: number;
  rule: string;
  issue: string;
  snippet: string;
}

const SEMANTIC_RULES: SemanticRule[] = [
  {
    name: 'Destructieve acties',
    contextPatterns: [
      /class="[^"]*delete[^"]*"/gi,
      /class="[^"]*remove[^"]*"/gi,
      /class="[^"]*verwijder[^"]*"/gi,
      /<button[^>]*on:click=\{[^}]*delete/gi,
      /onclick=\{[^}]*delete/gi,
    ],
    requiredTokens: ['--color-error', '--color-danger', '--btn-danger', '--text-error', 'btn-danger'],
    forbiddenTokens: ['--color-primary', '--color-success', 'btn-primary', 'btn-success'],
  },
  {
    name: 'Bevestigingsacties',
    contextPatterns: [
      /class="[^"]*confirm[^"]*"/gi,
      /class="[^"]*save[^"]*"/gi,
      /class="[^"]*opslaan[^"]*"/gi,
    ],
    requiredTokens: ['--color-success', '--color-primary', '--btn-primary', '--text-success', 'btn-primary', 'btn-success', 'btn-save'],
    forbiddenTokens: ['--color-error', 'btn-danger'],
  },
  {
    name: 'Waarschuwingen',
    contextPatterns: [
      /class="[^"]*(?<!weather-)alert[^"]*"/gi,
      /class="[^"]*alert-card[^"]*"/gi,
      /<Alert[^>]*type="warning"/gi,
    ],
    requiredTokens: ['--color-warning', '--color-caution'],
    forbiddenTokens: [],
  },
  {
    name: 'Disabled states',
    contextPatterns: [
      /disabled/gi,
      /:disabled/gi,
      /class="[^"]*disabled[^"]*"/gi,
    ],
    requiredTokens: ['--color-disabled', '--color-muted', 'opacity', '--bg-disabled'],
    forbiddenTokens: [],
  }
];

function extractContextWindow(content: string, index: number, windowSize: number): string {
  const start = Math.max(0, index - windowSize);
  const end = Math.min(content.length, index + windowSize);
  return content.slice(start, end);
}

function analyzeSemanticColors(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];
  const isUiPrimitive = filePath.includes('/components/ui/');

  for (const rule of SEMANTIC_RULES) {
    if (isUiPrimitive && rule.name === 'Disabled states') {
      continue;
    }

    for (const pattern of rule.contextPatterns) {
      pattern.lastIndex = 0;
      
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const matchIndex = match.index;
        const lineNumber = content.slice(0, matchIndex).split('\n').length;
        
        // Zoek de bijbehorende CSS class of inline style in een window van 500 chars
        const contextWindow = extractContextWindow(content, matchIndex, 500);
        
        const hasRequiredToken = rule.requiredTokens.some(token => 
          contextWindow.includes(token)
        );
        
        const forbiddenToken = rule.forbiddenTokens.find(token =>
          contextWindow.includes(token)
        );

        if (!hasRequiredToken && rule.requiredTokens.length > 0) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: rule.name,
            issue: `Ontbrekende semantische token. Verwacht: ${rule.requiredTokens.join(' of ')}`,
            snippet: match[0].slice(0, 80)
          });
        }

        if (forbiddenToken) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: rule.name,
            issue: `Incorrecte token "${forbiddenToken}" voor ${rule.name}`,
            snippet: match[0].slice(0, 80)
          });
        }
      }
    }
  }

  return violations;
}

describe('Semantische Kleur Audit', () => {
  it('detecteert incorrecte kleur-semantiek in componenten', async () => {
    const files = (await glob('src/**/*.svelte', { ignore: ['**/node_modules/**'] })).map(p => p.replace(/\\/g, '/'));
    const allViolations: Violation[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const violations = analyzeSemanticColors(file, content);
      allViolations.push(...violations);
    }

    if (allViolations.length > 0) {
      console.log('\n🎨 SEMANTISCHE KLEUR VIOLATIONS:\n');
      
      const groupedByRule = allViolations.reduce((acc, v) => {
        acc[v.rule] = acc[v.rule] || [];
        acc[v.rule].push(v);
        return acc;
      }, {} as Record<string, Violation[]>);

      for (const [rule, violations] of Object.entries(groupedByRule)) {
        console.log(`\n  ⚠️  ${rule} (${violations.length} issues):`);
        violations.slice(0, 5).forEach(v => {
          console.log(`      ${v.file}:${v.line}`);
          console.log(`      └─ ${v.issue}`);
        });
        if (violations.length > 5) {
          console.log(`      ... en ${violations.length - 5} meer`);
        }
      }
    }

    expect(allViolations.length).toBe(0);
  });

  it('valideert button-kleur consistentie', async () => {
    const files = (await glob('src/**/*.svelte')).map(p => p.replace(/\\/g, '/'));
    const violations: string[] = [];

    const BUTTON_RULES = {
      'btn-primary': ['--color-primary', '--btn-primary-bg', '--bg-primary'],
      'btn-danger': ['--color-error', '--color-danger', '--btn-danger-bg', '--color-error-base'],
      'btn-secondary': ['--color-secondary', '--btn-secondary-bg', '--bg-secondary'],
    };

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      for (const [btnClass, allowedTokens] of Object.entries(BUTTON_RULES)) {
        if (content.includes(btnClass)) {
          const btnRegex = new RegExp(`class="[^"]*${btnClass}[^"]*"[^>]*style="([^"]*)"`, 'g');
          let match;
          while ((match = btnRegex.exec(content)) !== null) {
            const inlineStyle = match[1];
            if (/#[0-9a-f]{3,8}|rgb/i.test(inlineStyle)) {
              violations.push(`${file}: ${btnClass} heeft hardcoded kleur in inline style`);
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n🔴 Button kleur violations:', violations);
    }
    
    expect(violations.length).toBe(0);
  });
});
