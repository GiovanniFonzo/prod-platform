'use strict';

const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let client;

/**
 * Get (and lazy-init) a shared Redis client.
 * We connect on first use so local dev can run without Redis until needed.
 */
async function getRedisClient() {
  if (client && client.isOpen) return client;

  client = createClient({ url: REDIS_URL });

  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

module.exports = {
  getRedisClient,
  REDIS_URL,
};
