'use strict';

const { getRedisClient } = require('./redisClient');

const DEFAULT_MAX_POINTS = Number(process.env.UPTIME_MAX_POINTS || 10000);

function keyFor(serviceName) {
  return `uptime:${serviceName}`;
}

/**
 * Record one uptime datapoint.
 * Uses LPUSH + LTRIM to keep a capped list.
 */
async function recordUptime(serviceName, point) {
  const c = await getRedisClient();
  const key = keyFor(serviceName);

  const payload = JSON.stringify(point);

  // Push newest first
  await c.lPush(key, payload);
  // Keep only most recent N points
  await c.lTrim(key, 0, DEFAULT_MAX_POINTS - 1);
}

/**
 * Get most recent uptime points (newest first).
 */
async function getUptimeHistory(serviceName, limit = 200) {
  const c = await getRedisClient();
  const key = keyFor(serviceName);

  const n = Math.max(1, Math.min(Number(limit) || 200, 5000));
  const rows = await c.lRange(key, 0, n - 1);

  return rows
    .map((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Track known services in a Redis set for easy discovery.
 */
async function registerService(serviceName) {
  const c = await getRedisClient();
  await c.sAdd('services', serviceName);
}

async function listServices() {
  const c = await getRedisClient();
  const names = await c.sMembers('services');
  return names.sort();
}

module.exports = {
  recordUptime,
  getUptimeHistory,
  registerService,
  listServices,
};
