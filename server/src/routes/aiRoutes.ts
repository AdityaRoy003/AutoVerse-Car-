import { Router } from 'express';
import { summariseLead, draftReply, suggestUsedCarPrice } from '../controllers/aiController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Endpoint for CRM intelligence & drafting
router.post('/summarise-lead', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), summariseLead);
router.post('/draft-reply', authenticateJWT, requireRole(['SALES_CONSULTANT', 'ADMIN']), draftReply);

// Used-car manager / Admin only AI valuation engine
router.post('/suggest-used-car-price', authenticateJWT, requireRole(['ADMIN']), suggestUsedCarPrice);

export default router;

