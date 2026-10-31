export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        const error = new Error('You are not authorized to perform this action');
        error.statusCode = 403;
        return next(error);
    }
    next();
};
