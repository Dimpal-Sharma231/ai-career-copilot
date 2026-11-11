import { Router } from 'express';
import { 
  getApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication 
} from '../controllers/applications.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Tracked Job Applications endpoints
router.get('/', authenticateToken, getApplications);
router.post('/', authenticateToken, createApplication);
router.put('/:id', authenticateToken, updateApplication);
router.delete('/:id', authenticateToken, deleteApplication);

export default router;
