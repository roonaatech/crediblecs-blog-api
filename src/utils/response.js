/**
 * Standardized API Response Helpers
 */

/**
 * Send a success response
 */
export function success(res, data, statusCode = 200, meta = {}) {
  const response = {
    success: true,
    data,
  };

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response
 */
export function paginated(res, data, pagination) {
  // Set headers for total count (useful for frontend)
  res.setHeader('X-Total-Count', pagination.total);
  res.setHeader('X-Total-Pages', pagination.totalPages);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    },
  });
}

/**
 * Send an error response
 */
export function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Send a created response
 */
export function created(res, data) {
  return success(res, data, 201);
}

/**
 * Send a no content response
 */
export function noContent(res) {
  return res.status(204).end();
}
