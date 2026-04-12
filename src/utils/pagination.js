/**
 * Pagination Helper
 * Parses pagination query params and generates SQL LIMIT/OFFSET.
 */

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Express req.query
 * @param {number} defaultLimit - Default items per page
 * @param {number} maxLimit - Maximum items per page
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query, defaultLimit = 12, maxLimit = 50) {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || defaultLimit;

  // Clamp values
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination metadata from query results
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function buildPagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}
