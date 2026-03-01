const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/logout', () => {
  it('should revoke refresh token and block future refresh', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const refreshToken = registerRes.body.data.tokens.refreshToken;
    expect(refreshToken).toBeDefined();

    const logoutRes = await request(app).post('/auth/logout').send({
      refreshToken,
    });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const refreshRes = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(refreshRes.status).toBe(401);
  });
});
