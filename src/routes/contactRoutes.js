import { Router } from 'express';
import { submitContact, getSubmissions, getSubmissionsApi, updateSubmissionStatusApi } from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Contact Submissions
 *   description: Contact form and lead management
 */

/**
 * @openapi
 * /contact:
 *   post:
 *     summary: Submit contact/lead form
 *     tags: [Contact Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               service:
 *                 type: string
 *                 example: Payroll Services
 *               message:
 *                 type: string
 *                 example: Need compliance review.
 *     responses:
 *       201:
 *         description: Submission successful
 *       400:
 *         description: Name, phone, and email are required
 */
router.post('/', submitContact);

/**
 * @openapi
 * /contact/submissions:
 *   get:
 *     summary: View submissions (Admin Dashboard, JWT Protected)
 *     tags: [Contact Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact submissions
 *       401:
 *         description: Unauthorized
 */
router.get('/submissions', authenticate, getSubmissions);

/**
 * @openapi
 * /contact/api-submissions:
 *   get:
 *     summary: Fetch submissions (Secure API Key Protected)
 *     tags: [Contact Submissions]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: API key for authentication
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         description: API key for authentication (fallback query parameter)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, resolved, consumed, junk]
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, name, email, created_at, status, service]
 *           default: created_at
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Paginated contact submissions
 *       401:
 *         description: Invalid or missing API key
 */
router.get('/api-submissions', authenticateApiKey, getSubmissionsApi);

/**
 * @openapi
 * /contact/api-submissions/{id}/status:
 *   patch:
 *     summary: Update submission status (Secure API Key Protected)
 *     tags: [Contact Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: API key for authentication
 *       - in: query
 *         name: api_key
 *         schema:
 *           type: string
 *         description: API key for authentication (fallback query parameter)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, resolved, consumed, junk]
 *                 example: consumed
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Status is required or invalid status value
 *       401:
 *         description: Invalid or missing API key
 *       404:
 *         description: Contact submission not found
 */
router.patch('/api-submissions/:id/status', authenticateApiKey, updateSubmissionStatusApi);

export default router;
