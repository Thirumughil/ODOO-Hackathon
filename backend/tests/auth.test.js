import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { assertTestDatabase } from './helpers/dbGuard.js';
import { startTestServer, stopTestServer, request } from './helpers/testServer.js';
import { pool, validateDatabaseName } from '../src/config/db.js';

describe('SubscriptIQ Security & Authentication Test Suite', () => {
    before(async () => {
        assertTestDatabase();
        await startTestServer();
    });

    after(async () => {
        await stopTestServer();
        try {
            await pool.end();
        } catch {}
    });

    describe('Database Guard', () => {
        it('refuses execution if DB_NAME does not end with _test in test mode', () => {
            assert.throws(() => validateDatabaseName('test', 'subscriptiq'), /Refusing to connect/);
            assert.throws(() => validateDatabaseName('test', ''), /Refusing to connect/);
            assert.throws(() => validateDatabaseName('test', undefined), /Refusing to connect/);
            assert.doesNotThrow(() => validateDatabaseName('test', 'subscriptiq_test'));
            assert.doesNotThrow(() => validateDatabaseName('development', 'subscriptiq'));

            assert.throws(() => assertTestDatabase('test', 'subscriptiq'), /Strict DB Guard Violation/);
            assert.throws(() => assertTestDatabase('test', ''), /Strict DB Guard Violation/);
            assert.throws(() => assertTestDatabase('test', undefined), /Strict DB Guard Violation/);
            assert.doesNotThrow(() => assertTestDatabase('test', 'subscriptiq_test'));
            assert.doesNotThrow(() => assertTestDatabase('development', 'subscriptiq'));
        });
    });

    describe('Health Endpoint', () => {
        it('GET /api/health returns 200 and running status', async () => {
            const res = await request('/api/health');
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.message, 'SubscriptIQ backend is running');
        });
    });

    describe('Authentication Protection', () => {
        it('GET /api/auth/me rejects request when access token is missing', async () => {
            const res = await request('/api/auth/me');
            assert.equal(res.status, 401);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Authentication required');
        });

        it('POST /api/auth/refresh rejects request when refresh cookie is missing', async () => {
            const res = await request('/api/auth/refresh', { method: 'POST' });
            assert.equal(res.status, 401);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Refresh token is required');
        });
    });

    describe('Registration Security', () => {
        it('POST /api/auth/register rejects weak passwords', async () => {
            const res = await request('/api/auth/register', {
                method: 'POST',
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'weak'
                }
            });
            assert.equal(res.status, 400);
            assert.equal(res.body.success, false);
        });

        it('POST /api/auth/register prevents registering as ADMIN or STAFF', async () => {
            const resAdmin = await request('/api/auth/register', {
                method: 'POST',
                body: {
                    name: 'Evil Admin',
                    email: 'admin_attempt@example.com',
                    password: 'SecurePassword123!',
                    role: 'ADMIN'
                }
            });
            assert.equal(resAdmin.status, 400);
            assert.equal(resAdmin.body.success, false);

            const resStaff = await request('/api/auth/register', {
                method: 'POST',
                body: {
                    name: 'Evil Staff',
                    email: 'staff_attempt@example.com',
                    password: 'SecurePassword123!',
                    role: 'STAFF'
                }
            });
            assert.equal(resStaff.status, 400);
            assert.equal(resStaff.body.success, false);
        });
    });

    describe('Login Security (Isolated DB Integration)', () => {
        it('POST /api/auth/login rejects invalid credentials', async () => {
            const res = await request('/api/auth/login', {
                method: 'POST',
                body: {
                    email: 'nobody@example.com',
                    password: 'ValidPassword123!'
                }
            });
            assert.equal(res.status, 401);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Invalid credentials');
        });
    });
});
