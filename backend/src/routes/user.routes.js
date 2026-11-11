import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserDsa 
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected user profile routes
router.get('/profile', authenticateToken, getUserProfile);
router.patch('/profile', authenticateToken, updateUserProfile);
router.patch('/dsa', authenticateToken, updateUserDsa);

export default router;
