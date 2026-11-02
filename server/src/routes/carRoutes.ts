import { Router } from 'express';
import {
  getCars,
  getCarBySlugOrId,
  createCarModel,
  updateCarModel,
  deleteCarModel,
  addVariant,
  updateVariant,
} from '../controllers/carController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getCars);
router.get('/:slugOrId', getCarBySlugOrId);

// Admin-only management endpoints
router.post('/', authenticateJWT, requireRole(['ADMIN']), createCarModel);
router.put('/:id', authenticateJWT, requireRole(['ADMIN']), updateCarModel);
router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), deleteCarModel);
router.post('/:id/variants', authenticateJWT, requireRole(['ADMIN']), addVariant);
router.put('/variants/:variantId', authenticateJWT, requireRole(['ADMIN']), updateVariant);

export default router;

