const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/login', () => {
  it('should login and return tokens', async () => {
    const email = `test.${Date.now()}@mail.com`;
    const password = 'Password123!';

    await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const res = await request(app).post('/auth/login').send({
      email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'nope@mail.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
  });
});
