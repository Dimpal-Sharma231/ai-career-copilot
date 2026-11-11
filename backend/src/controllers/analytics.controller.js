import { ReadinessService } from '../services/readiness.service.js';

/**
 * GET /api/analytics/readiness
 * Aggregates placement readiness across Resume, DSA, Profile, and Mock Interviews
 */
export const getPlacementReadiness = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const readinessData = await ReadinessService.calculateReadiness(userId);

    return res.status(200).json({
      success: true,
      readiness: readinessData
    });
  } catch (error) {
    console.error('[Analytics Controller] Readiness calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate placement readiness: ' + error.message
    });
  }
};
