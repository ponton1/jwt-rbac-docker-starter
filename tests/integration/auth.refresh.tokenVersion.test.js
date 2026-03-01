const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/refresh - tokenVersion mismatch', () => {
  it('should return 401 if tokenVersion changed (logout-all)', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const accessToken = registerRes.body.data.tokens.accessToken;
    const refreshToken = registerRes.body.data.tokens.refreshToken;

    const logoutAllRes = await request(app)
      .post('/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutAllRes.status).toBe(200);

    const refreshRes = await request(app).post('/auth/refresh').send({
      refreshToken,
    });

    expect(refreshRes.status).toBe(401);
  });
});
