'use strict';

/**
 * Routes cookie-consent — Strapi v4
 */
module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/cookie-consents',
      handler: 'cookie-consent.create',
      config: {
        description: 'Enregistrer un consentement cookie',
        tag: {
          plugin: 'cookie-consent',
          name: 'Cookie Consent',
        },
      },
    },
  ],
};
