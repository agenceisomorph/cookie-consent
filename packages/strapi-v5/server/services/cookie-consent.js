'use strict';

/**
 * Service cookie-consent — Strapi v5
 * Logique métier déléguée au service pour testabilité.
 */
module.exports = ({ strapi }) => ({
  /**
   * Compte le nombre de consentements pour un domaine donné.
   * Utile pour le dashboard admin (V2).
   */
  async countBySource(source) {
    return strapi.documents('plugin::cookie-consent.cookie-consent').count({
      filters: { source },
    });
  },

  /**
   * Supprime les consentements expirés (maintenance CNIL).
   * À appeler via un cron job.
   */
  async purgeExpired() {
    const now = new Date().toISOString();
    const expired = await strapi.db.query('plugin::cookie-consent.cookie-consent').findMany({
      where: { expiryDate: { $lt: now } },
      select: ['id'],
    });

    if (expired.length === 0) return 0;

    await strapi.db.query('plugin::cookie-consent.cookie-consent').deleteMany({
      where: { id: { $in: expired.map((e) => e.id) } },
    });

    strapi.log.info(`[cookie-consent] ${expired.length} consentements expirés supprimés.`);
    return expired.length;
  },
});
