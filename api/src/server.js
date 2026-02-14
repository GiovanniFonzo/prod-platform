'use strict';

const express = require('express');
const os = require('os');
const { metricsMiddleware, metricsHandler } = require('./metrics');


const app = express();

app.disable('x-powered-by');
// Record metrics for all endpoints except /metrics itself
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

// API endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/version', (req, res) => {
  res.status(200).json({ version: APP_VERSION });
});

app.get('/status', (req, res) => {
  res.status(200).json(statusPayload());
});

// Visible dashboard
app.get('/', (req, res) => {
  const s = statusPayload();
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Prod Platform — Status</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
    .wrap { max-width: 900px; margin: 0 auto; }
    .row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
    .k { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; opacity: .7; margin-bottom: 6px; }
    .v { font-size: 18px; font-weight: 600; word-break: break-word; }
    .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #ecfdf5; border: 1px solid #10b98133; font-weight: 700; }
    .btn { margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fff; cursor: pointer; }
    pre { margin-top: 14px; padding: 12px; border-radius: 14px; background: #0b1020; color: #e5e7eb; overflow: auto; }
    @media (max-width: 700px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Production Platform — Status</h1>
    <div class="pill">OK</div>

    <div class="row" style="margin-top: 16px;">
      <div class="card"><div class="k">Environment</div><div class="v">${escapeHtml(s.env)}</div></div>
      <div class="card"><div class="k">Version</div><div class="v">${escapeHtml(s.version)}</div></div>
      <div class="card"><div class="k">Hostname</div><div class="v">${escapeHtml(s.hostname)}</div></div>
      <div class="card"><div class="k">Uptime (seconds)</div><div class="v">${s.uptime_seconds}</div></div>
      <div class="card"><div class="k">Timestamp</div><div class="v">${escapeHtml(s.timestamp)}</div></div>
      <div class="card"><div class="k">API</div><div class="v">/health • /version • /status</div></div>
    </div>

    <button class="btn" onclick="location.reload()">Refresh</button>

    <pre id="json"></pre>
  </div>

  <script>
    async function loadStatus() {
      const r = await fetch('/status');
      const j = await r.json();
      document.getElementById('json').textContent = JSON.stringify(j, null, 2);
    }
    loadStatus().catch(err => {
      document.getElementById('json').textContent = 'Failed to load /status: ' + err;
    });
  </script>
</body>
</html>`;

  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

// Helper: escape output in HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`env=${APP_ENV} version=${APP_VERSION}`);
  });
}

module.exports = app;

