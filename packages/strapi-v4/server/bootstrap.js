'use strict';

/**
 * bootstrap — Strapi v4
 * Configure automatiquement les permissions API publiques.
 */
module.exports = async ({ strapi }) => {
  // Trouver le rôle "Public"
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[cookie-consent] Rôle public introuvable — permissions non configurées automatiquement.');
    return;
  }

  // Vérifier si la permission POST existe déjà
  const existingPermission = await strapi
    .query('plugin::users-permissions.permission')
    .findOne({
      where: {
        role: publicRole.id,
        action: 'plugin::cookie-consent.cookie-consent.create',
      },
    });

  if (!existingPermission) {
    await strapi.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::cookie-consent.cookie-consent.create',
        role: publicRole.id,
      },
    });
    strapi.log.info('[cookie-consent] Permission POST publique configurée automatiquement (v4).');
  }
};
