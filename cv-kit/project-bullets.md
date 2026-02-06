## Production Web Platform (Personal Project)

- Built a modular Node.js service exposing REST endpoints and a live status dashboard, surfacing runtime metadata (environment, version, uptime, hostname) to support production-oriented deployments.

- Containerized the Node.js service using Docker, defining reproducible builds with a production-ready Dockerfile and optimized build context.

- Orchestrated local container workflows using Docker Compose to enable repeatable startup, configuration, and testing of the service in a containerized environment.

- Deployed the containerized Node.js application to AWS EC2, configuring secure SSH access, firewall rules, and validating live health and status endpoints in a cloud environment.

- Implemented an Nginx reverse proxy on AWS EC2 to expose the service over HTTP (port 80), proxying requests to a Dockerized backend bound to 127.0.0.1:3000 and hardening Security Group rules to eliminate direct public access to the application port.

### Phase 5: Domain, HTTPS, and Production Hardening

- Provisioned a custom API subdomain and DNS records, associating the service with a stable AWS Elastic IP to ensure consistent addressing across instance restarts.

- Enabled HTTPS for the production API using Let’s Encrypt (Certbot), configuring automated certificate issuance, renewal, and enforcing HTTP→HTTPS redirection at the Nginx layer.

- Extended the Nginx reverse proxy configuration to terminate TLS on port 443 while securely proxying requests to a localhost-bound Dockerized backend, maintaining network isolation and least-exposure principles.

- Improved production reliability by adding Docker Compose restart policies (`unless-stopped`) to ensure automatic service recovery following host reboots or container failures.

