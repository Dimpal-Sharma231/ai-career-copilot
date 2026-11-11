import { Router } from 'express';
import { getPlacementReadiness } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/analytics/readiness - Aggregated Placement Readiness Score
router.get('/readiness', authenticateToken, getPlacementReadiness);

export default router;
