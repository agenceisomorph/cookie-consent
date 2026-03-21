/**
 * consent.ts — Logique de consentement
 * Parse, validate, expiry, état par défaut.
 */

import type {
  ConsentState,
  ConsentCookieData,
  ConsentAction,
  ConsentCategory,
} from '../types/consent.types';

/** Durée par défaut du consentement en mois (CNIL) */
export const DEFAULT_EXPIRY_MONTHS = 13;

/** Version du format cookie (pour migrations futures) */
export const COOKIE_DATA_VERSION = '1';

/** Catégories disponibles (hors "necessary" qui est toujours actif) */
export const OPTIONAL_CATEGORIES: ConsentCategory[] = ['analytics', 'advertising', 'functional'];

/**
 * Crée un état de consentement par défaut.
 * Toutes les catégories optionnelles sont refusées (CNIL — pas de case pré-cochée).
 */
export function createDefaultConsent(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    advertising: false,
    functional: false,
  };
}

/**
 * Crée un état "tout accepter".
 */
export function createAcceptAllConsent(): ConsentState {
  return {
    necessary: true,
    analytics: true,
    advertising: true,
    functional: true,
  };
}

/**
 * Détermine l'action à partir de l'état de consentement.
 */
export function resolveAction(state: ConsentState): ConsentAction {
  const allAccepted = state.analytics && state.advertising && state.functional;
  const allRefused = !state.analytics && !state.advertising && !state.functional;

  if (allAccepted) return 'accept_all';
  if (allRefused) return 'refuse_all';
  return 'custom';
}

/**
 * Calcule la date d'expiration à partir d'une date de consentement.
 */
export function getExpiryDate(consentDate: Date, months: number = DEFAULT_EXPIRY_MONTHS): Date {
  const expiry = new Date(consentDate.getTime());
  expiry.setMonth(expiry.getMonth() + months);
  return expiry;
}

/**
 * Valide un objet ConsentState.
 * Retourne true si l'objet est valide, false sinon.
 */
export function validateConsentState(obj: unknown): obj is ConsentState {
  if (!obj || typeof obj !== 'object') return false;

  const state = obj as Record<string, unknown>;

  if (state.necessary !== true) return false;
  if (typeof state.analytics !== 'boolean') return false;
  if (typeof state.advertising !== 'boolean') return false;
  if (typeof state.functional !== 'boolean') return false;

  return true;
}

/**
 * Parse les données du cookie first-party.
 * Retourne null si le cookie est absent, invalide ou expiré.
 */
export function parseConsentFromCookie(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;

  try {
    const data: ConsentCookieData = JSON.parse(decodeURIComponent(raw));

    // Vérifier la version du format
    if (data.v !== COOKIE_DATA_VERSION) return null;

    // Vérifier l'expiration
    const expiryDate = new Date(data.exp);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) return null;

    // Valider l'état de consentement
    if (!validateConsentState(data.s)) return null;

    return data.s;
  } catch {
    return null;
  }
}

/**
 * Sérialise l'état de consentement pour le cookie first-party.
 */
export function serializeConsent(
  state: ConsentState,
  consentDate: Date = new Date(),
  expiryMonths: number = DEFAULT_EXPIRY_MONTHS,
): string {
  const cookieData: ConsentCookieData = {
    v: COOKIE_DATA_VERSION,
    s: state,
    exp: getExpiryDate(consentDate, expiryMonths).toISOString(),
    ts: consentDate.toISOString(),
  };

  return encodeURIComponent(JSON.stringify(cookieData));
}

/**
 * Génère un sessionId anonyme (hash simple, pas de tracking).
 */
export function generateSessionId(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback pour les environnements sans crypto (tests)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
