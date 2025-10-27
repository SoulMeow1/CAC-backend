import { pool } from '../src/lib/db.js';
import { execSync } from 'child_process';


beforeAll(() => {
  process.env.NODE_ENV = 'test';
  // run migrations for test DB
  execSync('node scripts/migrate.mjs', { stdio: 'inherit', env: process.env });
});


beforeEach(async () => {
  // clean tables between tests
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
});


afterAll(async () => {
  await pool.end();
});