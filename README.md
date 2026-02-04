# prod-platform

Production-oriented Node.js platform demonstrating REST APIs, automated testing, and CI pipelines.

## Features
- Status dashboard at `/`
- Health endpoint: `/health`
- Version endpoint: `/version`
- Runtime metadata: `/status`

## Local development
```bash
cd api
npm install
npm run dev

Deployed on AWS EC2 using Docker, with an Nginx reverse proxy serving traffic on port 80

