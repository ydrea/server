const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const connectDb = async () => {
  try {
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      ssl: { rejectUnauthorized: false },
      max: 6,
      connectionTimeoutMillis: 22222,
      idleTimeoutMillis: 11111,
      allowExitOnIdle: false,
    });
    await pool.connect();
    console.log(pool);
    // await pool.end();
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDb;
// connectDb();
