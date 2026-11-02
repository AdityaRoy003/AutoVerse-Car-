import { Router } from 'express';
import {
  getUsedCars,
  getUsedCarByStockId,
  createUsedCar,
  updateUsedCar,
  updateInspectionReport,
} from '../controllers/usedCarController.js';
import { authenticateJWT, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getUsedCars);
router.get('/:stockId', optionalAuth, getUsedCarByStockId);

// Admin-only management endpoints
router.post('/', authenticateJWT, requireRole(['ADMIN']), createUsedCar);
router.put('/:stockId', authenticateJWT, requireRole(['ADMIN']), updateUsedCar);
router.put('/:stockId/inspection', authenticateJWT, requireRole(['ADMIN']), updateInspectionReport);

export default router;

