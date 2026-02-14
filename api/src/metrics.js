'use strict';

const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  // Best-effort route labeling
  const route =
    (req.route && req.route.path) ||
    (req.baseUrl ? `${req.baseUrl}${req.path}` : req.path) ||
    'unknown';

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationSeconds = Number(end - start) / 1e9;

    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels, 1);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
}

async function metricsHandler(req, res) {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch {
    res.status(500).send('Failed to collect metrics');
  }
}

module.exports = {
  metricsMiddleware,
  metricsHandler,
};
