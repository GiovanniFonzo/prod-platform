'use strict';

const { getUptimeHistory } = require('./uptimeStore');

function parseWindow(windowStr) {
  const raw = String(windowStr || '24h').trim().toLowerCase();

  if (raw.endsWith('h')) {
    return Number(raw.slice(0, -1)) * 60 * 60 * 1000;
  }

  if (raw.endsWith('d')) {
    return Number(raw.slice(0, -1)) * 24 * 60 * 60 * 1000;
  }

  return 24 * 60 * 60 * 1000;
}

async function getAnalytics(serviceName, windowStr = '24h') {
  const windowMs = parseWindow(windowStr);
  const cutoff = Date.now() - windowMs;

  const rows = await getUptimeHistory(serviceName, 5000);

  const filtered = rows.filter((row) => {
    const ts = Date.parse(row.ts);
    return Number.isFinite(ts) && ts >= cutoff;
  });

  const totalChecks = filtered.length;
  const successfulChecks = filtered.filter((row) => row.ok).length;
  const failedChecks = totalChecks - successfulChecks;

  const uptimePercentage =
    totalChecks === 0 ? 0 : Number(((successfulChecks / totalChecks) * 100).toFixed(2));

  const latencyValues = filtered
    .map((row) => Number(row.latencyMs))
    .filter((n) => Number.isFinite(n));

  const averageLatencyMs =
    latencyValues.length === 0
      ? 0
      : Math.round(latencyValues.reduce((sum, n) => sum + n, 0) / latencyValues.length);

  const latestCheckAt =
    filtered.length > 0 ? filtered[0].ts : null;

  return {
    service: serviceName,
    window: windowStr,
    total_checks: totalChecks,
    successful_checks: successfulChecks,
    failed_checks: failedChecks,
    uptime_percentage: uptimePercentage,
    average_latency_ms: averageLatencyMs,
    latest_check_at: latestCheckAt
  };
}

module.exports = { getAnalytics };
