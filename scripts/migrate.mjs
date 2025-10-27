import fs from 'fs';
import path from 'path';
import url from 'url';
import 'dotenv/config';
import pg from 'pg';


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const client = new pg.Client({ connectionString: process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL });


async function run() {
  const dir = path.join(__dirname, '..', 'sql', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  await client.connect();
  try {
    for (const f of files) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      console.log('Applying', f);
      await client.query(sql);
  }
  console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}
run().catch(e => { console.error(e); process.exit(1); });