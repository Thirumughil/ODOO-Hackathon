USE subscriptiq;

-- Check all tables
SHOW TABLES;

-- Check default roles
SELECT * FROM roles;

-- Check users table structure
DESCRIBE users;

-- Check password reset table
DESCRIBE password_reset_tokens;

-- Check audit log structure
DESCRIBE audit_logs;