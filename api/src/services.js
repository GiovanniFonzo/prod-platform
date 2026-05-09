'use strict';

/**
 * Services prod-platform monitors.
 * Format: { name, url }
 *
 * Default: monitor itself locally.
 * Later we can add enterprise-platform here.
 */

const SERVICES = [
  {
    name: 'prod-platform',
    url: process.env.SELF_URL || 'http://api:3000/health',
  },
  {
    name: 'flask-blogging-app',
    url: process.env.FLASK_BLOGGING_APP_URL || 'http://host.docker.internal:5050/health',
  },
];

module.exports = { SERVICES };
