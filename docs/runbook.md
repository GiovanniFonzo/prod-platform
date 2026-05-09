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

### Phase 7.1 Day 2 — Dashboard Data Integration

Implemented client-side dashboard data loading in `api/src/public/app.js`.

The dashboard now:

- fetches `/services`
- fetches `/analytics?service=<name>` for each service
- fetches `/history/<service>?limit=10` for the first listed service
- renders summary cards
- renders the services table
- renders recent checks

### Payload alignment

Confirmed API payloads:

- `/services` returns `services`
- `/analytics` returns `total_checks`, `successful_checks`, `failed_checks`, `uptime_percentage`, `average_latency_ms`, `latest_check_at`
- `/history/:service` returns `history` items with `ts`, `ok`, `statusCode`, `latencyMs`, `url`

### Validation

Start the stack:

```bash
docker compose down
docker compose up --build
```

Open:

http://localhost:3000

Expected result:

- stats cards show live values
- services table shows monitored services
- recent checks table shows recent uptime results

### Phase 7.2 — Dashboard Polish

Improved the dashboard UI with visual monitoring cues and auto-refresh behavior.

Changes:
- added colored status badges for OK / DOWN / UNKNOWN states
- added latency highlighting for fast / medium / slow response times
- enabled automatic dashboard refresh every 30 seconds

Validation:
- dashboard refreshes without manual reload
- status badges reflect service health state
- latency values are visually differentiated by response time

### Phase 7.3 — Service Detail View

Added a service detail section to the dashboard for the selected service.

The dashboard now displays:

- service name
- total checks
- successful checks
- failed checks
- uptime percentage
- average latency
- latest check timestamp

Validation:
- dashboard overview cards still render
- service detail section shows live analytics for the first listed service
- recent checks continue to render below the detail section

### Phase 7.4 — Latency Trend Chart

Added a latency chart to the dashboard using recent service history.

The dashboard now:
- loads recent uptime history from `/history/<service>?limit=20`
- plots latency values over time
- refreshes the chart automatically with the dashboard refresh cycle

Validation:
- latency chart renders below the service detail section
- chart points reflect recent `latencyMs` values from uptime history
- chart updates on refresh without reloading the page manually
- fixed chart rendering by disabling aspect ratio and applying explicit canvas sizing

## Phase 7.5 — Final Deployment

Deployed the full monitoring platform, including the dashboard UI, to EC2.

Steps:
- aligned the EC2 repository with `origin/main`
- rebuilt the API image manually with Docker
- restarted the Docker Compose stack
- verified local API health on `127.0.0.1:3000`
- verified public HTTPS access through Nginx
- confirmed the dashboard rendered correctly on the public domain

Validation:
- API container running on port 3000
- Redis container running
- `/health` returns 200 locally and via public HTTPS
- dashboard accessible on the public domain
- service analytics and latency chart render in production

## Deployment — Updating EC2 with Latest Code

This procedure ensures the EC2 instance runs the latest version of the application from GitHub.

---

### When to use

Run this whenever:

- new features are pushed to GitHub
- dashboard/UI changes are made
- backend logic is updated
- the running version on EC2 is outdated

---

### Step 1 — SSH into EC2

```bash
ssh ec2-user@<EC2_PUBLIC_IP>
```

---

### Step 2 — Navigate to project

```bash
cd ~/prod-platform
```

---

### Step 3 — Sync with GitHub (force clean state)

```bash
git fetch origin
git reset --hard origin/main
git clean -fd
```

This ensures:
- no merge conflicts
- no leftover local files
- EC2 matches GitHub exactly

---

### Step 4 — Rebuild Docker image (IMPORTANT)

```bash
docker build --no-cache -t prod-platform-api:local ./api
```

Why:
- ensures new code is included
- avoids stale cached layers

---

### Step 5 — Restart services

```bash
docker compose down
docker compose up -d
```

---

### Step 6 — Verify containers

```bash
docker ps
```

Expected:
- API container running
- Redis container running

---

### Step 7 — Verify API locally

```bash
curl -s http://127.0.0.1:3000/health
```

Expected:

```json
{"ok":true}
```

---

### Step 8 — Verify public endpoint

```bash
curl -I https://api.thatsnap.com/health
```

Expected:

```text
HTTP/1.1 200 OK
```

---

### Step 9 — Verify dashboard in browser

Open:

https://api.thatsnap.com

Then perform a hard refresh:

- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R

