/**
 * storage.ts — Cookie first-party read/write/clear
 * Gestion du cookie de consentement côté navigateur.
 */

import type { ConsentState } from '../types/consent.types';
import {
  parseConsentFromCookie,
  serializeConsent,
  DEFAULT_EXPIRY_MONTHS,
} from './consent';

/** Nom du cookie first-party */
export const COOKIE_NAME = 'isomorph_consent';

/**
 * Lit le consentement depuis le cookie first-party.
 * Retourne null si absent, invalide ou expiré.
 */
export function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return parseConsentFromCookie(valueParts.join('='));
    }
  }

  return null;
}

/**
 * Écrit le consentement dans le cookie first-party.
 * Cookie HttpOnly:false (nécessaire pour lecture JS), Secure, SameSite=Lax.
 */
export function writeConsent(
  state: ConsentState,
  options: {
    domain?: string;
    path?: string;
    expiryMonths?: number;
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    domain,
    path = '/',
    expiryMonths = DEFAULT_EXPIRY_MONTHS,
  } = options;

  const consentDate = new Date();
  const value = serializeConsent(state, consentDate, expiryMonths);
  const expiryDate = new Date(consentDate.getTime());
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  let cookieString = `${COOKIE_NAME}=${value}; expires=${expiryDate.toUTCString()}; path=${path}; SameSite=Lax`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  // Secure uniquement en HTTPS (pas en dev localhost)
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:'
  ) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Supprime le cookie de consentement.
 */
export function clearConsent(
  options: { domain?: string; path?: string } = {}
): void {
  if (typeof document === 'undefined') return;

  const { domain, path = '/' } = options;

  let cookieString = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * Vérifie si un consentement valide existe.
 */
export function hasValidConsent(): boolean {
  return readConsent() !== null;
}
