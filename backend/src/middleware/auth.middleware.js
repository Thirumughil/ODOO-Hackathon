import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
    }

    try {
        const token = authorization.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.status, u.email_verified, r.role_name AS role
            FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.id = ?
            LIMIT 1
        `, [payload.sub]);

        if (!rows.length || rows[0].status !== 'ACTIVE') {
            const error = new Error('Account is inactive or unavailable');
            error.statusCode = 401;
            return next(error);
        }
        req.user = rows[0];
        next();
    } catch (error) {
        error.statusCode = 401;
        error.message = 'Invalid or expired token';
        next(error);
    }
};
