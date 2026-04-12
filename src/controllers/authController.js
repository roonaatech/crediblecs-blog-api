import * as authService from '../services/authService.js';
import { success, created, error } from '../utils/response.js';

/**
 * Auth Controller
 */

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return error(res, 'Refresh token is required.', 400);
    }
    const result = await authService.refreshToken(refreshToken);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/register (admin-only)
 */
export async function register(req, res, next) {
  try {
    const author = await authService.register(req.body);
    return created(res, author);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function me(req, res, next) {
  try {
    return success(res, req.user);
  } catch (err) {
    next(err);
  }
}
