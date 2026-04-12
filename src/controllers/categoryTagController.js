import * as catTagService from '../services/categoryTagService.js';
import * as postService from '../services/postService.js';
import { success, created, noContent, paginated } from '../utils/response.js';

/**
 * Category Controller
 */

/**
 * GET /api/v1/categories - List all categories (public)
 */
export async function listCategories(req, res, next) {
  try {
    const categories = await catTagService.getCategories();
    return success(res, categories);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/categories/:slug/posts - Posts by category (public)
 */
export async function postsByCategory(req, res, next) {
  try {
    const category = await catTagService.getCategoryBySlug(req.params.slug);
    const queryParams = { ...req.query, category_id: category.id };
    const { posts, pagination } = await postService.getPublishedPosts(queryParams);
    return paginated(res, { category, posts }, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/categories - Create category (admin)
 */
export async function createCategory(req, res, next) {
  try {
    const category = await catTagService.createCategory(req.body);
    return created(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/admin/categories/:id - Update category (admin)
 */
export async function updateCategory(req, res, next) {
  try {
    const category = await catTagService.updateCategory(parseInt(req.params.id, 10), req.body);
    return success(res, category);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/admin/categories/:id - Delete category (admin)
 */
export async function deleteCategory(req, res, next) {
  try {
    await catTagService.deleteCategory(parseInt(req.params.id, 10));
    return noContent(res);
  } catch (err) {
    next(err);
  }
}

/**
 * Tag Controller
 */

/**
 * GET /api/v1/tags - List all tags (public)
 */
export async function listTags(req, res, next) {
  try {
    const tags = await catTagService.getTags();
    return success(res, tags);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/tags/popular - Popular tags
 */
export async function popularTags(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const tags = await catTagService.getPopularTags(limit);
    return success(res, tags);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/tags/:slug/posts - Posts by tag (public)
 */
export async function postsByTag(req, res, next) {
  try {
    const { posts, pagination } = await postService.getPostsByTag(req.params.slug, req.query);
    return paginated(res, posts, pagination);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/tags - Create tag (admin)
 */
export async function createTag(req, res, next) {
  try {
    const tag = await catTagService.createTag(req.body);
    return created(res, tag);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/admin/tags/:id - Delete tag (admin)
 */
export async function deleteTag(req, res, next) {
  try {
    await catTagService.deleteTag(parseInt(req.params.id, 10));
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
