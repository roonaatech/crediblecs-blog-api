import { Router } from 'express';
import * as catTagController from '../controllers/categoryTagController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Tags
 *   description: Tag management and browsing
 */

// ============ TAG PUBLIC ROUTES ============

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: List all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/', catTagController.listTags);

/**
 * @openapi
 * /tags/popular:
 *   get:
 *     summary: Get popular tags
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of popular tags
 */
router.get('/popular', catTagController.popularTags);

/**
 * @openapi
 * /tags/{slug}/posts:
 *   get:
 *     summary: Get posts by tag slug
 *     tags: [Tags]
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
 *         description: List of posts for the tag
 */
router.get('/:slug/posts', catTagController.postsByTag);

export default router;
