'use strict';

const express = require('express');
const path = require("path");
const os = require('os');

const {
  metricsMiddleware,
  metricsHandler,
  recordUncaughtException,
  recordUnhandledRejection
} = require('./metrics');

const { listServices, getUptimeHistory } = require('./uptimeStore');
const { startPoller } = require('./poller');
const { getAnalytics } = require('./analytics');

process.on('uncaughtException', (err) => {
  recordUncaughtException();
  console.error('uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  recordUnhandledRejection();
  console.error('unhandledRejection:', reason);
});

const app = express();

app.disable('x-powered-by');

app.use(express.json());

/*
Serve dashboard UI
This exposes:
http://localhost:3000 → public/index.html
*/
app.use(express.static(path.join(__dirname, "public")));

/*
Metrics middleware
Exclude /metrics endpoint itself
*/
app.use((req, res, next) => {
  if (req.path === '/metrics') return next();
  return metricsMiddleware(req, res, next);
});

app.get('/metrics', metricsHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const APP_ENV = process.env.APP_ENV || 'dev';
const APP_VERSION = process.env.APP_VERSION || '0.1.0';
const START_TIME = Date.now();

function secondsUptime() {
  return Math.floor((Date.now() - START_TIME) / 1000);
}

function statusPayload() {
  return {
    ok: true,
    service: 'prod-platform-api',
    env: APP_ENV,
    version: APP_VERSION,
    uptime_seconds: secondsUptime(),
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  };
}

/*
API endpoints
*/

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/version', (req, res) => {
  res.status(200).json({ version: APP_VERSION });
});

app.get('/status', (req, res) => {
  res.status(200).json(statusPayload());
});

app.get('/services', async (req, res) => {
  try {
    const services = await listServices();
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list services' });
  }
});

app.get('/history/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const limit = req.query.limit || 200;

    const history = await getUptimeHistory(service, limit);

    res.json({
      service,
      count: history.length,
      history
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.get('/analytics', async (req, res) => {
  try {
    const service = req.query.service;
    const window = req.query.window || '24h';

    if (!service) {
      const services = await listServices();
      return res.status(400).json({
        ok: false,
        error: 'Missing required query parameter: service',
        available_services: services
      });
    }

    const data = await getAnalytics(service, window);

    return res.status(200).json(data);

  } catch (err) {
    console.error('analytics error:', err);

    return res.status(500).json({
      ok: false,
      error: 'Failed to compute analytics'
    });
  }
});

/*
Start server
*/

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`env=${APP_ENV} version=${APP_VERSION}`);

    startPoller();
  });
}

module.exports = app;
