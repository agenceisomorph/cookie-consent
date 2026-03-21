'use strict';

/**
 * Routes cookie-consent — Strapi v5
 * Seule la route POST est exposée publiquement.
 */
module.exports = {
  type: 'content-api',
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
