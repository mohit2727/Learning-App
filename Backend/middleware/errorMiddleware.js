const fs = require('fs');
const path = require('path');

const logError = (err, req) => {
    const logLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: err.status || 500,
        message: err.message,
        stack: err.stack,
    }) + '\n';
    fs.appendFile(path.join(__dirname, '../error.log'), logLine, () => { });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    if (statusCode >= 500) {
        logError(err, req);
    }

    res.set('Cache-Control', 'no-store');
    res.status(statusCode).json({
        message: err.message,
        status: statusCode,
        path: req.originalUrl,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
