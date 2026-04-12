import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema, listPostsSchema, statusUpdateSchema } from '../validators/postValidator.js';
import * as postController from '../controllers/postController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Posts
 *   description: Public post access
 */

// ============ PUBLIC ROUTES ============

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: List published posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', validate(listPostsSchema), postController.listPublished);

/**
 * @openapi
 * /posts/featured:
 *   get:
 *     summary: Get featured posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of featured posts
 */
router.get('/featured', postController.listFeatured);

/**
 * @openapi
 * /posts/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', postController.search);

/**
 * @openapi
 * /posts/{slug}:
 *   get:
 *     summary: Get single post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 */
router.get('/:slug', postController.getBySlug);

export default router;
