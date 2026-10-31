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
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 24 * 60 * 60 * 1000
        });
        successResponse(res, 200, 'Login successful', { accessToken: result.accessToken, user: result.user });
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

export const logout = async (req, res, next) => {
    try {
        await authService.revokeRefreshToken(req.cookies?.refreshToken);
        await authService.revokeAllRefreshTokens(req.user.id);
        res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        successResponse(res, 200, 'Logout successful', {});
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const result = await authService.refreshAccessToken(req.cookies?.refreshToken);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 24 * 60 * 60 * 1000
        });
        successResponse(res, 200, 'Access token refreshed', { accessToken: result.accessToken, user: result.user });
    } catch (error) {
        next(error);
    }
};

export const activateStaff = async (req, res, next) => {
    try {
        await authService.activateStaff(req.body.token, req.body.password);
        successResponse(res, 200, 'Staff account activated successfully', {});
    } catch (error) {
        next(error);
    }
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
