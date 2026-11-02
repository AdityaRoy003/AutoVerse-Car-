import { Router } from 'express';
import multer from 'multer';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  reassignLead,
  addLeadNote,
  sendLeadReply,
  importCSVLeads,
  createTradeInRequest,
  getTradeInRequests,
} from '../controllers/leadController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = Router();

// Public lead & trade-in submissions
router.post('/', createLead);
router.post('/trade-in', createTradeInRequest);

// CRM consultant & admin endpoints
router.get('/', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), getLeads);
router.get('/trade-ins', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), getTradeInRequests);
router.get('/:id', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), getLeadById);
router.patch('/:id/status', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), updateLeadStatus);
router.patch('/:id/assign', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), reassignLead);
router.post('/:id/notes', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), addLeadNote);
router.post('/:id/send-reply', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), sendLeadReply);

// CSV Import endpoint
router.post('/import-csv', authenticateJWT, requireRole(['ADMIN']), upload.single('file'), importCSVLeads);

export default router;

