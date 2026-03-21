'use strict';

/**
 * Service cookie-consent — Strapi v4 (Entity Service API)
 */
module.exports = ({ strapi }) => ({
  async countBySource(source) {
    return strapi.entityService.count('plugin::cookie-consent.cookie-consent', {
      filters: { source },
    });
  },

  async purgeExpired() {
    const now = new Date().toISOString();
    const expired = await strapi.query('plugin::cookie-consent.cookie-consent').findMany({
      where: { expiryDate: { $lt: now } },
      select: ['id'],
    });

    if (expired.length === 0) return 0;

    await strapi.query('plugin::cookie-consent.cookie-consent').deleteMany({
      where: { id: { $in: expired.map((e) => e.id) } },
    });

    strapi.log.info(`[cookie-consent] ${expired.length} consentements expirés supprimés (v4).`);
    return expired.length;
  },
});
