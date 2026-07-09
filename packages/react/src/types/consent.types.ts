/**
 * Types consentement — @isomorph-agency/cookie-consent
 */

/** État du consentement par catégorie */
export interface ConsentState {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

/** Enregistrement complet envoyé au backend */
export interface ConsentRecord extends ConsentState {
  sessionId: string;
  gcmVersion: string;
  consentDate: string;
  expiryDate: string;
  source: string;
  action: ConsentAction;
}

/** Données sérialisées dans le cookie first-party */
export interface ConsentCookieData {
  /** Version du format cookie (pour migrations futures) */
  v: string;
  /** État du consentement par catégorie */
  s: ConsentState;
  /** ISO date d'expiration */
  exp: string;
  /** ISO date du consentement */
  ts: string;
}

/** Actions utilisateur possibles */
export type ConsentAction = 'accept_all' | 'refuse_all' | 'custom';

/** Catégories de cookies */
export type ConsentCategory = 'necessary' | 'analytics' | 'advertising' | 'functional';

/** Configuration du CookieProvider */
export interface CookieConsentConfig {
  /** URL API Strapi (ex: https://admin.otrepaca.fr/api) */
  strapiUrl: string;
  /** Domaine du site (ex: otrepaca.fr) — utilisé comme "source" */
  siteDomain: string;
  /** Catégories activées (défaut: toutes) */
  categories?: ConsentCategory[];
  /** Durée du cookie en mois (défaut: 13, max CNIL) */
  expiryMonths?: number;
  /** Callback après changement de consentement */
  onConsentChange?: (state: ConsentState) => void;
}
