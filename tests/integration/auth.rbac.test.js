const request = require('supertest');
const app = require('../../src/app');

describe('RBAC - requireRole', () => {
  it('should block user role from accessing admin route', async () => {
    const email = `user.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'user',
    });

    const accessToken = registerRes.body.data.tokens.accessToken;

    const res = await request(app)
      .get('/users/admin-only')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin role to access admin route', async () => {
    const email = `admin.${Date.now()}@mail.com`;
    const password = 'Password123!';

    const registerRes = await request(app).post('/auth/register').send({
      email,
      password,
      role: 'admin',
    });

    const accessToken = registerRes.body.data.tokens.accessToken;

    const res = await request(app)
      .get('/users/admin-only')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });
});
