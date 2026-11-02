import { Router } from 'express';
import authRoutes from './authRoutes.js';
import carRoutes from './carRoutes.js';
import usedCarRoutes from './usedCarRoutes.js';
import pricingRoutes from './pricingRoutes.js';
import showroomRoutes from './showroomRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import leadRoutes from './leadRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cars', carRoutes);
router.use('/used-cars', usedCarRoutes);
router.use('/pricing', pricingRoutes);
router.use('/showrooms', showroomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/leads', leadRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    dealership: 'Autoverse Authorised Dealership',
    location: 'Lucknow, Uttar Pradesh',
    timestamp: new Date().toISOString(),
  });
});

export default router;

