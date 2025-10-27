import pg from 'pg';
import 'dotenv/config';


const { Pool } = pg;
const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;


export const pool = new Pool({ connectionString });


export async function q(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}


export async function one(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}