const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/logout-all', () => {
  it('should revoke all sessions and invalidate old access token', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const accessToken = registerRes.body.data.tokens.accessToken;
    const refreshToken = registerRes.body.data.tokens.refreshToken;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const logoutAllRes = await request(app)
      .post('/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.success).toBe(true);

    const refreshRes = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(refreshRes.status).toBe(401);
  });
});
