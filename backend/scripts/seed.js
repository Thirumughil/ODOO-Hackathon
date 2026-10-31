import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const SALT_ROUNDS = 12;

async function seedUsers() {
  console.log('Seeding initial verified test accounts...');

  const adminPass = await bcrypt.hash('AdminPassword1!', SALT_ROUNDS);
  const staffPass = await bcrypt.hash('StaffPassword1!', SALT_ROUNDS);

  // Seed Admin
  await pool.execute(`
    INSERT INTO users (name, email, password_hash, role_id, status, email_verified)
    VALUES ('System Administrator', 'admin@subscriptiq.io', ?, 1, 'ACTIVE', TRUE)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'ACTIVE'
  `, [adminPass]);

  // Seed Staff
  await pool.execute(`
    INSERT INTO users (name, email, password_hash, role_id, status, email_verified)
    VALUES ('Staff Operations', 'staff@subscriptiq.io', ?, 2, 'ACTIVE', TRUE)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'ACTIVE'
  `, [staffPass]);

  const [users] = await pool.query(`
    SELECT u.id, u.name, u.email, r.role_name AS role, u.status, u.created_at
    FROM users u JOIN roles r ON r.id = u.role_id
  `);

  console.log('Current database users in subscriptiq:', users);
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
