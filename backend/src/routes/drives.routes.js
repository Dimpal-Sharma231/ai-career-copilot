import { Router } from 'express';
import { getUpcomingDrives, createDrive } from '../controllers/drives.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/drives - Fetch upcoming placement drives with daysLeft calculation
router.get('/', authenticateToken, getUpcomingDrives);

// POST /api/drives - Create placement drive
router.post('/', authenticateToken, createDrive);

export default router;
