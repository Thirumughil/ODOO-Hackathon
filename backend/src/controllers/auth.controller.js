import { successResponse } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
    try {
        const user = await authService.registerCustomer(req.body);
        successResponse(res, 201, 'Registration successful', { user });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        successResponse(res, 200, 'Login successful', result);
    } catch (error) {
        next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        successResponse(res, 200, 'Authenticated user profile', { user });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res) => {
    successResponse(res, 200, 'Logout successful. Discard the JWT on the client; this stateless JWT cannot be revoked server-side until it expires.', {});
};

export const forgotPassword = async (req, res, next) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        successResponse(res, 200, 'If the email is registered, a password reset link has been sent', {});
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.token, req.body.newPassword);
        successResponse(res, 200, 'Password has been reset successfully', {});
    } catch (error) {
        next(error);
    }
};
