export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

export const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || (error.type === 'entity.parse.failed' ? 400 : 500);
    const message = statusCode >= 500 ? 'Internal server error' : error.message;

    if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
        console.error('[SubscriptIQ error]', error.message);
    }

    res.status(statusCode).json({ success: false, message, data: null });
};
