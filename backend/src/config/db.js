import mysql from 'mysql2/promise';

export const validateDatabaseName = (...args) => {
    const env = args.length > 0 && args[0] !== undefined ? args[0] : process.env.NODE_ENV;
    const dbName = args.length > 1 ? args[1] : process.env.DB_NAME;
    if (env === 'test') {
        if (!dbName || typeof dbName !== 'string' || !dbName.endsWith('_test')) {
            throw new Error(
                `Refusing to connect: in test mode (NODE_ENV=test), DB_NAME must be a non-empty string ending with '_test'. Received: '${dbName || ''}'.`
            );
        }
    }
};

validateDatabaseName();

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
});

export const testDatabaseConnection = async () => {
    const connection = await pool.getConnection();
    try {
        await connection.query('SELECT 1');
    } finally {
        connection.release();
    }
};
