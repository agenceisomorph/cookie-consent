import { describe, it, expect, beforeEach } from 'vitest';
import {
  GCM_SIGNAL_MAP,
  ALL_GCM_SIGNALS,
  mapCategoryToSignals,
  createDefaultGcmState,
  consentStateToGcm,
  setDefaultConsent,
  updateConsent,
  getInlineConsentScript,
} from './gcm';
import type { ConsentState } from '../types/consent.types';

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(() => {
  // Reset window.dataLayer et window.gtag
  delete (window as unknown as Record<string, unknown>).dataLayer;
  delete (window as unknown as Record<string, unknown>).gtag;
});

// ─── GCM_SIGNAL_MAP ──────────────────────────────────────────────

describe('GCM_SIGNAL_MAP', () => {
  it('mappe necessary à security_storage', () => {
    expect(GCM_SIGNAL_MAP.necessary).toEqual(['security_storage']);
  });

  it('mappe analytics à analytics_storage', () => {
    expect(GCM_SIGNAL_MAP.analytics).toEqual(['analytics_storage']);
  });

  it('mappe advertising à 3 signaux (ad_storage, ad_user_data, ad_personalization)', () => {
    expect(GCM_SIGNAL_MAP.advertising).toEqual([
      'ad_storage',
      'ad_user_data',
      'ad_personalization',
    ]);
  });

  it('mappe functional à functionality_storage', () => {
    expect(GCM_SIGNAL_MAP.functional).toEqual(['functionality_storage']);
  });
});

// ─── ALL_GCM_SIGNALS ─────────────────────────────────────────────

describe('ALL_GCM_SIGNALS', () => {
  it('contient exactement 6 signaux', () => {
    expect(ALL_GCM_SIGNALS).toHaveLength(6);
  });

  it('contient security_storage', () => {
    expect(ALL_GCM_SIGNALS).toContain('security_storage');
  });
});

// ─── mapCategoryToSignals ────────────────────────────────────────

describe('mapCategoryToSignals', () => {
  it('retourne analytics_storage:granted si analytics=true', () => {
    expect(mapCategoryToSignals('analytics', true)).toEqual({
      analytics_storage: 'granted',
    });
  });

  it('retourne analytics_storage:denied si analytics=false', () => {
    expect(mapCategoryToSignals('analytics', false)).toEqual({
      analytics_storage: 'denied',
    });
  });

  it('retourne 3 signaux pour advertising', () => {
    const result = mapCategoryToSignals('advertising', true);
    expect(result).toEqual({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('retourne un objet vide pour une catégorie inconnue', () => {
    // @ts-expect-error — test d'un cas edge
    expect(mapCategoryToSignals('unknown', true)).toEqual({});
  });
});

// ─── createDefaultGcmState ───────────────────────────────────────

describe('createDefaultGcmState', () => {
  it('retourne tous les signaux denied sauf security_storage', () => {
    const state = createDefaultGcmState();
    expect(state.analytics_storage).toBe('denied');
    expect(state.ad_storage).toBe('denied');
    expect(state.ad_user_data).toBe('denied');
    expect(state.ad_personalization).toBe('denied');
    expect(state.functionality_storage).toBe('denied');
    expect(state.security_storage).toBe('granted');
  });

  it('security_storage est toujours granted', () => {
    expect(createDefaultGcmState().security_storage).toBe('granted');
  });
});

// ─── consentStateToGcm ──────────────────────────────────────────

describe('consentStateToGcm', () => {
  it('convertit un consentement complet correctement', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true,
    };
    const gcm = consentStateToGcm(state);
    expect(gcm).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  });

  it('convertit un refus total correctement', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
    const gcm = consentStateToGcm(state);
    expect(gcm.analytics_storage).toBe('denied');
    expect(gcm.ad_storage).toBe('denied');
    expect(gcm.functionality_storage).toBe('denied');
    expect(gcm.security_storage).toBe('granted'); // toujours granted
  });

  it('ne modifie jamais security_storage', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false,
    };
    expect(consentStateToGcm(state).security_storage).toBe('granted');
  });

  it('gère un consentement partiel (analytics only)', () => {
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      advertising: false,
      functional: false,
    };
    const gcm = consentStateToGcm(state);
    expect(gcm.analytics_storage).toBe('granted');
    expect(gcm.ad_storage).toBe('denied');
    expect(gcm.functionality_storage).toBe('denied');
  });
});

// ─── setDefaultConsent ───────────────────────────────────────────

describe('setDefaultConsent', () => {
  it("crée window.dataLayer s'il n'existe pas", () => {
    setDefaultConsent();
    expect(window.dataLayer).toBeDefined();
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it("crée window.gtag s'il n'existe pas", () => {
    setDefaultConsent();
    expect(typeof window.gtag).toBe('function');
  });

  it('pousse une commande dans le dataLayer', () => {
    setDefaultConsent();
    expect(window.dataLayer!.length).toBeGreaterThan(0);
  });
});

// ─── updateConsent ───────────────────────────────────────────────

describe('updateConsent', () => {
  it('pousse une commande dans le dataLayer', () => {
    window.dataLayer = [];
    const initialLength = window.dataLayer.length;

    updateConsent({
      necessary: true,
      analytics: true,
      advertising: false,
      functional: true,
    });

    expect(window.dataLayer.length).toBeGreaterThan(initialLength);
  });
});

// ─── getInlineConsentScript ──────────────────────────────────────

describe('getInlineConsentScript', () => {
  it('retourne un string contenant gtag consent default', () => {
    const script = getInlineConsentScript();
    expect(script).toContain("gtag('consent','default'");
  });

  it('contient tous les signaux denied sauf security_storage', () => {
    const script = getInlineConsentScript();
    expect(script).toContain('"analytics_storage":"denied"');
    expect(script).toContain('"ad_storage":"denied"');
    expect(script).toContain('"security_storage":"granted"');
  });

  it('initialise window.dataLayer', () => {
    const script = getInlineConsentScript();
    expect(script).toContain('window.dataLayer=window.dataLayer||[]');
  });
});
