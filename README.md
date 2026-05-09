# Prod-Platform

Production-oriented Node.js monitoring platform demonstrating REST APIs, Prometheus-style metrics, Redis-backed uptime polling, Docker deployment, and AWS EC2 infrastructure.

---

## Architecture

Browser  
↓  
Dashboard UI  
↓  
Node.js API  
↓  
Analytics Layer  
↓  
Redis (uptime history)  
↓  
Background Poller  

Infrastructure:

Nginx → Docker → Node API + Redis → AWS EC2

---

## Features

### Core API
- `/health` — health check
- `/version` — version info
- `/status` — runtime metadata

### Observability
- `/metrics` — Prometheus metrics
- request + latency tracking
- error tracking (5xx + process exceptions)

### Uptime Monitoring
- background polling system
- Redis-backed history storage
- latency + status tracking

### Analytics
- `/services` — list services
- `/history/:service` — recent checks
- `/analytics` — uptime %, latency, failures

### Dashboard (Phase 7)
- real-time monitoring UI
- service overview + detail panel
- uptime / latency / failure metrics
- status badges + latency highlighting
- auto-refresh (30s)
- latency trend chart

---

## Tech Stack

- Node.js (Express)
- Redis
- Docker / Docker Compose
- Nginx (reverse proxy)
- AWS EC2
- Chart.js (frontend visualization)

---

## Running Locally

    docker compose up --build

Open:

`http://localhost:3000`

---

## Production

- Hosted on AWS EC2
- Nginx reverse proxy
- HTTPS via Let’s Encrypt
- Dockerized deployment

---

## Project Purpose

This project demonstrates how to design and deploy a production-style monitoring platform with:

- backend services
- observability
- analytics
- frontend dashboard
- cloud infrastructure


## External Application Monitoring

`prod-platform` can monitor external applications through health-check endpoints.

As an integration milestone, a completed Flask Blogging App was connected to `prod-platform` as a monitored service.

The Flask app remains a separate application, while `prod-platform` monitors its availability, latency, uptime history, and service analytics.

---

### Monitored Services

| Service | Description | Health Endpoint |
|---|---|---|
| `prod-platform` | Node.js monitoring API | `http://api:3000/health` |
| `flask-blogging-app` | Flask, SQLAlchemy, PostgreSQL blogging application | `http://host.docker.internal:5050/health` |

---

### Flask Blogging App Health Check

The Flask Blogging App exposes a `/health` endpoint.

From the host machine:

```bash
curl http://127.0.0.1:5050/health
```

Example response:

```json
{
  "database": "postgresql",
  "service": "flask-blogging-app",
  "status": "ok"
}
```

---

### Monitoring Configuration

The monitored services are configured in:

```text
api/src/services.js
```

```js
const SERVICES = [
  {
    name: 'prod-platform',
    url: process.env.SELF_URL || 'http://api:3000/health',
  },
  {
    name: 'flask-blogging-app',
    url: process.env.FLASK_BLOGGING_APP_URL || 'http://host.docker.internal:5050/health',
  },
];

module.exports = { SERVICES };
```

The Docker Compose environment variables are configured in:

```text
docker-compose.yml
```

```yaml
environment:
  APP_ENV: docker-compose
  APP_VERSION: 0.1.0
  REDIS_URL: redis://redis:6379
  POLL_INTERVAL_SECONDS: "30"
  SELF_URL: "http://api:3000/health"
  FLASK_BLOGGING_APP_URL: "http://host.docker.internal:5050/health"
```

---

### Validation

Start the Flask Blogging App first:

```bash
cd ~/Projects/blogging-app
source venv/bin/activate
python backend.py
```

Then start `prod-platform`:

```bash
cd ~/Projects/prod-platform
docker compose down
docker compose up --build --force-recreate
```

Expected startup log:

```text
Poller started: 2 service(s), interval=30000ms
```

Check the Flask Blogging App history:

```bash
curl "http://localhost:3000/history/flask-blogging-app?limit=5"
```

Check the Flask Blogging App analytics:

```bash
curl "http://localhost:3000/analytics?service=flask-blogging-app"
```

Example analytics response:

```json
{
  "service": "flask-blogging-app",
  "window": "24h",
  "total_checks": 3,
  "successful_checks": 3,
  "failed_checks": 0,
  "uptime_percentage": 100,
  "average_latency_ms": 74
}
```

---

### Why This Matters

This integration demonstrates that `prod-platform` can monitor real standalone applications, not only itself.

It adds portfolio value by showing:

- a separate Flask/PostgreSQL application being monitored
- service health checks
- uptime tracking
- latency measurement
- Redis-backed history
- cross-application observability
- Docker-based local monitoring workflow


