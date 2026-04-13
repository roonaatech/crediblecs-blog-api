import { Router } from 'express';
import { submitContact, getSubmissions } from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', submitContact);

// Admin route to view submissions
router.get('/submissions', authenticate, getSubmissions);

export default router;
