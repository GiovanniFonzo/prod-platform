# Prod-Platform Runbook (Operations)

This runbook documents how to operate Prod-Platform in production on a single VM:
- Docker Compose runs the Node.js API container(s)
- Nginx reverse-proxies public traffic to the app on localhost
- Optional TLS via Let’s Encrypt (Certbot)

> Public-safe note: This document intentionally avoids real IPs, key paths, usernames, and private hostnames.

---

## Prerequisites
- You can SSH into the server (credentials handled separately)
- Docker + Docker Compose installed
- Nginx installed and running
- Repository cloned on the server at `~/prod-platform`

---

## Where things live (Amazon Linux)
- Repo: `~/prod-platform`
- Nginx main config: `/etc/nginx/nginx.conf`
- Nginx site configs: `/etc/nginx/conf.d/*.conf`
- Example proxy file: `/etc/nginx/conf.d/prod-platform.conf`

---

## Standard start procedure (happy path)

### 1) Connect to the server
SSH in using your normal method.

### 2) Go to the repo
```bash
cd ~/prod-platform

---

---

## Phase 6.2 — Error Rate Tracking (Prometheus)

### Objective
Track reliability signals via Prometheus metrics:
- HTTP 5xx responses
- Process-level exceptions (uncaughtException, unhandledRejection)

### Changes
- `api/src/metrics.js`
  - Added `http_errors_total{method,route,status}` (increments on status >= 500)
  - Added `process_exceptions_total{type}` (uncaughtException | unhandledRejection)
  - Exported `recordUncaughtException()` and `recordUnhandledRejection()`
- `api/src/server.js`
  - Wired Node process listeners to record metrics

### Validate (Local)
If running locally:
```bash
cd api
npm install
npm run dev
curl -s http://127.0.0.1:3000/health
curl -s http://127.0.0.1:3000/metrics | grep -n "http_errors_total" | head
curl -s http://127.0.0.1:3000/metrics | grep -n "process_exceptions_total" | head

---

## Phase 6.3 — Redis Uptime History + Polling

### Objective
Add uptime history storage and background health polling so prod-platform can monitor services over time.

### Local Setup
Start Redis (localhost-only):
```bash
docker run -d --name prod-platform-redis -p 127.0.0.1:6379:6379 redis:7-alpine
docker exec -it prod-platform-redis redis-cli ping

## Verify uptime analytics locally

Ensure the stack is running:

```bash
docker compose up --build
