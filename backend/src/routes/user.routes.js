import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createStaffSchema, validate } from '../validators/auth.validator.js';
import { pool } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/me', (req, res) => {
    successResponse(res, 200, 'User profile', { user: req.user });
});

router.get('/', authorizeRoles('ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.status, u.email_verified, r.role_name AS role, u.created_at
            FROM users u JOIN roles r ON r.id = u.role_id
            ORDER BY u.id
        `);
        successResponse(res, 200, 'Users retrieved', { users: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authorizeRoles('ADMIN', 'STAFF'), async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.id, u.name, u.email, u.status, u.email_verified, r.role_name AS role, u.created_at
            FROM users u JOIN roles r ON r.id = u.role_id
            WHERE u.id = ? LIMIT 1
        `, [req.params.id]);
        if (!rows.length) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }
        successResponse(res, 200, 'User retrieved', { user: rows[0] });
    } catch (error) {
        next(error);
    }
});

router.post('/staff', authorizeRoles('ADMIN'), validate(createStaffSchema), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const [staffRoles] = await pool.execute("SELECT id FROM roles WHERE role_name = 'STAFF' LIMIT 1");
        if (!staffRoles.length) {
            const error = new Error('Staff role is not configured');
            error.statusCode = 500;
            return next(error);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash, role_id, status, email_verified)
             VALUES (?, ?, ?, ?, 'ACTIVE', FALSE)`,
            [name, email.toLowerCase(), passwordHash, staffRoles[0].id]
        );
        successResponse(res, 201, 'Staff account created', {
            user: { id: result.insertId, name, email: email.toLowerCase(), role: 'STAFF', status: 'ACTIVE' }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') error.statusCode = 409;
        if (error.statusCode === 409) error.message = 'Email is already registered';
        next(error);
    }
});

export default router;
