'use strict';

/**
 * Services prod-platform monitors.
 * Format: { name, url }
 *
 * Default: monitor itself locally.
 * Later we can add enterprise-platform here.
 */
const SERVICES = [
  { name: 'prod-platform', url: process.env.SELF_URL || 'http://127.0.0.1:3000/health' },
];

module.exports = { SERVICES };
