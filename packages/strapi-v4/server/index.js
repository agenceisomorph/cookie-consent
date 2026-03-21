'use strict';

/**
 * Plugin Strapi v4 — @isomorph/strapi-plugin-cookie-consent-v4
 * Entry point (strapi-server pattern v4)
 */

const register = require('./register');
const bootstrap = require('./bootstrap');
const contentTypes = require('./content-types');
const controllers = require('./controllers/cookie-consent');
const routes = require('./routes/cookie-consent');
const services = require('./services/cookie-consent');

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
};
