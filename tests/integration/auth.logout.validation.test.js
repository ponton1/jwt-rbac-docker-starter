const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/logout - validation', () => {
  it('should return 400 if refreshToken is missing', async () => {
    const res = await request(app).post('/auth/logout').send({});

    expect(res.status).toBe(400);
  });

  it('should return 401 if refreshToken is unknown', async () => {
    const res = await request(app).post('/auth/logout').send({
      refreshToken: 'not-a-real-token',
    });

    expect(res.status).toBe(401);
  });
});
