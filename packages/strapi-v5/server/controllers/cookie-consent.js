'use strict';

const { validateConsentBody, anonymizeIp } = require('@isomorph-agency/cookie-consent-shared/validation');

/**
 * Controller cookie-consent — Strapi v5 (Document Service API)
 */
module.exports = {
  /**
   * POST /api/cookie-consents
   * Crée un enregistrement de consentement.
   * Public — pas d'authentification requise.
   */
  async create(ctx) {
    const { valid, data, errors } = validateConsentBody(ctx.request.body);

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
      // Strapi v5 — Document Service API
      const entry = await strapi.documents('plugin::cookie-consent.cookie-consent').create({
        data,
      });

      // Réponse minimale (fire & forget côté client)
      ctx.send({ id: entry.documentId, status: 'ok' }, 201);
    } catch (error) {
      strapi.log.error('[cookie-consent] Erreur création consentement:', error);
      ctx.internalServerError('Erreur lors de l\'enregistrement du consentement.');
    }
  },
};
