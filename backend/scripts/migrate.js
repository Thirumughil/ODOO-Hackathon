import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationFile = path.resolve(__dirname, '../../database/07_auth_security_migration.sql');

async function applyMigrations() {
  const sql = fs.readFileSync(migrationFile, 'utf-8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));

  for (const stmt of statements) {
    console.log('Executing migration statement...');
    await pool.query(stmt);
  }

  const [tables] = await pool.query('SHOW TABLES');
  console.log('Tables currently in subscriptiq:', tables.map(t => Object.values(t)[0]));
  process.exit(0);
}

applyMigrations().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
