const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/refresh', () => {
  it('should rotate refresh token and invalidate the old one', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const oldRefreshToken = registerRes.body.data.tokens.refreshToken;
    expect(oldRefreshToken).toBeDefined();

    const refreshRes = await request(app).post('/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
    expect(refreshRes.body.data.tokens.refreshToken).toBeDefined();

    const newRefreshToken = refreshRes.body.data.tokens.refreshToken;
    expect(newRefreshToken).not.toBe(oldRefreshToken);

    const replayRes = await request(app).post('/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(replayRes.status).toBe(401);
  });
});
