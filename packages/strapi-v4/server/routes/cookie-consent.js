'use strict';

/**
 * Routes cookie-consent — Strapi v4
 */
module.exports = {
  type: 'content-api',
  // prefix vide : sans lui, Strapi prefixe les routes de plugin par le nom du
  // plugin (-> /api/cookie-consent/cookie-consents). L'adapter React poste sur
  // /api/cookie-consents, comme le documente le README : sans ce reglage le
  // consentement n'est jamais enregistre, le site recoit un 405 sans rien dire.
  // Le paquet v5 porte deja cette ligne ; elle manquait ici (constat OTRE 29/07).
  prefix: '',
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
