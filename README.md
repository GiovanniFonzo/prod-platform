# prod-platform

Production-oriented Node.js monitoring platform demonstrating REST APIs, Prometheus-style metrics, Redis-backed uptime polling, Docker deployment, and AWS EC2 infrastructure.

---

## Features

### Core API
- Status dashboard at `/`
- Health endpoint: `/health`
- Version endpoint: `/version`
- Runtime metadata: `/status`

### Observability
- Prometheus metrics endpoint: `/metrics`
- HTTP request + latency metrics (excluding `/metrics`)
- 5xx error instrumentation
- Process exception tracking (`uncaughtException`, `unhandledRejection`)

### Uptime Monitoring (Phase 6.3)
- Polling of configured targets on an interval
- Redis-backed storage for current uptime state + last check timestamp
- Latency capture per target
- Redis runs internal-only (not exposed publicly)

---

## Local development

```bash
cd api
npm install
npm run dev
