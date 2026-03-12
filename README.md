# Prod-Platform

Production-oriented monitoring platform built with Node.js, Redis, and Docker.  
The system demonstrates service observability, uptime monitoring, analytics, and a browser dashboard deployed on AWS EC2 behind Nginx.

---

## Overview

Prod-Platform monitors services by periodically polling configured targets and recording:

- success / failure status
- latency
- timestamps

The system stores uptime history in Redis and exposes analytics through REST endpoints.

A browser dashboard visualizes service health and uptime metrics.

---

## Architecture

```
Browser
   ↓
Dashboard UI
   ↓
Node.js API
   ↓
Redis uptime store
   ↓
Background poller

Infrastructure

Nginx → Docker → Node API + Redis → AWS EC2
```

---

## Features

### Core API

- Status dashboard: `/`
- Health endpoint: `/health`
- Version endpoint: `/version`
- Runtime metadata: `/status`

---

### Observability

- Prometheus-style metrics endpoint: `/metrics`
- HTTP request + latency metrics
- 5xx error instrumentation
- Process exception tracking

Tracks:

- `uncaughtException`
- `unhandledRejection`

---

### Uptime Monitoring

Background poller checks configured targets and records:

- success / failure
- latency
- timestamp

Data is stored in Redis.

Endpoints:

```
/services
/history/:service
/analytics?service=<name>
```

---

### Dashboard

Browser dashboard displays:

- service list
- uptime percentage
- latency
- recent checks

Access locally:

```
http://localhost:3000
```

---

## Tech Stack

Backend

- Node.js
- Express
- Redis

Infrastructure

- Docker
- Docker Compose
- Nginx
- AWS EC2

Observability

- Prometheus-style metrics (`prom-client`)

Frontend

- HTML
- CSS
- Vanilla JavaScript

---

## Running Locally

Start the stack:

```bash
docker compose up --build
```

Open the dashboard:

```
http://localhost:3000
```

---

## API Endpoints

Health:

```
GET /health
```

Status:

```
GET /status
```

Metrics:

```
GET /metrics
```

Services:

```
GET /services
```

History:

```
GET /history/:service
```

Analytics:

```
GET /analytics?service=<name>
```

---

## Project Goals

This project demonstrates:

- building production-style APIs
- observability and metrics instrumentation
- uptime monitoring systems
- Redis-backed data persistence
- containerized deployments
- cloud hosting with reverse proxy
- operational documentation via runbooks
