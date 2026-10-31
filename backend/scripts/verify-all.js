import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' SUBSCRIPTIQ — COMPREHENSIVE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  }

  // --- TEST A: DATABASE & PASSWORDS ---
  console.log('--- 1. DATABASE INTEGRATION & PASSWORD SECURITY ---');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'subscriptiq',
  });

  try {
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    assert(tableNames.includes('users'), 'Table "users" exists in MySQL');
    assert(tableNames.includes('roles'), 'Table "roles" exists in MySQL');
    assert(tableNames.includes('refresh_tokens'), 'Table "refresh_tokens" exists in MySQL');
    assert(tableNames.includes('audit_logs'), 'Table "audit_logs" exists in MySQL');

    const [users] = await pool.execute('SELECT id, name, email, password_hash, role_id FROM users');
    assert(users.length >= 3, `Found ${users.length} seeded users in database`);

    let noPlaintext = true;
    for (const u of users) {
      if (!u.password_hash.startsWith('$2b$') && !u.password_hash.startsWith('$2a$')) {
        noPlaintext = false;
      }
    }
    assert(noPlaintext, 'All user passwords stored as bcrypt hashes ($2b$ / $2a$), NO plaintext passwords');
  } catch (err) {
    console.error('Database connection test error:', err.message);
    failedCount++;
  }

  // --- TEST B: AUTHENTICATION ROLES ---
  console.log('\n--- 2. ROLE-BASED AUTHENTICATION ---');
  let adminToken = '';
  let staffToken = '';
  let customerToken = '';

  // Admin Login
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@subscriptiq.io', password: 'AdminPassword1!' }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Admin login succeeded (HTTP 200)');
    assert(data.data?.user?.role === 'ADMIN', 'Admin role correctly identified as "ADMIN"');
    adminToken = data.data?.accessToken;
    assert(Boolean(adminToken), 'Admin JWT access token returned');
  } catch (err) {
    console.error('Admin login error:', err.message);
    failedCount++;
  }

  // Staff Login
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@subscriptiq.io', password: 'StaffPassword1!' }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Staff login succeeded (HTTP 200)');
    assert(data.data?.user?.role === 'STAFF', 'Staff role correctly identified as "STAFF"');
    staffToken = data.data?.accessToken;
    assert(Boolean(staffToken), 'Staff JWT access token returned');
  } catch (err) {
    console.error('Staff login error:', err.message);
    failedCount++;
  }

  // Customer Login
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@acmecorp.com', password: 'CustomerPassword1!' }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Customer login succeeded (HTTP 200)');
    assert(data.data?.user?.role === 'CUSTOMER', 'Customer role correctly identified as "CUSTOMER"');
    customerToken = data.data?.accessToken;
    assert(Boolean(customerToken), 'Customer JWT access token returned');
  } catch (err) {
    console.error('Customer login error:', err.message);
    failedCount++;
  }

  // --- TEST C: CUSTOMER REGISTRATION ---
  console.log('\n--- 3. CUSTOMER REGISTRATION & VALIDATION ---');
  const testEmail = `newcustomer_${Date.now()}@example.com`;
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testEmail,
        password: 'TestPassword123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Public customer registration succeeded (HTTP 201)');
    assert(regData.data?.user?.role === 'CUSTOMER', 'Public registration strictly assigns "CUSTOMER" role');

    // Duplicate email check
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User Duplicate',
        email: testEmail,
        password: 'TestPassword123!',
      }),
    });
    assert(dupRes.status === 409, 'Duplicate email correctly rejected with HTTP 409 Conflict');
  } catch (err) {
    console.error('Registration test error:', err.message);
    failedCount++;
  }

  // --- TEST D: RBAC AUTHORIZATION ENFORCEMENT ---
  console.log('\n--- 4. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT ---');

  // Admin accessing Admin-only endpoint GET /api/users
  try {
    const usersRes = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    assert(usersRes.status === 200, 'Admin authorized for GET /api/users (HTTP 200)');
    assert(Array.isArray(usersData.data?.users), 'Admin received users list');
  } catch (err) {
    console.error('Admin users error:', err.message);
    failedCount++;
  }

  // Staff attempting Admin-only endpoint GET /api/users
  try {
    const staffRes = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(staffRes.status === 403, 'Staff access to Admin-only endpoint correctly rejected (HTTP 403 Forbidden)');
  } catch (err) {
    console.error('Staff users test error:', err.message);
    failedCount++;
  }

  // Customer attempting Admin-only endpoint GET /api/users
  try {
    const custRes = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(custRes.status === 403, 'Customer access to Admin-only endpoint correctly rejected (HTTP 403 Forbidden)');
  } catch (err) {
    console.error('Customer users test error:', err.message);
    failedCount++;
  }

  // Customer attempting Admin staff creation POST /api/admin/staff
  try {
    const fakeStaffRes = await fetch(`${API_BASE}/admin/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'Fake Staff', email: 'fake@staff.com' }),
    });
    assert(fakeStaffRes.status === 403, 'Customer staff invitation attempt correctly rejected (HTTP 403 Forbidden)');
  } catch (err) {
    console.error('Customer staff invite test error:', err.message);
    failedCount++;
  }

  // Session validation endpoint GET /api/auth/me
  try {
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Authenticated session validation GET /api/auth/me succeeded (HTTP 200)');
    assert(meData.data?.user?.role === 'CUSTOMER', 'Session validation returned correct role');
  } catch (err) {
    console.error('Auth me error:', err.message);
    failedCount++;
  }

  // Unauthenticated access check
  try {
    const unauthRes = await fetch(`${API_BASE}/auth/me`);
    assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with HTTP 401 Unauthorized');
  } catch (err) {
    console.error('Unauth test error:', err.message);
    failedCount++;
  }

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================\n');

  await pool.end();
  process.exit(failedCount === 0 ? 0 : 1);
}

runTests();
