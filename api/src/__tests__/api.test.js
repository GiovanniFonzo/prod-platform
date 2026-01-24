const request = require('supertest');
const app = require('../server');

describe('API health & status', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('GET /status returns runtime metadata', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body).toHaveProperty('env');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime_seconds');
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('timestamp');
  });
});

