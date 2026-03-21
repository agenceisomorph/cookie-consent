'use strict';

/**
 * bootstrap — appelé après l'enregistrement du plugin.
 * Configure automatiquement les permissions API :
 * - POST /api/cookie-consents → public (sans auth)
 * - GET  /api/cookie-consents → admin uniquement (défaut Strapi)
 */
module.exports = async ({ strapi }) => {
  // Trouver le rôle "Public"
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    strapi.log.warn('[cookie-consent] Rôle public introuvable — permissions non configurées automatiquement.');
    return;
  }

  // Vérifier si la permission POST existe déjà
  const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
    where: {
      role: publicRole.id,
      action: 'plugin::cookie-consent.cookie-consent.create',
    },
  });

  if (!existingPermission) {
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::cookie-consent.cookie-consent.create',
        role: publicRole.id,
      },
    });
    strapi.log.info('[cookie-consent] Permission POST publique configurée automatiquement.');
  } else {
    strapi.log.info('[cookie-consent] Permission POST publique déjà configurée.');
  }
};
