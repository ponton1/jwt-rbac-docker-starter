const request = require('supertest');
const app = require('../../src/app');

describe('Auth middleware - invalid token', () => {
  it('should return 401 for malformed Authorization header', async () => {
    const res = await request(app).get('/users').set('Authorization', 'BadToken');

    expect(res.status).toBe(401);
  });

  it('should return 401 for invalid jwt token', async () => {
    const res = await request(app).get('/users').set('Authorization', 'Bearer not-a-jwt');

    expect(res.status).toBe(401);
  });
});
