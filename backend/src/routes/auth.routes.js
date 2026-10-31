import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, activateStaffSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 900000);

const isRateLimitDisabled = () => process.env.RATE_LIMIT_DISABLED === 'true';

const loginLimiter = rateLimit({
    windowMs,
    limit: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: isRateLimitDisabled
});
const resetLimiter = rateLimit({
    windowMs,
    limit: Number(process.env.RESET_RATE_LIMIT_MAX || 5),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: isRateLimitDisabled
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', resetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/activate-staff', resetLimiter, validate(activateStaffSchema), authController.activateStaff);

export default router;
