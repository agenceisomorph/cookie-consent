'use strict';

/**
 * register — Strapi v4
 *
 * Expose l'enregistrement du consentement sur /api/cookie-consents, l'adresse
 * que l'adapter React appelle et que le README documente.
 *
 * Pourquoi ce detour : Strapi v4 prefixe de force les routes d'un plugin par le
 * nom du plugin. La ligne responsable, dans
 * @strapi/strapi/dist/services/server/register-routes.js, est
 * `router.prefix = router.prefix || '/' + pluginName` — un `prefix: ''` declare
 * dans le fichier de routes est falsy, donc ignore. Le paquet v5 accepte le
 * prefix vide ; le v4 non. La route restait donc sur
 * /api/cookie-consent/cookie-consents et le site recevait un 405 muet.
 *
 * On enregistre donc la route au niveau de l'application, ou le prefixe n'est
 * pas impose. La route prefixee du fichier routes/ reste en place : les sites
 * qui l'appellent deja continuent de fonctionner.
 *
 * L'enregistrement est protege : si une version future de Strapi changeait cette
 * API, le plugin doit se charger quand meme plutot que d'empecher le CMS de
 * demarrer.
 */
module.exports = ({ strapi }) => {
  try {
    strapi.server.routes({
      type: 'content-api',
      prefix: '',
      routes: [
        {
          method: 'POST',
          path: '/cookie-consents',
          handler: 'plugin::cookie-consent.cookie-consent.create',
          config: {
            auth: false,
            description: 'Enregistrer un consentement cookie',
          },
        },
      ],
    });
    strapi.log.info('[cookie-consent] Route publique /api/cookie-consents exposee.');
  } catch (error) {
    strapi.log.warn(
      `[cookie-consent] /api/cookie-consents non exposee (${error.message}). ` +
        'Repli disponible sur /api/cookie-consent/cookie-consents.'
    );
  }

  strapi.log.info('[cookie-consent] Plugin registered (v4).');
};
