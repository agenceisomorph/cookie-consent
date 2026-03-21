import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_EXPIRY_MONTHS,
  COOKIE_DATA_VERSION,
  OPTIONAL_CATEGORIES,
  createDefaultConsent,
  createAcceptAllConsent,
  resolveAction,
  getExpiryDate,
  validateConsentState,
  parseConsentFromCookie,
  serializeConsent,
  generateSessionId,
} from './consent';
import type { ConsentState, ConsentCookieData } from '../types/consent.types';

// ─── createDefaultConsent ────────────────────────────────────────

describe('createDefaultConsent', () => {
  it('retourne necessary:true et toutes les catégories optionnelles à false', () => {
    const state = createDefaultConsent();
    expect(state).toEqual({
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false,
    });
  });
});

// ─── createAcceptAllConsent ──────────────────────────────────────

describe('createAcceptAllConsent', () => {
  it('retourne toutes les catégories à true', () => {
    const state = createAcceptAllConsent();
    expect(state).toEqual({
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true,
    });
  });
});

// ─── resolveAction ───────────────────────────────────────────────

describe('resolveAction', () => {
  it('retourne accept_all si toutes les catégories optionnelles sont true', () => {
    expect(
      resolveAction({ necessary: true, analytics: true, advertising: true, functional: true })
    ).toBe('accept_all');
  });

  it('retourne refuse_all si toutes les catégories optionnelles sont false', () => {
    expect(
      resolveAction({ necessary: true, analytics: false, advertising: false, functional: false })
    ).toBe('refuse_all');
  });

  it('retourne custom si mix de true/false', () => {
    expect(
      resolveAction({ necessary: true, analytics: true, advertising: false, functional: false })
    ).toBe('custom');
  });

  it('retourne custom si seulement functional est true', () => {
    expect(
      resolveAction({ necessary: true, analytics: false, advertising: false, functional: true })
    ).toBe('custom');
  });
});

// ─── getExpiryDate ───────────────────────────────────────────────

describe('getExpiryDate', () => {
  it('ajoute 13 mois par défaut', () => {
    const base = new Date('2026-01-15T10:00:00.000Z');
    const expiry = getExpiryDate(base);
    expect(expiry.getFullYear()).toBe(2027);
    expect(expiry.getMonth()).toBe(1); // février (0-indexed)
    expect(expiry.getDate()).toBe(15);
  });

  it('accepte un nombre de mois personnalisé', () => {
    const base = new Date('2026-03-01T00:00:00.000Z');
    const expiry = getExpiryDate(base, 6);
    expect(expiry.getMonth()).toBe(8); // septembre
  });

  it('gère le dépassement de fin d\'année', () => {
    const base = new Date('2026-11-01T00:00:00.000Z');
    const expiry = getExpiryDate(base, 3);
    expect(expiry.getFullYear()).toBe(2027);
    expect(expiry.getMonth()).toBe(1); // février
  });

  it('ne modifie pas la date originale', () => {
    const base = new Date('2026-06-15T00:00:00.000Z');
    const originalTime = base.getTime();
    getExpiryDate(base, 5);
    expect(base.getTime()).toBe(originalTime);
  });
});

// ─── validateConsentState ────────────────────────────────────────

describe('validateConsentState', () => {
  it('valide un état correct', () => {
    expect(
      validateConsentState({ necessary: true, analytics: true, advertising: false, functional: true })
    ).toBe(true);
  });

  it('rejette null', () => {
    expect(validateConsentState(null)).toBe(false);
  });

  it('rejette undefined', () => {
    expect(validateConsentState(undefined)).toBe(false);
  });

  it('rejette un string', () => {
    expect(validateConsentState('hello')).toBe(false);
  });

  it('rejette si necessary n\'est pas true', () => {
    expect(
      validateConsentState({ necessary: false, analytics: true, advertising: true, functional: true })
    ).toBe(false);
  });

  it('rejette si analytics n\'est pas un boolean', () => {
    expect(
      validateConsentState({ necessary: true, analytics: 'yes', advertising: true, functional: true })
    ).toBe(false);
  });

  it('rejette un objet incomplet (missing advertising)', () => {
    expect(
      validateConsentState({ necessary: true, analytics: true, functional: true })
    ).toBe(false);
  });

  it('rejette un objet incomplet (missing functional)', () => {
    expect(
      validateConsentState({ necessary: true, analytics: true, advertising: true })
    ).toBe(false);
  });
});

