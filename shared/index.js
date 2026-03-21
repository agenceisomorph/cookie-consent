'use strict';

const constants = require('./constants');
const validation = require('./validation');
const schema = require('./schema.json');

module.exports = {
  ...constants,
  ...validation,
  schema,
};
