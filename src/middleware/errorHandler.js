import env from '../config/env.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses.
 */
export function errorHandler(err, req, res, next) {
  // Log error in development
  if (env.isDev) {
    console.error('❌ Error:', err);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: `File too large. Maximum size is ${env.upload.maxFileSize / 1024 / 1024}MB.`,
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field.',
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed.',
      details: err.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Referenced record does not exist.',
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'Cross-origin request not allowed.',
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && !env.isDev
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.isDev && { stack: err.stack }),
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}
