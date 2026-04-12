import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema, listPostsSchema, statusUpdateSchema } from '../validators/postValidator.js';
import { createCategorySchema, updateCategorySchema, createTagSchema } from '../validators/commonValidator.js';
import * as postController from '../controllers/postController.js';
import * as catTagController from '../controllers/categoryTagController.js';
import * as mediaController from '../controllers/mediaController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(authorize('admin', 'editor'));

// ============ ADMIN MEDIA ROUTES ============
router.get('/media', mediaController.listMedia);
router.post('/media/upload', upload.single('file'), mediaController.uploadMedia);
router.delete('/media/:id', mediaController.deleteMedia);

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Administrative management for posts, categories, and tags
 */

// ============ ADMIN DASHBOARD ROUTES ============

/**
 * @openapi
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard/stats', postController.dashboardStats);

// ============ ADMIN POST ROUTES ============

/**
 * @openapi
 * /admin/posts:
 *   get:
 *     summary: List all posts (including drafts, etc.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, scheduled, archived]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/posts', validate(listPostsSchema), postController.listAll);

/**
 * @openapi
 * /admin/posts/{id}:
 *   get:
 *     summary: Get single post by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post details
 */
router.get('/posts/:id', postController.getById);

/**
 * @openapi
 * /admin/posts:
 *   post:
 *     summary: Create new post
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, published, scheduled]
 *     responses:
 *       201:
 *         description: Post created
 */
router.post('/posts', validate(createPostSchema), postController.create);

/**
 * @openapi
 * /admin/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Post updated
 */
router.put('/posts/:id', validate(updatePostSchema), postController.update);

/**
 * @openapi
 * /admin/posts/{id}:
 *   delete:
 *     summary: Delete post (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post deleted Successfully
 */
router.delete('/posts/:id', postController.remove);

/**
 * @openapi
 * /admin/posts/{id}/status:
 *   patch:
 *     summary: Update post status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, scheduled, archived]
 *     responses:
 *       200:
 *         description: Post status updated
 */
router.patch('/posts/:id/status', validate(statusUpdateSchema), postController.updateStatus);

// ============ ADMIN CATEGORY ROUTES ============

/**
 * @openapi
 * /admin/categories:
 *   post:
 *     summary: Create category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/categories', validate(createCategorySchema), catTagController.createCategory);

/**
 * @openapi
 * /admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/categories/:id', validate(updateCategorySchema), catTagController.updateCategory);

/**
 * @openapi
 * /admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Category deleted Successfully
 */
router.delete('/categories/:id', catTagController.deleteCategory);

// ============ ADMIN TAG ROUTES ============

/**
 * @openapi
 * /admin/tags:
 *   post:
 *     summary: Create tag
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created
 */
router.post('/tags', validate(createTagSchema), catTagController.createTag);

/**
 * @openapi
 * /admin/tags/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tag deleted Successfully
 */
router.delete('/tags/:id', catTagController.deleteTag);

export default router;
