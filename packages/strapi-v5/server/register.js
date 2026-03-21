'use strict';

/**
 * register — appelé au chargement du plugin, avant bootstrap.
 * Rien de spécial à enregistrer pour ce plugin.
 */
module.exports = ({ strapi }) => {
  strapi.log.info('[cookie-consent] Plugin registered.');
};
