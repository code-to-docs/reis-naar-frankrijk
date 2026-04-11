import { describe, it, expect, vi } from 'vitest';
import { db } from '../firebase';

describe('Firebase Connectivity Integrity', () => {
  it('should initialize Firebase with non-empty configuration', () => {
    // We checken indirect de initialisatie door te kijken of de db reference bestaat
    // en of de onderliggende app-configuratie valide is.
    const app = db.app;
    const config = app.options;

    expect(config.apiKey).toBeDefined();
    expect(config.apiKey).not.toBe('');
    expect(config.apiKey).not.toContain('undefined');
    
    expect(config.projectId).toBeDefined();
    expect(config.projectId).toBe('reisfrankijk');
  });

  it('should have working firestore instance', () => {
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });
});
