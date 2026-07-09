'use strict';

/**
 * Routes cookie-consent — Strapi v5
 * Seule la route POST est exposée publiquement.
 */
module.exports = {
  type: 'content-api',
  // prefix vide : sans lui, Strapi v5 préfixe les routes de plugin par le nom
  // du plugin (→ /api/cookie-consent/cookie-consents). On veut l'endpoint
  // documenté /api/cookie-consents, aligné sur l'adapter React.
  prefix: '',
  routes: [
    {
      method: 'POST',
      path: '/cookie-consents',
      handler: 'cookie-consent.create',
      config: {
        policies: ['plugin::cookie-consent.rate-limit'],
        description: 'Enregistrer un consentement cookie',
        tag: {
          plugin: 'cookie-consent',
          name: 'Cookie Consent',
        },
      },
    },
  ],
};
