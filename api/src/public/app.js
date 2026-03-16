async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function formatLatency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return `${Math.round(Number(value))} ms`;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return `${Number(value).toFixed(2)}%`;
}

function formatTimestamp(value) {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusLabel(analytics) {
  if (!analytics) return 'UNKNOWN';

  const totalChecks = Number(analytics.total_checks || 0);
  const failedChecks = Number(analytics.failed_checks || 0);

  if (totalChecks === 0) return 'UNKNOWN';
  if (failedChecks > 0) return 'DOWN';

  return 'OK';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function renderOverview(services, analyticsList) {
  const totalServices = services.length;

  let totalChecks = 0;
  let totalFailures = 0;
  let totalLatency = 0;
  let latencyCount = 0;

  for (const analytics of analyticsList) {
    totalChecks += Number(analytics.total_checks || 0);
    totalFailures += Number(analytics.failed_checks || 0);

    if (analytics.average_latency_ms !== null && analytics.average_latency_ms !== undefined) {
      totalLatency += Number(analytics.average_latency_ms);
      latencyCount += 1;
    }
  }

  const uptimePercent =
    totalChecks > 0
      ? ((totalChecks - totalFailures) / totalChecks) * 100
      : null;

  const averageLatency =
    latencyCount > 0
      ? totalLatency / latencyCount
      : null;

  setText('services-count', totalServices);
  setText('uptime-percent', formatPercent(uptimePercent));
  setText('avg-latency', formatLatency(averageLatency));
  setText('failure-count', totalFailures);
}

function renderServicesTable(services, analyticsByService) {
  const tbody = document.querySelector('#services-table tbody');
  tbody.innerHTML = '';

  for (const service of services) {
    const analytics = analyticsByService[service];
    const row = document.createElement('tr');

    const serviceName = service;
    const target = '--';
    const status = getStatusLabel(analytics);
    const uptime = formatPercent(analytics?.uptime_percentage);
    const latency = formatLatency(analytics?.average_latency_ms);
    const lastCheck = formatTimestamp(analytics?.latest_check_at);

    row.innerHTML = `
      <td>${serviceName}</td>
      <td>${target}</td>
      <td>${status}</td>
      <td>${uptime}</td>
      <td>${latency}</td>
      <td>${lastCheck}</td>
    `;

    tbody.appendChild(row);
  }
}

function renderChecksTable(serviceName, historyItems) {
  const tbody = document.querySelector('#checks-table tbody');
  tbody.innerHTML = '';

  const recentItems = historyItems.slice(0, 10);

  for (const item of recentItems) {
    const row = document.createElement('tr');

    const timestamp = formatTimestamp(item.ts);
    const result = item.ok === true ? 'OK' : 'DOWN';
    const latency = formatLatency(item.latencyMs);

    row.innerHTML = `
      <td>${timestamp}</td>
      <td>${serviceName}</td>
      <td>${result}</td>
      <td>${latency}</td>
    `;

    tbody.appendChild(row);
  }
}

function renderError(message) {
  setText('services-count', 'ERR');
  setText('uptime-percent', 'ERR');
  setText('avg-latency', 'ERR');
  setText('failure-count', 'ERR');

  const servicesBody = document.querySelector('#services-table tbody');
  const checksBody = document.querySelector('#checks-table tbody');

  servicesBody.innerHTML = `
    <tr>
      <td colspan="6">${message}</td>
    </tr>
  `;

  checksBody.innerHTML = `
    <tr>
      <td colspan="4">${message}</td>
    </tr>
  `;
}

async function loadDashboard() {
  try {
    const servicesResponse = await fetchJson('/services');
    const services = servicesResponse.services || [];

    if (services.length === 0) {
      renderOverview([], []);
      renderError('No services found.');
      return;
    }

    const analyticsEntries = await Promise.all(
      services.map(async (service) => {
        try {
          const analytics = await fetchJson(`/analytics?service=${encodeURIComponent(service)}`);
          return [service, analytics];
        } catch (error) {
          console.error(`Failed to load analytics for ${service}:`, error);
          return [service, null];
        }
      })
    );

    const analyticsByService = Object.fromEntries(analyticsEntries);
    const analyticsList = analyticsEntries
      .map((entry) => entry[1])
      .filter(Boolean);

    renderOverview(services, analyticsList);
    renderServicesTable(services, analyticsByService);

    const firstService = services[0];

    try {
      const historyResponse = await fetchJson(`/history/${encodeURIComponent(firstService)}?limit=10`);
      renderChecksTable(firstService, historyResponse.history || []);
    } catch (error) {
      console.error(`Failed to load history for ${firstService}:`, error);
      const checksBody = document.querySelector('#checks-table tbody');
      checksBody.innerHTML = `
        <tr>
          <td colspan="4">Failed to load recent checks.</td>
        </tr>
      `;
    }
  } catch (error) {
    console.error('Dashboard load failed:', error);
    renderError('Failed to load dashboard data.');
  }
}

loadDashboard();
