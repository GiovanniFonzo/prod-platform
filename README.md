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
