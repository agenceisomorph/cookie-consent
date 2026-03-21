'use strict';

/**
 * Plugin Strapi v5 — @isomorph/strapi-plugin-cookie-consent
 * Entry point (Plugin SDK v5 pattern)
 */

const register = require('./register');
const bootstrap = require('./bootstrap');
const contentTypes = require('./content-types');
const controllers = require('./controllers/cookie-consent');
const routes = require('./routes/cookie-consent');
const services = require('./services/cookie-consent');
const policies = require('./policies/rate-limit');

module.exports = {
  register,
  bootstrap,
  contentTypes,
  controllers: {
    'cookie-consent': controllers,
  },
  routes: {
    'cookie-consent': routes,
  },
  services: {
    'cookie-consent': services,
  },
  policies: {
    'rate-limit': policies,
  },
};
