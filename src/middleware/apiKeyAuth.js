import env from '../config/env.js';
import { error } from '../utils/response.js';

/**
 * Middleware to authenticate requests via API Key.
 * Checks for API key in headers ('x-api-key' or 'api-key')
 * or query parameters ('api_key' or 'apiKey').
 */
export function authenticateApiKey(req, res, next) {
  const providedKey = req.headers['x-api-key'] ||
                      req.headers['api-key'] ||
                      req.query['api_key'] ||
                      req.query['apiKey'];

  const configKey = env.apiKey;

  if (!configKey) {
    console.error('⚠️ CONTACT_API_KEY environment variable is not configured.');
    return error(res, 'API configuration error. Please contact the administrator.', 500);
  }

  if (!providedKey || providedKey !== configKey) {
    return error(res, 'Invalid or missing API key. Access denied.', 401);
  }

  next();
}
