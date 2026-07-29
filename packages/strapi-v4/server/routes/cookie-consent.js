'use strict';

/**
 * Routes cookie-consent — Strapi v4
 */
module.exports = {
  type: 'content-api',
  // ATTENTION : contrairement au paquet v5, declarer `prefix: ''` ici ne sert a
  // RIEN sur Strapi v4. Le chargeur fait `router.prefix = router.prefix || '/' +
  // pluginName` : la chaine vide est falsy, donc remplacee. Cette route sort
  // toujours sur /api/cookie-consent/cookie-consents.
  // L'adresse documentee /api/cookie-consents est exposee par server/register.js,
  // au niveau de l'application, ou le prefixe n'est pas impose.
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
