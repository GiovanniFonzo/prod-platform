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
```


---

## Phase 7.1 — Dashboard UI Skeleton

### Goal
Add a browser-based monitoring dashboard to visualize service health data from the API.

This introduces the frontend layer of the platform.

---

### Changes implemented

1. Added dashboard static assets

Directory:

api/src/public/

Files:

index.html  
styles.css  
app.js

---

2. Enabled static file serving in Express

In `api/src/server.js`:

```javascript
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
```

This exposes the dashboard at:

http://localhost:3000

---

3. Removed legacy inline dashboard route

The previous inline HTML route:

app.get('/')

was removed. The dashboard is now served through static files.

---

4. Rebuilt containers

```bash
docker compose down
docker compose up --build
```

---

### Validation

Open:

http://localhost:3000

Expected result:

The **Prod-Platform Monitoring Dashboard** loads successfully.

The dashboard currently displays the layout only.  
Data integration will be implemented in **Phase 7.1 Day 2**.

---

### Dashboard data sources

The UI will consume these endpoints:

/services  
/analytics?service=<name>  
/history/<service>

These endpoints were implemented in **Phase 6 (Observability Platform)**.

---
