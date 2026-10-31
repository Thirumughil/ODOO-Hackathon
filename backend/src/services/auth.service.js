import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { generateResetToken, hashResetToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail, sendStaffInvitationEmail } from './email.service.js';
import { writeAuditLog } from './audit.service.js';

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
        await writeAuditLog({ userId: result.insertId, action: 'CUSTOMER_REGISTERED', entityType: 'USER', entityId: result.insertId }).catch(() => {});
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
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = generateResetToken();
    const refreshTokenHash = hashResetToken(refreshToken);
    const refreshDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
    await pool.execute(`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY))
    `, [user.id, refreshTokenHash, refreshDays]);

    await writeAuditLog({ userId: user.id, action: 'LOGIN_SUCCESS', entityType: 'USER', entityId: user.id }).catch(() => {});
    return {
        accessToken,
        refreshToken,
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

export const createStaffInvitation = async ({ name, email }, invitedByUserId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [roleRows] = await connection.execute("SELECT id FROM roles WHERE role_name = 'STAFF' LIMIT 1");
        if (!roleRows.length) throw Object.assign(new Error('Staff role is not configured'), { statusCode: 500 });

        const placeholderHash = await bcrypt.hash(generateResetToken(), SALT_ROUNDS);
        let userId;
        try {
            const [result] = await connection.execute(`
                INSERT INTO users (name, email, password_hash, role_id, status, email_verified)
                VALUES (?, ?, ?, ?, 'INACTIVE', FALSE)
            `, [name, email, placeholderHash, roleRows[0].id]);
            userId = result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
            throw error;
        }

        const token = generateResetToken();
        const tokenHash = hashResetToken(token);
        const ttlMinutes = Number(process.env.STAFF_INVITATION_TTL_MINUTES || 60);
        await connection.execute(`
            INSERT INTO staff_invitation_tokens (user_id, token_hash, expires_at)
            VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE))
        `, [userId, tokenHash, ttlMinutes]);
        await connection.execute(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
            VALUES (?, 'CREATE_STAFF_INVITATION', 'USER', ?)
        `, [invitedByUserId, userId]);
        await connection.commit();

        try { await sendStaffInvitationEmail(email, token); } catch (error) { /* Email delivery is reported separately through configuration */ }
        return { id: userId, name, email, role: 'STAFF', status: 'INACTIVE' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const activateStaff = async (token, password) => {
    const tokenHash = hashResetToken(token);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`
            SELECT s.id, s.user_id, s.expires_at, s.used_at
            FROM staff_invitation_tokens s
            WHERE s.token_hash = ? LIMIT 1 FOR UPDATE
        `, [tokenHash]);
        if (!rows.length || rows[0].used_at !== null || new Date(rows[0].expires_at) <= new Date()) {
            throw Object.assign(new Error('Invitation token is invalid or has expired'), { statusCode: 400 });
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await connection.execute('UPDATE users SET password_hash = ?, status = ?, email_verified = TRUE WHERE id = ?', [passwordHash, 'ACTIVE', rows[0].user_id]);
        await connection.execute('UPDATE staff_invitation_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
        await connection.execute(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'ACTIVATE_STAFF', 'USER', ?)`, [rows[0].user_id, rows[0].user_id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) throw Object.assign(new Error('Refresh token is required'), { statusCode: 401 });
    const tokenHash = hashResetToken(refreshToken);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`
            SELECT r.id, r.user_id, r.expires_at, r.revoked_at, u.status
            FROM refresh_tokens r JOIN users u ON u.id = r.user_id
            WHERE r.token_hash = ? LIMIT 1 FOR UPDATE
        `, [tokenHash]);
        if (!rows.length || rows[0].revoked_at !== null || rows[0].status !== 'ACTIVE' || new Date(rows[0].expires_at) <= new Date()) {
            throw Object.assign(new Error('Refresh token is invalid or expired'), { statusCode: 401 });
        }

        const [userRows] = await connection.execute(`
            SELECT u.id, u.name, u.email, u.status, u.email_verified, r.role_name AS role
            FROM users u JOIN roles r ON r.id = u.role_id
            WHERE u.id = ? LIMIT 1
        `, [rows[0].user_id]);
        if (!userRows.length) throw Object.assign(new Error('Refresh token is invalid'), { statusCode: 401 });

        const newRefreshToken = generateResetToken();
        const newRefreshTokenHash = hashResetToken(newRefreshToken);
        const refreshDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
        await connection.execute(`
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY))
        `, [userRows[0].id, newRefreshTokenHash, refreshDays]);
        await connection.execute(`
            UPDATE refresh_tokens
            SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = ?
            WHERE id = ? AND revoked_at IS NULL
        `, [newRefreshTokenHash, rows[0].id]);
        await connection.commit();

        const accessToken = jwt.sign(
            { sub: String(userRows[0].id), role: userRows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
        );
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: { id: userRows[0].id, name: userRows[0].name, email: userRows[0].email, role: userRows[0].role, status: userRows[0].status }
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const revokeRefreshToken = async (refreshToken) => {
    if (!refreshToken) return;
    await pool.execute('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL', [hashResetToken(refreshToken)]);
};

export const revokeAllRefreshTokens = async (userId) => {
    await pool.execute('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL', [userId]);
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
        await connection.execute(`INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'PASSWORD_RESET', 'USER', ?)`, [rows[0].user_id, rows[0].user_id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
