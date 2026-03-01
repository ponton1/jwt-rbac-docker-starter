const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

describe('POST /auth/register', () => {
  it('should register a new user and persist it in DB', async () => {
    const uniqueEmail = `test.${Date.now()}@mail.com`;
    // 1) Hacemos la request de registro
    const res = await request(app).post('/auth/register').send({
      email: uniqueEmail,
      password: 'Password123!',
      role: 'user',
    });

    // 2) Validamos respuesta HTTP

    expect([200, 201]).toContain(res.status);

    // 3) Validamos que el usuario quedó en la BD
    const userInDb = await db.query(
      'SELECT id, email, role, token_version FROM users WHERE email = $1',
      [uniqueEmail]
    );

    expect(userInDb.rows.length).toBe(1);

    expect(userInDb.rows[0].email).toBe(uniqueEmail);

    expect(userInDb.rows[0].role).toBe('user');

    expect(userInDb.rows[0].token_version).toBeDefined();
  });
});
