'use strict';

const client = require('prom-client');

// Create a dedicated registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Total HTTP requests
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// HTTP request duration (seconds)
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// HTTP 5xx error counter
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP error responses (5xx)',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Process-level exceptions counter
const processExceptionsTotal = new client.Counter({
  name: 'process_exceptions_total',
  help: 'Total number of process-level exceptions',
  labelNames: ['type'], // uncaughtException | unhandledRejection
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

    // Track 5xx errors
    if (res.statusCode >= 500) {
      httpErrorsTotal.inc(labels, 1);
    }
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

function recordUncaughtException() {
  processExceptionsTotal.inc({ type: 'uncaughtException' }, 1);
}

function recordUnhandledRejection() {
  processExceptionsTotal.inc({ type: 'unhandledRejection' }, 1);
}

module.exports = {
  metricsMiddleware,
  metricsHandler,
  recordUncaughtException,
  recordUnhandledRejection,
};
