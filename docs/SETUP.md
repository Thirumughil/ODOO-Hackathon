# SubscriptIQ Setup & Deployment Guide

This guide details the step-by-step instructions to configure, initialize, and execute the **SubscriptIQ** platform locally for development, evaluation, and production testing.

---

## 1. System Prerequisites

Ensure the following environments are installed and accessible on your host machine:

- **Node.js**: v20.x or v22.x LTS (compatible with v24)
- **npm**: v10.x+
- **MySQL Server**: v8.0 or v8.4 LTS (or MariaDB 10.5+) running locally on port `3306`
- **Git**: v2.40+

---

## 2. Database Initialization (MySQL)

### Step 2.1 — Access MySQL CLI
Log into your local MySQL server as `root` (or administrative user):
```bash
mysql -u root -p
```

### Step 2.2 — Run Initialization Scripts
Execute the SQL migration sequence located in `/database`:

```sql
SOURCE /path/to/database/01_create_database.sql;
SOURCE /path/to/database/02_create_roles.sql;
SOURCE /path/to/database/03_create_users.sql;
SOURCE /path/to/database/04_password_reset_tokens.sql;
SOURCE /path/to/database/05_audit_logs.sql;
SOURCE /path/to/database/06_verify_database.sql;
SOURCE /path/to/database/07_auth_security_migration.sql;
```

Alternatively, you can apply them from the command line in Windows PowerShell:
```powershell
Get-ChildItem -Path "database\*.sql" | ForEach-Object {
    Get-Content $_.FullName | mysql -u root -p subscriptiq
}
```

---

## 3. Backend Service Setup

### Step 3.1 — Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 3.2 — Configure Environment Variables
Copy `backend/.env.example` to `backend/.env`:
```powershell
cp .env.example .env
```

Ensure the `.env` parameters match your local MySQL configuration:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=subscriptiq
JWT_SECRET=super_secret_jwt_subscriptiq_key_2026_production
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=secure_32_byte_hex_string_for_refresh_tokens_12345
REFRESH_TOKEN_TTL_DAYS=7
STAFF_INVITATION_TTL_MINUTES=60
FRONTEND_URL=http://localhost:5173
```

### Step 3.3 — Seed Initial Test Accounts
Run the automated seed script to populate default system roles and initial accounts:
```powershell
node scripts/seed.js
```

### Step 3.4 — Start the Backend Server
```powershell
npm run dev
# or for production:
node src/server.js
```
The backend API will initialize on `http://localhost:5000`. Test the health status:
```powershell
curl http://localhost:5000/api/health
```

---

## 4. Frontend Application Setup

### Step 4.1 — Install Frontend Dependencies
```powershell
cd ../frontend
npm install
```

### Step 4.2 — Start Development Server
```powershell
npm run dev
```
The frontend interface will become available at `http://localhost:5173`.

### Step 4.3 — Run Production Build
To validate TypeScript compilation and generate the production bundle:
```powershell
npm run build
```
Build artifacts will be emitted to `frontend/dist/`.

---

## 5. Pre-Configured Test Accounts

The seed script creates the following accounts in MySQL with bcrypt-hashed passwords:

| Role | Email | Password | Intended Portal |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@subscriptiq.io` | `AdminPassword1!` | Admin Console & Organization Directory |
| **STAFF** | `staff@subscriptiq.io` | `StaffPassword1!` | Operational Workspace |
| **CUSTOMER** | `customer@acmecorp.com` | `CustomerPassword1!` | Customer Self-Service Portal |

> [!NOTE]
> Public customer registration (`/api/auth/register`) enforces strong passwords (minimum 9 characters, uppercase, lowercase, special character) and assigns the **CUSTOMER** role strictly.

---

## 6. Automated Verification Test Suite

To verify database integrity, authentication flows, token generation, and RBAC authorization boundaries in a single command:

```powershell
cd backend
node scripts/verify-all.js
```

Output:
```
====================================================
 SUBSCRIPTIQ — COMPREHENSIVE INTEGRATION TEST SUITE
====================================================
[PASS] Table "users" exists in MySQL
[PASS] Table "roles" exists in MySQL
[PASS] Table "refresh_tokens" exists in MySQL
[PASS] Table "audit_logs" exists in MySQL
[PASS] All user passwords stored as bcrypt hashes ($2b$), NO plaintext passwords
[PASS] Admin login succeeded (HTTP 200)
[PASS] Staff login succeeded (HTTP 200)
[PASS] Customer login succeeded (HTTP 200)
[PASS] Public customer registration succeeded (HTTP 201)
[PASS] Duplicate email correctly rejected with HTTP 409 Conflict
[PASS] Admin authorized for GET /api/users (HTTP 200)
[PASS] Staff access to Admin-only endpoint correctly rejected (HTTP 403 Forbidden)
[PASS] Customer access to Admin-only endpoint correctly rejected (HTTP 403 Forbidden)
[PASS] Session validation GET /api/auth/me succeeded (HTTP 200)
[PASS] Unauthenticated request correctly rejected with HTTP 401 Unauthorized
====================================================
 SUMMARY: 26 PASSED, 0 FAILED
====================================================
```

---

## 7. Troubleshooting

- **Database Connection Refused (`ECONNREFUSED 127.0.0.1:3306`)**:
  Verify MySQL service is running (`Get-Service MySQL*` on Windows, or `systemctl status mysql` on Linux).
- **Missing Required Environment Variables Error**:
  Ensure all keys defined in `.env.example` exist in your local `.env` file.
- **Port 5000 in use**:
  Kill conflicting processes using `netstat -ano | findstr :5000` or change `PORT=5001` in `.env` and `VITE_API_URL` in frontend.
