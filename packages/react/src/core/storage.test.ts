import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { COOKIE_NAME, readConsent, writeConsent, clearConsent, hasValidConsent } from './storage';
import { serializeConsent } from './consent';
import type { ConsentState } from '../types/consent.types';

// ─── Helpers ─────────────────────────────────────────────────────

const validState: ConsentState = {
  necessary: true,
  analytics: true,
  advertising: false,
  functional: true,
};

/**
 * Efface tous les cookies dans jsdom en les expirant un par un.
 */
function clearAllCookies(): void {
  document.cookie.split(';').forEach((c) => {
    const name = c.trim().split('=')[0];
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(() => {
  clearAllCookies();
  // Simuler HTTP (pas HTTPS) pour éviter le flag Secure
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: { protocol: 'http:', hostname: 'localhost' },
  });
});

afterEach(() => {
  clearAllCookies();
});

// ─── readConsent ─────────────────────────────────────────────────

describe('readConsent', () => {
  it('retourne null si aucun cookie', () => {
    expect(readConsent()).toBeNull();
  });

  it("retourne null si le cookie n'existe pas parmi d'autres", () => {
    document.cookie = 'other_cookie=value';
    document.cookie = 'another=123';
    expect(readConsent()).toBeNull();
  });

  it('lit un cookie valide', () => {
    const serialized = serializeConsent(validState);
    document.cookie = `${COOKIE_NAME}=${serialized}`;
    expect(readConsent()).toEqual(validState);
  });

  it('retourne null si le cookie est corrompu', () => {
    document.cookie = `${COOKIE_NAME}=garbage-data`;
    expect(readConsent()).toBeNull();
  });
});

// ─── writeConsent ────────────────────────────────────────────────

describe('writeConsent', () => {
  it('écrit un cookie parsable', () => {
    writeConsent(validState);

    // Vérifier que le cookie est bien écrit et lisible
    expect(document.cookie).toContain(COOKIE_NAME);

    // Relire le consentement via readConsent
    const result = readConsent();
    expect(result).toEqual(validState);
  });

  it('ajoute Secure en HTTPS', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { protocol: 'https:', hostname: 'localhost' },
    });

    // Espionner l'écriture de document.cookie pour vérifier la chaîne complète
    const cookieSpy = vi.spyOn(document, 'cookie', 'set');

    writeConsent(validState);

    expect(cookieSpy).toHaveBeenCalled();
    const writtenValue = cookieSpy.mock.calls[0]![0] as string;
    expect(writtenValue).toContain('Secure');
    expect(writtenValue).toContain('SameSite=Lax');
    expect(writtenValue).toContain('path=/');

    cookieSpy.mockRestore();
  });

  it('inclut le domaine si spécifié', () => {
    const cookieSpy = vi.spyOn(document, 'cookie', 'set');

    writeConsent(validState, { domain: '.otrepaca.fr' });

    expect(cookieSpy).toHaveBeenCalled();
    const writtenValue = cookieSpy.mock.calls[0]![0] as string;
    expect(writtenValue).toContain('domain=.otrepaca.fr');

    cookieSpy.mockRestore();
  });
});

// ─── clearConsent ────────────────────────────────────────────────

describe('clearConsent', () => {
  it('écrit un cookie expiré pour le supprimer', () => {
    const cookieSpy = vi.spyOn(document, 'cookie', 'set');

    clearConsent();

    expect(cookieSpy).toHaveBeenCalled();
    const writtenValue = cookieSpy.mock.calls[0]![0] as string;
    expect(writtenValue).toContain(COOKIE_NAME);
    expect(writtenValue).toContain('Thu, 01 Jan 1970');

    cookieSpy.mockRestore();
  });

  it('inclut le domaine si spécifié', () => {
    const cookieSpy = vi.spyOn(document, 'cookie', 'set');

    clearConsent({ domain: '.example.com' });

    expect(cookieSpy).toHaveBeenCalled();
    const writtenValue = cookieSpy.mock.calls[0]![0] as string;
    expect(writtenValue).toContain('domain=.example.com');

    cookieSpy.mockRestore();
  });
});

// ─── hasValidConsent ─────────────────────────────────────────────

describe('hasValidConsent', () => {
  it('retourne false si aucun cookie', () => {
    expect(hasValidConsent()).toBe(false);
  });

  it('retourne true si un cookie valide existe', () => {
    const serialized = serializeConsent(validState);
    document.cookie = `${COOKIE_NAME}=${serialized}`;
    expect(hasValidConsent()).toBe(true);
  });
});
