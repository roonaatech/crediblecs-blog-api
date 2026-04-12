import * as postService from '../services/postService.js';
import { success, created, paginated, noContent } from '../utils/response.js';

/**
 * Post Controller
 */

// ============ PUBLIC ENDPOINTS ============

/**
 * GET /api/v1/posts - List published posts
 */
export async function listPublished(req, res, next) {
  try {
    const { posts, pagination } = await postService.getPublishedPosts(req.query);
    return paginated(res, posts, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/posts/featured - Get featured posts
 */
export async function listFeatured(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const posts = await postService.getFeaturedPosts(limit);
    return success(res, posts);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/posts/:slug - Get single post by slug
 */
export async function getBySlug(req, res, next) {
  try {
    const post = await postService.getPostBySlug(req.params.slug);
    return success(res, post);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/search - Search posts
 */
export async function search(req, res, next) {
  try {
    const queryParams = { ...req.query, search: req.query.q };
    const { posts, pagination } = await postService.getPublishedPosts(queryParams);
    return paginated(res, posts, pagination);
  } catch (err) {
    next(err);
  }
}

// ============ ADMIN ENDPOINTS ============

/**
 * GET /api/v1/admin/posts - List all posts (admin)
 */
export async function listAll(req, res, next) {
  try {
    const { posts, pagination } = await postService.getAllPosts(req.query);
    return paginated(res, posts, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/posts/:id - Get post by ID (admin)
 */
export async function getById(req, res, next) {
  try {
    const post = await postService.getPostById(req.params.id);
    return success(res, post);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/posts - Create new post
 */
export async function create(req, res, next) {
  try {
    const post = await postService.createPost(req.body, req.user.id);
    return created(res, post);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/admin/posts/:id - Update post
 */
export async function update(req, res, next) {
  try {
    const post = await postService.updatePost(parseInt(req.params.id, 10), req.body);
    return success(res, post);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/admin/posts/:id - Soft delete post
 */
export async function remove(req, res, next) {
  try {
    await postService.deletePost(parseInt(req.params.id, 10));
    return noContent(res);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/admin/posts/:id/status - Update post status
 */
export async function updateStatus(req, res, next) {
  try {
    const post = await postService.updatePostStatus(
      parseInt(req.params.id, 10),
      req.body.status,
      req.body.scheduled_at
    );
    return success(res, post);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/dashboard/stats - Dashboard statistics
 */
export async function dashboardStats(req, res, next) {
  try {
    const stats = await postService.getDashboardStats();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
}
