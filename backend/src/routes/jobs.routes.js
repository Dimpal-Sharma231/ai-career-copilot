import { Router } from 'express';
import { matchJob, getMatchHistory } from '../controllers/jobs.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Calculate match score between Resume and JD
router.post('/match', authenticateToken, matchJob);

// Fetch user's match history
router.get('/history', authenticateToken, getMatchHistory);

export default router;
