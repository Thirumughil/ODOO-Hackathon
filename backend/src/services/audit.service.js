import { pool } from '../config/db.js';

export const writeAuditLog = async ({ userId = null, action, entityType, entityId = null, ipAddress = null }) => {
    await pool.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, ipAddress]
    );
};
