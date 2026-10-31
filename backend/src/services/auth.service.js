import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { generateResetToken, hashResetToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from './email.service.js';

const SALT_ROUNDS = 12;

export const registerCustomer = async ({ name, email, password }) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [roleRows] = await pool.query(
        "SELECT id FROM roles WHERE role_name = 'CUSTOMER' LIMIT 1"
    );
    if (!roleRows.length) throw Object.assign(new Error('Customer role is not configured'), { statusCode: 500 });

    try {
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash, role_id, status, email_verified)
             VALUES (?, ?, ?, ?, 'ACTIVE', FALSE)`,
            [name, email, passwordHash, roleRows[0].id]
        );
        return { id: result.insertId, name, email, role: 'CUSTOMER', status: 'ACTIVE' };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
        }
        throw error;
    }
};

export const login = async ({ email, password }) => {
    const [rows] = await pool.execute(`
        SELECT u.id, u.name, u.email, u.password_hash, u.status, u.email_verified, r.role_name AS role
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.email = ? LIMIT 1
    `, [email]);

    if (!rows.length) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    const user = rows[0];
    if (user.status !== 'ACTIVE') throw Object.assign(new Error('Account is inactive or blocked'), { statusCode: 403 });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

    const accessToken = jwt.sign(
        { sub: String(user.id), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, emailVerified: Boolean(user.email_verified) }
    };
};

export const getCurrentUser = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT u.id, u.name, u.email, u.status, u.email_verified, r.role_name AS role
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.id = ? LIMIT 1
    `, [userId]);
    if (!rows.length) return null;
    const user = rows[0];
    return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, emailVerified: Boolean(user.email_verified) };
};

export const requestPasswordReset = async (email) => {
    const [rows] = await pool.execute('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) return;

    const token = generateResetToken();
    const tokenHash = hashResetToken(token);
    const ttlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 30);

    await pool.execute(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE), CURRENT_TIMESTAMP)`,
        [rows[0].id, tokenHash, ttlMinutes]
    );

    try {
        await sendPasswordResetEmail(rows[0].email, token);
    } catch (error) {
        // Do not disclose service availability or account existence to API callers.
    }
};

export const resetPassword = async (token, newPassword) => {
    const tokenHash = hashResetToken(token);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`
            SELECT id, user_id, expires_at, used_at
            FROM password_reset_tokens
            WHERE token_hash = ? LIMIT 1
            FOR UPDATE
        `, [tokenHash]);

        if (!rows.length || rows[0].used_at !== null || new Date(rows[0].expires_at) <= new Date()) {
            throw Object.assign(new Error('Reset token is invalid or has expired'), { statusCode: 400 });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, rows[0].user_id]);
        await connection.execute('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
