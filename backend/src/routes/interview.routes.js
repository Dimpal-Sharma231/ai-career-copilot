import { Router } from 'express';
import { 
  startInterviewSession, 
  submitAnswer, 
  getInterviewHistory, 
  getSessionById 
} from '../controllers/interview.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Stateful Mock Interview Routes
router.post('/start', authenticateToken, startInterviewSession);
router.post('/answer', authenticateToken, submitAnswer);
router.get('/history', authenticateToken, getInterviewHistory);
router.get('/:id', authenticateToken, getSessionById);

export default router;
