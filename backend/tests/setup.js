import 'dotenv/config';
import { assertTestDatabase } from './helpers/dbGuard.js';

// Enforce test environment settings
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_DISABLED = 'true';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'subscriptiq_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only_1234567890';

// Immediately check test database guard
assertTestDatabase();
