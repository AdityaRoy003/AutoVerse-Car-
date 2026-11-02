import { Router } from 'express';
import {
  getOnRoadPrice,
  getCities,
  calculateEMI,
  getAllPricing,
  createPricing,
  updatePricing,
} from '../controllers/pricingController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Public pricing calculations
router.get('/on-road/:variantId', getOnRoadPrice);
router.get('/cities', getCities);
router.post('/calculate-emi', calculateEMI);

// Admin-only pricing management
router.get('/', authenticateJWT, requireRole(['ADMIN']), getAllPricing);
router.post('/', authenticateJWT, requireRole(['ADMIN']), createPricing);
router.put('/:id', authenticateJWT, requireRole(['ADMIN']), updatePricing);

export default router;

