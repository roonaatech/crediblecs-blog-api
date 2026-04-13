import { Router } from 'express';
import { getSettings, updateSettings, testSmtp } from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protect these routes to ensure only authenticated admins can manage settings
router.use(authenticate); 
router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/test-smtp', testSmtp);

export default router;
