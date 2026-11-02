import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  getAuditLogs,
  getOffers,
  createOffer,
  exportDmsSalesCsv,
  exportDmsServiceCsv,
} from '../controllers/adminController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Public offers
router.get('/offers', getOffers);

// Protected Admin-only routes
router.use(authenticateJWT, requireRole(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.get('/audit-logs', getAuditLogs);
router.post('/offers', createOffer);

// DMS Daily CSV Exports
router.get('/dms-export/sales', exportDmsSalesCsv);
router.get('/dms-export/service', exportDmsServiceCsv);

export default router;

