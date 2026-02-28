'use strict';

const { SERVICES } = require('./services');
const { recordUptime, registerService } = require('./uptimeStore');

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 30000);

async function checkService(service) {
  const startedAt = Date.now();
  let ok = false;
  let statusCode = null;

  try {
    const res = await fetch(service.url, { method: 'GET' });
    statusCode = res.status;
    ok = res.ok;
  } catch {
    ok = false;
    statusCode = null;
  }

  const latencyMs = Date.now() - startedAt;

  const point = {
  ts: new Date().toISOString(),
  ok,
  statusCode,
  latencyMs,
  url: service.url,
};

  await registerService(service.name);
  await recordUptime(service.name, point);
}

function startPoller() {
  // Register all services early
  SERVICES.forEach((s) => registerService(s.name).catch(() => {}));

  // Run immediately, then on interval
  SERVICES.forEach((s) => checkService(s).catch(console.error));

  setInterval(() => {
    SERVICES.forEach((s) => checkService(s).catch(console.error));
  }, POLL_INTERVAL_MS);

  console.log(
    `Poller started: ${SERVICES.length} service(s), interval=${POLL_INTERVAL_MS}ms`
  );
}

module.exports = { startPoller };
