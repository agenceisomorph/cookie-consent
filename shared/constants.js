'use strict';

/**
 * Constantes partagées — @isomorph/cookie-consent
 * Utilisées par les plugins Strapi v4/v5 et le package React.
 */

/** Durée de validité du cookie en mois (obligation CNIL) */
const CONSENT_EXPIRY_MONTHS = 13;

/** Nom du cookie first-party */
const COOKIE_NAME = 'isomorph_consent';

/** Catégories de cookies */
const CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  ADVERTISING: 'advertising',
  FUNCTIONAL: 'functional',
};

/** Actions possibles */
const ACTIONS = {
  ACCEPT_ALL: 'accept_all',
  REFUSE_ALL: 'refuse_all',
  CUSTOM: 'custom',
};

/**
 * Mapping catégories UI → signaux Google Consent Mode V2
 * security_storage est toujours granted (reCAPTCHA)
 */
const GCM_SIGNAL_MAP = {
  [CATEGORIES.NECESSARY]: ['security_storage'],
  [CATEGORIES.ANALYTICS]: ['analytics_storage'],
  [CATEGORIES.ADVERTISING]: ['ad_storage', 'ad_user_data', 'ad_personalization'],
  [CATEGORIES.FUNCTIONAL]: ['functionality_storage'],
};

/** Tous les signaux GCM V2 */
const GCM_SIGNALS = [
  'analytics_storage',
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'functionality_storage',
  'security_storage',
];

/** Nombre d'octets IP à conserver (anonymisation RGPD) */
const IP_OCTETS_KEPT = 3;

module.exports = {
  CONSENT_EXPIRY_MONTHS,
  COOKIE_NAME,
  CATEGORIES,
  ACTIONS,
  GCM_SIGNAL_MAP,
  GCM_SIGNALS,
  IP_OCTETS_KEPT,
};
