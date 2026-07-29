'use strict';

const { validateConsentBody, anonymizeIp } = require('@isomorph-agency/cookie-consent-shared/validation');

/**
 * Controller cookie-consent — Strapi v4 (Entity Service API)
 */
module.exports = {
  /**
   * POST /api/cookie-consents
   * Crée un enregistrement de consentement.
   */
  async create(ctx) {
    // L'adapter React envoie { data: { ... } }, la convention Strapi. Le
    // controleur ne lisait que la forme a plat : le consentement etait refuse
    // avec un 400 « donnees invalides » que personne ne voyait, l'adapter
    // n'echouant jamais bruyamment. On accepte les deux formes.
    const corps = ctx.request.body;
    const charge =
      corps && typeof corps === 'object' && corps.data && typeof corps.data === 'object'
        ? corps.data
        : corps;

    const { valid, data, errors } = validateConsentBody(charge);

    if (!valid) {
      return ctx.badRequest('Données de consentement invalides.', { errors });
    }

    // Enrichir avec les données de la requête HTTP
    data.userAgent = ctx.request.headers['user-agent'] || null;
    data.ipAnonymized = anonymizeIp(
      ctx.request.headers['x-forwarded-for'] ||
      ctx.request.headers['x-real-ip'] ||
      ctx.request.ip
    );

    try {
      // Strapi v4 — Entity Service API
      const entry = await strapi.entityService.create('plugin::cookie-consent.cookie-consent', {
        data,
      });

      ctx.send({ id: entry.id, status: 'ok' }, 201);
    } catch (error) {
      strapi.log.error('[cookie-consent] Erreur création consentement:', error);
      ctx.internalServerError('Erreur lors de l\'enregistrement du consentement.');
    }
  },
};
