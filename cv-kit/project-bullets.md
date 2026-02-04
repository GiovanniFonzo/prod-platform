## Production Web Platform (Personal Project)

- Built a modular Node.js service exposing REST endpoints and a live status dashboard, surfacing runtime metadata (environment, version, uptime, hostname) to support production-oriented deployments.

- Containerized the Node.js service using Docker, defining reproducible builds with a production-ready Dockerfile and optimized build context.

- Orchestrated local container workflows using Docker Compose to enable repeatable startup, configuration, and testing of the service in a containerized environment.

- Deployed the containerized Node.js application to AWS EC2, configuring secure SSH access, firewall rules, and validating live health and status endpoints in a cloud environment.

- Implemented an Nginx reverse proxy on AWS EC2 to expose the service over HTTP (port 80), proxying requests to a Dockerized backend bound to 127.0.0.1:3000 and hardening Security Group rules to eliminate direct public access to the application port.


