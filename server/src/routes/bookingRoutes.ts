import { Router } from 'express';
import {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authenticateJWT, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/available-slots', getAvailableSlots);
router.post('/', optionalAuth, createBooking);
router.get('/my-bookings', authenticateJWT, getMyBookings);
router.get('/', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), getAllBookings);
router.patch('/:id/status', authenticateJWT, updateBookingStatus);
router.delete('/:id', authenticateJWT, (req, res, next) => {
  req.body.status = 'CANCELLED';
  updateBookingStatus(req, res, next);
});

export default router;

