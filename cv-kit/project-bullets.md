## Production Web Platform (Personal Project)

- Built a modular Node.js service exposing REST endpoints and a live status dashboard, surfacing runtime metadata (environment, version, uptime, hostname) to support production-oriented deployments.

- Containerized a Node.js service using Docker, enabling consistent and portable runtime environments across local development and deployment.

- Orchestrated local container workflows using Docker Compose, enabling repeatable multi-service environments and simplified startup for development.

- Containerized a Node.js service using Docker, defining reproducible builds with a production-ready Dockerfile and optimized build context.

- Deployed a containerized Node.js application to AWS EC2, configuring secure SSH access, firewall rules, and validating live health/status endpoints in a cloud environment.

- Implemented an Nginx reverse proxy on AWS EC2 to expose a Dockerized Node.js API over HTTP (port 80), proxying requests to a backend bound to 127.0.0.1:3000 and hardening Security Group rules to eliminate direct public access to the application port.


