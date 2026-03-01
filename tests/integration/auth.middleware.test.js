const request = require('supertest');
const app = require('../../src/app');

describe('Auth middleware - requireAuth', () => {
  it('should allow access with valid token', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const accessToken = registerRes.body.data.tokens.accessToken;

    const res = await request(app).get('/users').set('Authorization', `Bearer ${accessToken}`);

    expect([200, 403]).toContain(res.status);
  });

  it('should block access without token', async () => {
    const res = await request(app).get('/users');

    expect(res.status).toBe(401);
  });
});
