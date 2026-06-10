import { Router } from 'express';
import { getSettings, updateSettings, testSmtp, getPublicOpenHours, getPublicWebinar } from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public route - accessible by website visitors without authentication
router.get('/public/open-hours', getPublicOpenHours);
router.get('/public/webinar', getPublicWebinar);

// Protect the rest of the routes to ensure only authenticated admins can manage settings
router.use(authenticate); 
router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/test-smtp', testSmtp);

export default router;