Expected:
- updated dashboard UI
- charts visible
- no old "Refresh button" page

---

### Troubleshooting

#### Issue: Old dashboard still visible

Fix:
```bash
docker build --no-cache -t prod-platform-api:local ./api
docker compose down
docker compose up -d
```

Then hard refresh browser.

---

#### Issue: 502 Bad Gateway

Cause:
- API container not running

Fix:
```bash
docker ps
docker logs prod-platform-api-1
```

Then restart:

```bash
docker compose down
docker compose up -d
```

---

#### Issue: Git pull conflicts

Fix:
```bash
git fetch origin
git reset --hard origin/main
git clean -fd
```

---

### Notes

- EC2 is a deployment environment only
- Never commit code from EC2
- GitHub is the source of truth
- Always rebuild the Docker image when deploying changes


## Monitoring External Applications: Flask Blogging App Integration

`prod-platform` can monitor external or standalone applications by polling their health-check endpoints.

As part of the portfolio integration milestone, the completed Flask Blogging App was connected to `prod-platform` as a monitored service.

## Monitoring External Applications: Flask Blogging App Integration

`prod-platform` can monitor external or standalone applications by polling their health-check endpoints.

As part of this integration milestone, the completed Flask Blogging App was connected to `prod-platform` as a monitored service.

This proves that `prod-platform` can monitor a real application, not only itself.

---

### Monitored Application

| Item | Value |
|---|---|
| Service name | `flask-blogging-app` |
| Application stack | Flask, SQLAlchemy, PostgreSQL, Tkinter frontend |
| Flask health endpoint | `/health` |
| Local host URL | `http://127.0.0.1:5050/health` |
| Docker container URL | `http://host.docker.internal:5050/health` |
| Monitoring platform | `prod-platform` |
| Monitoring storage | Redis |
| Polling interval | 30 seconds |

---

### Flask Health Endpoint

The Flask Blogging App exposes a health-check endpoint.

Run this from the host machine:

```bash
curl http://127.0.0.1:5050/health
```

Expected response:

```json
{
  "database": "postgresql",
  "service": "flask-blogging-app",
  "status": "ok"
}
```

---

### prod-platform Service Configuration

The monitored services are configured in:

```text
api/src/services.js
```

Current service configuration:

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

---

### Docker Compose Environment Variables

The local Docker configuration is defined in:

```text
docker-compose.yml
```

Environment block:

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

### Local Run Order

Start the Flask Blogging App first.

```bash
cd ~/Projects/blogging-app
source venv/bin/activate
python backend.py
```

Confirm that Flask is running on port `5050`:

```bash
curl http://127.0.0.1:5050/health
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

This confirms that both services are detected:

```text
prod-platform
flask-blogging-app
```

---

### Validation Commands

Check the configured services:

```bash
curl http://localhost:3000/services
```

Check Flask Blogging App history:

```bash
curl "http://localhost:3000/history/flask-blogging-app?limit=5"
```

Example successful history response:

```json
{
  "service": "flask-blogging-app",
  "count": 2,
  "history": [
    {
      "ts": "2026-05-09T15:48:08.951Z",
      "ok": true,
      "statusCode": 200,
      "latencyMs": 34,
      "url": "http://host.docker.internal:5050/health"
    }
  ]
}
```

Check Flask Blogging App analytics:

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
  "average_latency_ms": 74,
  "latest_check_at": "2026-05-09T15:48:38.977Z"
}
```

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `Poller started: 1 service(s)` | `api/src/services.js` only contains one service | Add `flask-blogging-app` to the `SERVICES` array |
| Docker Compose YAML error | Incorrect indentation or mixed environment syntax | Use key/value format under `environment:` |
| Flask service shows failed checks | Flask app is not running | Start Flask with `python backend.py` |
| Container cannot reach Flask | Wrong URL used from Docker | Use `http://host.docker.internal:5050/health` |
| Local curl works but Docker check fails | Docker-to-host networking issue | Confirm `FLASK_BLOGGING_APP_URL` is set correctly |

---

### Purpose of This Integration

This integration demonstrates that `prod-platform` can monitor real standalone applications through health-check endpoints.

It shows:

- cross-application observability
- health-check based monitoring
- uptime history
- response latency tracking
- Redis-backed analytics
- Docker-to-host service monitoring
- portfolio-level integration between separate projects

The Flask Blogging App remains a separate application, while `prod-platform` acts as the monitoring and observability layer.


