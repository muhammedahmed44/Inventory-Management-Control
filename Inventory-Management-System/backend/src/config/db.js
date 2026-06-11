const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,          // max connections your app opens
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.connect()
  .then(client => {
    console.log('Supabase connected (pooler)');
    client.release();
  })
  .catch(err => console.error('DB error:', err.message));

module.exports = pool;