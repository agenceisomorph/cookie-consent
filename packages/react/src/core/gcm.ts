/**
 * gcm.ts — Google Consent Mode V2 helpers
 * Gestion des signaux gtag consent default/update.
 *
 * Ordre de chargement obligatoire dans layout.tsx :
 * 1. Script inline beforeInteractive → gtag consent default (tous denied)
 * 2. GTM/GA4 afterInteractive
 * 3. CookieProvider → lit cookie → gtag consent update si existant
 */

import type { ConsentState, ConsentCategory } from '../types/consent.types';
import type { GcmSignal, GcmConsentValue, GcmConsentState } from '../types/gcm.types';

/**
 * Mapping catégories UI → signaux GCM V2.
 * security_storage est toujours granted (reCAPTCHA jamais bloqué).
 */
export const GCM_SIGNAL_MAP: Record<ConsentCategory, GcmSignal[]> = {
  necessary: ['security_storage'],
  analytics: ['analytics_storage'],
  advertising: ['ad_storage', 'ad_user_data', 'ad_personalization'],
  functional: ['functionality_storage'],
};

/** Tous les signaux GCM V2 */
export const ALL_GCM_SIGNALS: GcmSignal[] = [
  'analytics_storage',
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'functionality_storage',
  'security_storage',
];

/**
 * Convertit une catégorie UI en signaux GCM V2 avec leur valeur.
 */
export function mapCategoryToSignals(
  category: ConsentCategory,
  granted: boolean,
): Partial<GcmConsentState> {
  const signals = GCM_SIGNAL_MAP[category];
  if (!signals) return {};

  const value: GcmConsentValue = granted ? 'granted' : 'denied';
  const result: Partial<GcmConsentState> = {};
  for (const signal of signals) {
    result[signal] = value;
  }
  return result;
}

/**
 * Crée l'état GCM V2 par défaut — tous les signaux denied sauf security_storage.
 * À utiliser dans le script inline beforeInteractive.
 */
export function createDefaultGcmState(): GcmConsentState {
  return {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    security_storage: 'granted', // reCAPTCHA — jamais bloqué
  };
}

/**
 * Convertit un ConsentState complet en GcmConsentState.
 * security_storage reste toujours granted.
 */
export function consentStateToGcm(state: ConsentState): GcmConsentState {
  return {
    analytics_storage: state.analytics ? 'granted' : 'denied',
    ad_storage: state.advertising ? 'granted' : 'denied',
    ad_user_data: state.advertising ? 'granted' : 'denied',
    ad_personalization: state.advertising ? 'granted' : 'denied',
    functionality_storage: state.functional ? 'granted' : 'denied',
    security_storage: 'granted', // toujours granted
  };
}

/**
 * Envoie `gtag('consent', 'default', ...)` — état initial avant tout script.
 * NE DOIT être appelé qu'une seule fois, AVANT le chargement de GTM/GA4.
 */
export function setDefaultConsent(): void {
  pushGtagCommand('consent', 'default', createDefaultGcmState());
}

/**
 * Envoie `gtag('consent', 'update', ...)` — met à jour les signaux après consentement.
 * Ne modifie jamais security_storage (toujours granted).
 */
export function updateConsent(state: ConsentState): void {
  pushGtagCommand('consent', 'update', consentStateToGcm(state));
}

/**
 * Génère le code inline pour le script beforeInteractive.
 * À injecter dans le <head> avant GTM/GA4.
 */
export function getInlineConsentScript(): string {
  const defaultState = createDefaultGcmState();
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(defaultState)});`;
}

/**
 * Helper interne — push une commande dans le dataLayer.
 * Crée gtag/dataLayer si nécessaire (SSR-safe).
 */
function pushGtagCommand(...args: unknown[]): void {
  if (typeof window === 'undefined') return;

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }

  window.gtag(...args);
}
