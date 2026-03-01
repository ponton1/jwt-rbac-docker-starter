const request = require('supertest');
const app = require('../../src/app');

describe('Auth validation - login & refresh', () => {
  it('should return 400 if login email is missing', async () => {
    const res = await request(app).post('/auth/login').send({
      password: 'Password123!',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 if login password is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: `test.${Date.now()}@mail.com`,
      });

    expect(res.status).toBe(400);
  });

  it('should return 401 if refresh token is missing', async () => {
    const res = await request(app).post('/auth/refresh').send({});

    expect(res.status).toBe(401);
  });

  it('should return 401 if refresh token is invalid', async () => {
    const res = await request(app).post('/auth/refresh').send({
      refreshToken: 'not-a-real-token',
    });

    expect(res.status).toBe(401);
  });
});
