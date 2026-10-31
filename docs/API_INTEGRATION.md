# SubscriptIQ — API Integration Documentation

**Project:** SubscriptIQ — Intelligent Subscription & Revenue Management Platform  
**Backend Architecture:** Node.js (v24+ / Express 4 / ES Modules / MySQL 8 via mysql2)  
**Authentication Standard:** JWT (JSON Web Tokens) with Bearer Authorization + HttpOnly Refresh Tokens  
**Base URL:** `http://localhost:5000/api`  
**Database:** MySQL (`subscriptiq`)  

---

## 1. System Overview & Security Architecture

SubscriptIQ enforces strict server-side Role-Based Access Control (RBAC). Three roles are supported in the database:
- `ADMIN` (Role ID: 1) — Complete administrative access to metrics, user management, and platform configuration.
- `STAFF` (Role ID: 2) — Operational access for subscription workflows, customer support, and billing management.
- `CUSTOMER` (Role ID: 3) — End-user self-service portal for plan subscriptions, payment methods, and personal invoices.

Security safeguards:
- **Password Hashing:** Bcrypt with 12 salt rounds.
- **Strict Role Gating:** Public registration only allows creating `CUSTOMER` accounts. Staff accounts require an admin invitation token (`POST /api/admin/staff` and activation via `POST /api/auth/activate-staff`).
- **Token Security:** Access tokens have an expiration of 15m to 1d (configurable), while refresh tokens are stored hashed (SHA-256) in MySQL and delivered via `HttpOnly`, `SameSite=Lax` cookies.
- **Rate Limiting:** Protects `/api/auth/login` (10 requests/15m) and `/api/auth/forgot-password` (5 requests/15m).
- **Security Headers:** Enforced with Helmet.js.

---

## 2. API Endpoints Reference

### 2.1 Health Check
- **Endpoint:** `GET /api/health`
- **Authentication:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "SubscriptIQ backend is running",
  "data": {}
}
```

---

### 2.2 Customer Registration
- **Endpoint:** `POST /api/auth/register`
- **Authentication:** None (Public)
- **Request Body (`Content-Type: application/json`):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword1!"
}
```
- **Validation Rules:**
  - `name`: String, 1–100 characters.
  - `email`: Valid email format, max 255 characters (normalized to lowercase).
  - `password`: Minimum 9 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character (`[!@#$%^&*(),.?":{}|<>\[\]_+=\-]`).
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (e.g. invalid password complexity or missing fields).
  - `409 Conflict`: `"Email is already registered"`.

---

### 2.3 User Login
- **Endpoint:** `POST /api/auth/login`
- **Authentication:** None (Rate limited: 10 attempts / 15 min)
- **Request Body:**
```json
{
  "email": "admin@subscriptiq.io",
  "password": "AdminPassword1!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@subscriptiq.io",
      "role": "ADMIN",
      "status": "ACTIVE",
      "emailVerified": false
    }
  }
}
```
- *Note:* Also sets an `HttpOnly` cookie: `refreshToken`.
- **Error Responses:**
  - `401 Unauthorized`: `"Invalid credentials"` (generic to prevent email enumeration).
  - `403 Forbidden`: `"Account is inactive or blocked"`.

---

### 2.4 Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authenticated user profile",
  "data": {
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@subscriptiq.io",
      "role": "ADMIN",
      "status": "ACTIVE",
      "emailVerified": false
    }
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`: Missing, expired, or invalid token.

---

### 2.5 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Authentication:** Required (`Authorization: Bearer <accessToken>`)
- **Behavior:** Revokes refresh tokens associated with user session and clears the `refreshToken` cookie.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

---

### 2.6 Token Refresh
- **Endpoint:** `POST /api/auth/refresh`
- **Authentication:** Refresh Token Cookie
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@subscriptiq.io",
      "role": "ADMIN"
    }
  }
}
```

---

### 2.7 Password Reset Request
- **Endpoint:** `POST /api/auth/forgot-password`
- **Authentication:** None (Rate limited)
- **Request Body:**
```json
{
  "email": "user@example.com"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "If the email is registered, a password reset link has been sent",
  "data": {}
}
```
- *Security Note:* Always returns 200 to prevent user enumeration attacks.

---

### 2.8 Password Reset Submission
- **Endpoint:** `POST /api/auth/reset-password`
- **Authentication:** Token-based
- **Request Body:**
```json
{
  "token": "48_character_hex_reset_token",
  "newPassword": "NewSecurePassword1!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": {}
}
```

---

### 2.9 Staff Invitation (Admin Only)
- **Endpoint:** `POST /api/admin/staff`
- **Authentication:** Required (`ADMIN` role)
- **Request Body:**
```json
{
  "name": "Alex Smith",
  "email": "alex.staff@subscriptiq.io"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Staff invitation created",
  "data": {
    "user": {
      "id": 2,
      "name": "Alex Smith",
      "email": "alex.staff@subscriptiq.io",
      "role": "STAFF",
      "status": "INACTIVE"
    }
  }
}
```

---

### 2.10 Staff Activation
- **Endpoint:** `POST /api/auth/activate-staff`
- **Authentication:** None (Token-based)
- **Request Body:**
```json
{
  "token": "invitation_token_from_email",
  "password": "StaffPassword1!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Staff account activated successfully",
  "data": {}
}
```

---

### 2.11 User Directory (Admin Only)
- **Endpoint:** `GET /api/users`
- **Authentication:** Required (`ADMIN` role)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "System Administrator",
        "email": "admin@subscriptiq.io",
        "status": "ACTIVE",
        "email_verified": 1,
        "role": "ADMIN",
        "created_at": "2026-10-31T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 3. Business Modules Implementation Status

| Module | Backend Endpoint | Status | Frontend Handling |
|---|---|---|---|
| **Authentication & RBAC** | `/api/auth/*` | **IMPLEMENTED** | Fully connected via `authService.ts` |
| **User Directory** | `/api/users`, `/api/users/:id` | **IMPLEMENTED** | Admin directory view connected |
| **Staff Invitations** | `/api/admin/staff` | **IMPLEMENTED** | Admin staff management integrated |
| **Products & Variants** | `/api/products` | **NOT IMPLEMENTED** | Directory placeholder with live schema view |
| **Subscription Plans** | `/api/plans` | **NOT IMPLEMENTED** | Directory placeholder with pricing schema view |
| **Subscriptions** | `/api/subscriptions` | **NOT IMPLEMENTED** | Directory placeholder with renewal lifecycle view |
| **Invoices & Billing** | `/api/invoices` | **NOT IMPLEMENTED** | Directory placeholder with invoice schema view |
| **Payment Tracking** | `/api/payments` | **NOT IMPLEMENTED** | Directory placeholder with transaction schema view |
| **Revenue Intelligence**| `/api/reports` | **NOT IMPLEMENTED** | Overview metric cards with API-pending badges |
