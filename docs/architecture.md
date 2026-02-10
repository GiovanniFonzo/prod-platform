# Prod-Platform Architecture

## Overview
Prod-Platform is a containerized Node.js API deployed on a single cloud VM (AWS EC2).  
The API runs in Docker and is intentionally bound to **localhost** so it is **not directly exposed** to the public internet.

All inbound traffic is handled by **Nginx** (reverse proxy) on ports **80/443**, which forwards requests to the app at `127.0.0.1:3000`.

---

## High-level diagram

```text
Internet
  |
  |  HTTP (80) / HTTPS (443)
  v
Nginx (Reverse Proxy)
  |
  |  proxy_pass -> http://127.0.0.1:3000
  v
Docker Container (Node.js API)

