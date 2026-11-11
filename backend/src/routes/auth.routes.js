import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateOnboarding, 
  updateDsaStats 
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public Authentication endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.get('/me', authenticateToken, getProfile);
router.put('/onboarding', authenticateToken, updateOnboarding);
router.put('/dsa', authenticateToken, updateDsaStats);

export default router;
