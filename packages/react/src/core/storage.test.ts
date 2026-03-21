import { describe, it, expect, beforeEach } from 'vitest';
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

function setRawCookie(name: string, value: string): void {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: `${name}=${value}`,
  });
}

// ─── Setup ───────────────────────────────────────────────────────

beforeEach(() => {
  // Reset document.cookie
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
  // Simuler HTTP (pas HTTPS) pour éviter le flag Secure
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { protocol: 'http:', hostname: 'localhost' },
  });
});

// ─── readConsent ─────────────────────────────────────────────────

describe('readConsent', () => {
  it('retourne null si aucun cookie', () => {
    expect(readConsent()).toBeNull();
  });

  it("retourne null si le cookie n'existe pas parmi d'autres", () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'other_cookie=value; another=123',
    });
    expect(readConsent()).toBeNull();
  });

  it('lit un cookie valide', () => {
    const serialized = serializeConsent(validState);
    setRawCookie(COOKIE_NAME, serialized);
    expect(readConsent()).toEqual(validState);
  });

  it('retourne null si le cookie est corrompu', () => {
    setRawCookie(COOKIE_NAME, 'garbage-data');
    expect(readConsent()).toBeNull();
  });
});

// ─── writeConsent ────────────────────────────────────────────────

describe('writeConsent', () => {
  it('écrit un cookie parsable', () => {
    // On espionne document.cookie pour capturer la valeur écrite
    let writtenCookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => writtenCookie,
      set: (val: string) => {
        writtenCookie = val;
      },
    });

    writeConsent(validState);

    // Vérifier que le cookie contient le nom
    expect(writtenCookie).toContain(COOKIE_NAME);
    // Vérifier SameSite
    expect(writtenCookie).toContain('SameSite=Lax');
    // Vérifier path
    expect(writtenCookie).toContain('path=/');
    // En HTTP, pas de Secure
    expect(writtenCookie).not.toContain('Secure');
  });

  it('ajoute Secure en HTTPS', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { protocol: 'https:' },
    });

    let writtenCookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => writtenCookie,
      set: (val: string) => {
        writtenCookie = val;
      },
    });

    writeConsent(validState);
    expect(writtenCookie).toContain('Secure');
  });

  it('inclut le domaine si spécifié', () => {
    let writtenCookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => writtenCookie,
      set: (val: string) => {
        writtenCookie = val;
      },
    });

    writeConsent(validState, { domain: '.otrepaca.fr' });
    expect(writtenCookie).toContain('domain=.otrepaca.fr');
  });
});

// ─── clearConsent ────────────────────────────────────────────────

describe('clearConsent', () => {
  it('écrit un cookie expiré pour le supprimer', () => {
    let writtenCookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => writtenCookie,
      set: (val: string) => {
        writtenCookie = val;
      },
    });

    clearConsent();

    expect(writtenCookie).toContain(COOKIE_NAME);
    expect(writtenCookie).toContain('Thu, 01 Jan 1970');
  });

  it('inclut le domaine si spécifié', () => {
    let writtenCookie = '';
    Object.defineProperty(document, 'cookie', {
      get: () => writtenCookie,
      set: (val: string) => {
        writtenCookie = val;
      },
    });

    clearConsent({ domain: '.example.com' });
    expect(writtenCookie).toContain('domain=.example.com');
  });
});

// ─── hasValidConsent ─────────────────────────────────────────────

describe('hasValidConsent', () => {
  it('retourne false si aucun cookie', () => {
    expect(hasValidConsent()).toBe(false);
  });

  it('retourne true si un cookie valide existe', () => {
    setRawCookie(COOKIE_NAME, serializeConsent(validState));
    expect(hasValidConsent()).toBe(true);
  });
});
