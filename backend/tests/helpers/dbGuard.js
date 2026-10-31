export function assertTestDatabase(...args) {
    const env = args.length > 0 && args[0] !== undefined ? args[0] : process.env.NODE_ENV;
    const dbName = args.length > 1 ? args[1] : process.env.DB_NAME;
    if (env === 'test') {
        if (!dbName || typeof dbName !== 'string' || !dbName.endsWith('_test')) {
            throw new Error(
                `Strict DB Guard Violation: Refusing to run tests against '${dbName || ''}'. In test mode, DB_NAME must end with '_test' (e.g. subscriptiq_test) to protect production and development databases.`
            );
        }
    }
}
