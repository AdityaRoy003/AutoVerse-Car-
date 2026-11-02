import { Router } from 'express';
import {
  getWorkshops,
  getAvailableServiceSlots,
  createServiceBooking,
  getMyServiceBookings,
  getAllServiceBookings,
  updateServiceBookingStatus,
} from '../controllers/serviceController.js';
import { authenticateJWT, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/workshops', getWorkshops);
router.get('/available-slots', getAvailableServiceSlots);
router.post('/', optionalAuth, createServiceBooking);
router.get('/my-bookings', authenticateJWT, getMyServiceBookings);
router.get('/', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), getAllServiceBookings);
router.patch('/:id/status', authenticateJWT, updateServiceBookingStatus);

export default router;
