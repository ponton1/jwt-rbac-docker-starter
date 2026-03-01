const request = require('supertest');
const app = require('../../src/app');

describe('POST /auth/register - validation', () => {
  it('should return 400 if email is missing', async () => {
    const res = await request(app).post('/auth/register').send({
      password: 'Password123!',
      role: 'user',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: `test.${Date.now()}@mail.com`,
        password: '123',
        role: 'user',
      });

    expect(res.status).toBe(400);
  });
});
