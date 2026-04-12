import { Router } from 'express';
import * as catTagController from '../controllers/categoryTagController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Categories
 *   description: Category management and browsing
 */

// ============ CATEGORY PUBLIC ROUTES ============

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List all active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', catTagController.listCategories);

/**
 * @openapi
 * /categories/{slug}/posts:
 *   get:
 *     summary: Get posts by category slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Category details and its posts
 */
router.get('/:slug/posts', catTagController.postsByCategory);

export default router;
