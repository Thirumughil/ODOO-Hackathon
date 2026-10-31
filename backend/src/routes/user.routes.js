import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { pool } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate);

router.get('/me', (req, res) => {
    successResponse(res, 200, 'User profile', { user: req.user });
});

router.get('/', authorizeRoles('ADMIN'), async (req, res, next) => {
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

router.get('/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
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

export default router;
