const path = require('path');
const ssl = require('ssl');
require('dotenv')
  .config
  //   {
  //   override: true,
  //   path: path.join(__dirname, 'g.env'),
  // }
  ();
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
    const uSer = rows[0]['current_user'];
    console.log(uSer);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
};
trip();
module.exports = pool;
// {
//   query: (text, params) => pool.query(text, params),
// };

// const path = require('path');
// require('dotenv').config({
//   override: true,
//   path: path.join(__dirname, 'g.env'),
// });
// const pg = require('pg');

// const pool = new pg.Pool({
// user: 'banija_www',
// host: 'landscape.agr.hr',
// database: 'banija',
// password: '1akauntzabanijawwwpotrebe2',
// port: 5434,
// requiressl: true, // { rejectUnauthorized: false },
//   //
//   connectionTimeoutMillis: 22222,
//   idleTimeoutMillis: 11111,
//   allowExitOnIdle: false,
//   //
// });
// // const connectDb =
// async () => {
//   const client = await pool.connect();
//   try {
//     const { rows } = await client.query('SELECT current_user');
//     const uSer = rows[0]['current_user'];
//     console.log(uSer);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     client.release();
//   }
// };
// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };
