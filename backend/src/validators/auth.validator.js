import { z } from 'zod';

const passwordRule = z.string()
    .min(9, 'Password must be more than 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase character')
    .regex(/[a-z]/, 'Password must contain a lowercase character')
    .regex(/[!@#$%^&*(),.?":{}|<>\[\]_+=\-]/, 'Password must contain a special character');

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
    password: passwordRule
}).strict();

export const loginSchema = z.object({
    email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
    password: z.string().min(1)
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email().max(255).transform((value) => value.toLowerCase())
}).strict();

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(32).max(128),
    newPassword: passwordRule
}).strict();

export const createStaffSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
    password: passwordRule
}).strict();

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues[0]?.message || 'Invalid request data';
        const error = new Error(message);
        error.statusCode = 400;
        return next(error);
    }
    req.body = result.data;
    next();
};
