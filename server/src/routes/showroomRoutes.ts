import { Router } from 'express';
import {
  getShowrooms,
  getDemoVehiclesByShowroom,
  getWorkshops,
  createShowroom,
  createDemoVehicle,
} from '../controllers/showroomController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getShowrooms);
router.get('/:showroomId/demo-vehicles', getDemoVehiclesByShowroom);
router.get('/workshops/list', getWorkshops);

// Admin-only management
router.post('/', authenticateJWT, requireRole(['ADMIN']), createShowroom);
router.post('/demo-vehicles', authenticateJWT, requireRole(['ADMIN']), createDemoVehicle);

export default router;

