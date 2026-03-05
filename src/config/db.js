// src/config/db.js
const { Pool } = require('pg');

const _isProduction = process.env.NODE_ENV === 'production';

let pool;

if (process.env.DATABASE_URL) {
  // 🔵 Modo Cloud (Neon / Render)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // 🟢 Modo Local (Docker / localhost)
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'jwt_rbac_db',
    user: process.env.DB_USER || 'luisponton',
    password: process.env.DB_PASSWORD || '',
  });
}

async function query(text, params) {
  return pool.query(text, params);
}

async function ping() {
  const result = await pool.query('SELECT NOW()');
  return result.rows[0];
}

module.exports = {
  pool,
  query,
  ping,
};
