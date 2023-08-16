const path = require('path');
const ssl = require('ssl');
require('dotenv').config();
const pg = require('pg');

const pool = new pg.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false },
});
const trip = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT current_user');
    const uer = rows[0]['current_user'];
    console.log(user);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
};
trip();
module.exports = pool;