// ─── parseConsentFromCookie ──────────────────────────────────────

describe('parseConsentFromCookie', () => {
  function makeCookie(overrides: Partial<ConsentCookieData> = {}): string {
    const data: ConsentCookieData = {
      v: COOKIE_DATA_VERSION,
      s: { necessary: true, analytics: true, advertising: false, functional: true },
      exp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      ts: new Date().toISOString(),
      ...overrides,
    };
    return encodeURIComponent(JSON.stringify(data));
  }

  it('parse un cookie valide', () => {
    const result = parseConsentFromCookie(makeCookie());
    expect(result).toEqual({
      necessary: true,
      analytics: true,
      advertising: false,
      functional: true,
    });
  });

  it('retourne null si null', () => {
    expect(parseConsentFromCookie(null)).toBeNull();
  });

  it('retourne null si undefined', () => {
    expect(parseConsentFromCookie(undefined)).toBeNull();
  });

  it('retourne null si string vide', () => {
    expect(parseConsentFromCookie('')).toBeNull();
  });

  it('retourne null si JSON invalide', () => {
    expect(parseConsentFromCookie('not-json')).toBeNull();
  });

  it('retourne null si version incorrecte', () => {
    expect(parseConsentFromCookie(makeCookie({ v: '99' }))).toBeNull();
  });

  it('retourne null si expiré', () => {
    const expired = makeCookie({
      exp: new Date(Date.now() - 1000).toISOString(),
    });
    expect(parseConsentFromCookie(expired)).toBeNull();
  });

  it('retourne null si date d\'expiration invalide', () => {
    expect(parseConsentFromCookie(makeCookie({ exp: 'not-a-date' }))).toBeNull();
  });

  it('retourne null si état de consentement invalide', () => {
    const bad = makeCookie();
    const parsed = JSON.parse(decodeURIComponent(bad));
    parsed.s.necessary = false;
    const reencoded = encodeURIComponent(JSON.stringify(parsed));
    expect(parseConsentFromCookie(reencoded)).toBeNull();
  });
});

// ─── serializeConsent ────────────────────────────────────────────

describe('serializeConsent', () => {
  it('produit un string encodé contenant l\'état', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      advertising: false,
      functional: false,
    };
    const serialized = serializeConsent(state);
    const decoded = JSON.parse(decodeURIComponent(serialized)) as ConsentCookieData;

    expect(decoded.v).toBe(COOKIE_DATA_VERSION);
    expect(decoded.s).toEqual(state);
    expect(decoded.exp).toBeDefined();
    expect(decoded.ts).toBeDefined();
  });

  it('round-trip : serialize → parse retourne l\'état original', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: false,
      advertising: true,
      functional: true,
    };
    const serialized = serializeConsent(state);
    const parsed = parseConsentFromCookie(serialized);
    expect(parsed).toEqual(state);
  });

  it('utilise l\'expiry en mois passé en paramètre', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
    const consentDate = new Date('2026-01-01T00:00:00.000Z');
    const serialized = serializeConsent(state, consentDate, 6);
    const decoded = JSON.parse(decodeURIComponent(serialized)) as ConsentCookieData;
    const expiryDate = new Date(decoded.exp);

    expect(expiryDate.getMonth()).toBe(6); // juillet (0-indexed)
  });
});

// ─── generateSessionId ───────────────────────────────────────────

describe('generateSessionId', () => {
  it('génère un string hexadécimal de 32 caractères', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('génère des IDs uniques', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateSessionId()));
    expect(ids.size).toBe(100);
  });
});

// ─── Constantes ──────────────────────────────────────────────────

describe('constantes', () => {
  it('DEFAULT_EXPIRY_MONTHS vaut 13', () => {
    expect(DEFAULT_EXPIRY_MONTHS).toBe(13);
  });

  it('OPTIONAL_CATEGORIES contient les 3 catégories optionnelles', () => {
    expect(OPTIONAL_CATEGORIES).toEqual(['analytics', 'advertising', 'functional']);
  });
});
