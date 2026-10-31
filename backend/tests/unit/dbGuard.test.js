import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDatabaseName } from '../../src/config/db.js';
import { assertTestDatabase } from '../helpers/dbGuard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '../..');

describe('Database Safety Guard Unit Tests (No DB Connection)', () => {
    describe('validateDatabaseName function', () => {
        it('1. Test mode rejects DB_NAME=subscriptiq', () => {
            assert.throws(
                () => validateDatabaseName('test', 'subscriptiq'),
                /Refusing to connect: in test mode \(NODE_ENV=test\), DB_NAME must be a non-empty string ending with '_test'/
            );
        });

        it('2. Test mode rejects missing or empty DB_NAME', () => {
            assert.throws(
                () => validateDatabaseName('test', ''),
                /Refusing to connect: in test mode \(NODE_ENV=test\), DB_NAME must be a non-empty string ending with '_test'/
            );
            assert.throws(
                () => validateDatabaseName('test', undefined),
                /Refusing to connect: in test mode \(NODE_ENV=test\), DB_NAME must be a non-empty string ending with '_test'/
            );
        });

        it('3. Test mode accepts DB_NAME=subscriptiq_test', () => {
            assert.doesNotThrow(() => validateDatabaseName('test', 'subscriptiq_test'));
            assert.doesNotThrow(() => validateDatabaseName('test', 'my_custom_app_test'));
        });

        it('4. Normal development mode does not activate the test-only guard', () => {
            assert.doesNotThrow(() => validateDatabaseName('development', 'subscriptiq'));
            assert.doesNotThrow(() => validateDatabaseName('production', 'subscriptiq_prod'));
        });
    });

    describe('assertTestDatabase helper function', () => {
        it('1. Test mode rejects DB_NAME=subscriptiq', () => {
            assert.throws(
                () => assertTestDatabase('test', 'subscriptiq'),
                /Strict DB Guard Violation/
            );
        });

        it('2. Test mode rejects missing or empty DB_NAME', () => {
            assert.throws(
                () => assertTestDatabase('test', ''),
                /Strict DB Guard Violation/
            );
            assert.throws(
                () => assertTestDatabase('test', undefined),
                /Strict DB Guard Violation/
            );
        });

        it('3. Test mode accepts DB_NAME=subscriptiq_test', () => {
            assert.doesNotThrow(() => assertTestDatabase('test', 'subscriptiq_test'));
        });

        it('4. Normal development mode does not activate the test-only guard', () => {
            assert.doesNotThrow(() => assertTestDatabase('development', 'subscriptiq'));
            assert.doesNotThrow(() => assertTestDatabase('production', 'subscriptiq_prod'));
        });
    });

    describe('db.js module initialization guard in isolated subprocesses', () => {
        it('blocks db.js import when NODE_ENV=test and DB_NAME=subscriptiq', () => {
            const proc = spawnSync(
                process.execPath,
                ['-e', "process.env.NODE_ENV = 'test'; process.env.DB_NAME = 'subscriptiq'; import('./src/config/db.js');"],
                { cwd: backendDir, encoding: 'utf8' }
            );
            assert.notEqual(proc.status, 0);
            assert.match(proc.stderr, /Refusing to connect: in test mode/);
        });

        it('blocks db.js import when NODE_ENV=test and DB_NAME is missing', () => {
            const proc = spawnSync(
                process.execPath,
                ['-e', "process.env.NODE_ENV = 'test'; delete process.env.DB_NAME; import('./src/config/db.js');"],
                { cwd: backendDir, encoding: 'utf8' }
            );
            assert.notEqual(proc.status, 0);
            assert.match(proc.stderr, /Refusing to connect: in test mode/);
        });

        it('allows db.js import when NODE_ENV=development and DB_NAME=subscriptiq', () => {
            const proc = spawnSync(
                process.execPath,
                ['-e', "process.env.NODE_ENV = 'development'; process.env.DB_NAME = 'subscriptiq'; import('./src/config/db.js').then(() => console.log('DEV_OK'));"],
                { cwd: backendDir, encoding: 'utf8' }
            );
            assert.equal(proc.status, 0);
            assert.match(proc.stdout, /DEV_OK/);
        });
    });
});
