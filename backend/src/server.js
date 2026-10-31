import 'dotenv/config';
import { testDatabaseConnection } from './config/db.js';

const requiredEnvironment = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missing = requiredEnvironment.filter((key) => !process.env[key]);
if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

try {
    await testDatabaseConnection();
    console.log('Database connection successful');
} catch (error) {
    console.error('Database connection failed. Verify DB settings in backend/.env');
    process.exit(1);
}

const { default: app } = await import('./app.js');
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
    console.log(`SubscriptIQ backend listening on port ${port}`);
});
