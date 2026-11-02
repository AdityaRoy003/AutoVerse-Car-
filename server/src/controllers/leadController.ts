import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead.js';
import { LeadAssignmentHistory } from '../models/LeadAssignmentHistory.js';
import { CommunicationLog } from '../models/CommunicationLog.js';
import { TradeInRequest } from '../models/TradeInRequest.js';
import { CarModel } from '../models/CarModel.js';
import { CarVariant } from '../models/CarVariant.js';
import { Showroom } from '../models/Showroom.js';
import { User } from '../models/User.js';
import { LeadAssignmentEngine } from '../services/leadAssignmentEngine.js';
import { AIService } from '../services/aiProvider.js';
import { CSVParserService } from '../services/csvParserService.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      interestedModelId,
      interestedVariantId,
      budgetRange,
      preferredShowroom,
      leadSource = 'Website',
      message,
      consentGiven,
      marketingOptIn = false,
    } = req.body;

    if (!consentGiven) {
      throw new AppError('Explicit customer consent is required to process contact information under DPDP regulations.', 400);
    }

    if (!customerName || !customerPhone || !customerEmail) {
      throw new AppError('Customer name, valid phone number, and email address are required.', 400);
    }

    // Resolve model and showroom names for AI prompt
    let modelName: string | undefined;
    let variantName: string | undefined;
    let showroomName: string | undefined;

    if (interestedModelId && mongoose.Types.ObjectId.isValid(interestedModelId)) {
      const model = await CarModel.findById(interestedModelId);
      modelName = model?.name;
    }
    if (interestedVariantId && mongoose.Types.ObjectId.isValid(interestedVariantId)) {
      const variant = await CarVariant.findById(interestedVariantId);
      variantName = variant?.name;
    }
    if (preferredShowroom && mongoose.Types.ObjectId.isValid(preferredShowroom)) {
      const showroom = await Showroom.findById(preferredShowroom);
      showroomName = showroom?.name;
    }

    // Set 5-minute response deadline
    const deadline = new Date(Date.now() + 5 * 60 * 1000);

    const lead = new Lead({
      customerName,
      customerPhone,
      customerEmail,
      interestedModelId: interestedModelId ? new mongoose.Types.ObjectId(interestedModelId) : undefined,
      interestedVariantId: interestedVariantId ? new mongoose.Types.ObjectId(interestedVariantId) : undefined,
      budgetRange,
      preferredShowroom: preferredShowroom ? new mongoose.Types.ObjectId(preferredShowroom) : undefined,
      leadSource,
      status: 'NEW',
      responseDeadline: deadline,
      message,
      consentGiven: true,
      consentTimestamp: new Date(),
      policyVersion: '1.0',
      marketingOptIn,
    });

    await lead.save();

    // 1. Run AI Buyer Summary & Reply Draft
    const aiProvider = AIService.getProvider();
    const leadContext = {
      customerName,
      customerPhone,
      customerEmail,
      interestedModelName: modelName,
      interestedVariantName: variantName,
      budgetRange,
      message,
      preferredShowroomName: showroomName,
    };

    try {
      const [aiSummary, aiReply] = await Promise.all([
        aiProvider.summariseLead(leadContext),
        aiProvider.draftReply(leadContext, 'Autoverse Executive'),
      ]);

      lead.aiSummary = {
        summary: aiSummary.summary,
        budget: aiSummary.budget,
        preferredModel: aiSummary.preferredModel,
        fuelPreference: aiSummary.fuelPreference,
        transmission: aiSummary.transmission,
        purchaseTimeline: aiSummary.purchaseTimeline,
        intent: aiSummary.intent,
        confidence: aiSummary.confidence,
        needsReview: aiSummary.needsReview,
        provider: aiSummary.provider,
        generatedAt: new Date(),
      };

      lead.aiReplyDraft = {
        draft: aiReply.draft,
        confidence: aiReply.confidence,
        needsReview: aiReply.needsReview,
        provider: aiReply.provider,
        generatedAt: new Date(),
        isApproved: false,
        isSent: false,
      };

      await lead.save();
    } catch (aiErr) {
      console.warn('[AI Service] Lead analysis failed gracefully:', aiErr);
    }

    // 2. Automated Lead Assignment (Workload balancing + showroom matching)
    await LeadAssignmentEngine.assignLead(
      lead._id,
      preferredShowroom,
      interestedModelId,
      'SYSTEM_AUTO',
      'Initial automated routing based on showroom location and lowest active workload.'
    );

    const populatedLead = await Lead.findById(lead._id)
      .populate('interestedModelId', 'name heroImage startingPrice')
      .populate('interestedVariantId', 'name exShowroomPrice')
      .populate('preferredShowroom', 'name address phone')
      .populate('assignedConsultantId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Enquiry received. Our dedicated automotive consultant will reach out within 5 minutes.',
      lead: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, leadSource, isOverdue, search, page = 1, limit = 25 } = req.query;
    const query: any = {};

    // Consultant can only see their assigned leads unless they are ADMIN
    if (req.user?.role === 'SALES_CONSULTANT') {
      query.assignedConsultantId = req.user.id;
    }

    if (status && status !== 'all') query.status = status;
    if (leadSource && leadSource !== 'all') query.leadSource = leadSource;

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const now = new Date();
    if (isOverdue === 'true') {
      query.status = { $in: ['NEW', 'ASSIGNED'] };
      query.responseDeadline = { $lt: now };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('interestedModelId', 'name heroImage')
        .populate('interestedVariantId', 'name fuelType transmission')
        .populate('preferredShowroom', 'name')
        .populate('assignedConsultantId', 'name email phone')
        .sort({ responseDeadline: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(query),
    ]);

    // Update isOverdue flags dynamically
    const enrichedLeads = leads.map((lead) => {
      const obj = lead.toObject();
      const overdue = !lead.firstContactedAt && ['NEW', 'ASSIGNED'].includes(lead.status) && new Date(lead.responseDeadline) < now;
      return {
        ...obj,
        isOverdue: overdue,
        remainingMs: Math.max(0, new Date(lead.responseDeadline).getTime() - now.getTime()),
      };
    });

    res.json({
      success: true,
      leads: enrichedLeads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate('interestedModelId')
      .populate('interestedVariantId')
      .populate('preferredShowroom')
      .populate('assignedConsultantId', 'name email phone');

    if (!lead) throw new AppError('Lead record not found.', 404);

    // Permission check: sales consultant can only view their own leads
    if (req.user?.role === 'SALES_CONSULTANT' && lead.assignedConsultantId?._id?.toString() !== req.user.id) {
      throw new AppError('Forbidden: You can only access leads assigned to your queue.', 403);
    }

    const [assignmentHistory, communicationLogs] = await Promise.all([
      LeadAssignmentHistory.find({ leadId: lead._id })
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .populate('previousConsultantId', 'name')
        .sort({ assignedAt: -1 }),
      CommunicationLog.find({ leadId: lead._id })
        .populate('consultantId', 'name email')
        .sort({ sentAt: -1 }),
    ]);

    const now = new Date();
    const isOverdue = !lead.firstContactedAt && ['NEW', 'ASSIGNED'].includes(lead.status) && new Date(lead.responseDeadline) < now;

    res.json({
      success: true,
      lead: {
        ...lead.toObject(),
        isOverdue,
        remainingMs: Math.max(0, new Date(lead.responseDeadline).getTime() - now.getTime()),
      },
      assignmentHistory,
      communicationLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) throw new AppError('Lead not found', 404);

    if (req.user?.role === 'SALES_CONSULTANT' && lead.assignedConsultantId?.toString() !== req.user.id) {
      throw new AppError('Forbidden: Cannot modify lead assigned to another consultant.', 403);
    }

    lead.status = status;

    if (status === 'CONTACTED' && !lead.firstContactedAt) {
      lead.firstContactedAt = new Date();
      lead.isOverdue = false;
    }

    if (note) {
      lead.notes.push({
        note,
        authorId: req.user ? new mongoose.Types.ObjectId(req.user.id) : undefined,
        authorName: req.user?.name || 'Consultant',
        createdAt: new Date(),
      });
    }

    await lead.save();

    res.json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const reassignLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { newConsultantId, reason } = req.body;

    if (!newConsultantId) throw new AppError('Target consultant ID is required.', 400);

    const result = await LeadAssignmentEngine.reassignLead(
      id,
      newConsultantId,
      req.user!.id,
      reason || 'Manual reassignment by authorized staff.'
    );

    res.json({
      success: true,
      message: 'Lead reassigned successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const addLeadNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) throw new AppError('Note content cannot be empty.', 400);

    const lead = await Lead.findById(id);
    if (!lead) throw new AppError('Lead not found', 404);

    lead.notes.push({
      note: note.trim(),
      authorId: new mongoose.Types.ObjectId(req.user!.id),
      authorName: req.user!.name,
      createdAt: new Date(),
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      notes: lead.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const sendLeadReply = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { messageBody, channel = 'EMAIL', subject = 'Your Autoverse Enquiry' } = req.body;

    if (!messageBody || !messageBody.trim()) {
      throw new AppError('Message body cannot be empty.', 400);
    }

    const lead = await Lead.findById(id);
    if (!lead) throw new AppError('Lead not found', 404);

    // Save communication log (simulated transmission)
    const commLog = await CommunicationLog.create({
      leadId: lead._id,
      consultantId: new mongoose.Types.ObjectId(req.user!.id),
      channel,
      recipientPhone: lead.customerPhone,
      recipientEmail: lead.customerEmail,
      subject,
      messageBody: messageBody.trim(),
      isAiDraftEdited: req.body.isEdited || false,
      status: 'SENT_MOCK',
      sentAt: new Date(),
    });

    // Update lead state
    lead.firstContactedAt = new Date();
    lead.isOverdue = false;
    if (['NEW', 'ASSIGNED'].includes(lead.status)) {
      lead.status = 'CONTACTED';
    }
    if (lead.aiReplyDraft) {
      lead.aiReplyDraft.isApproved = true;
      lead.aiReplyDraft.isSent = true;
      lead.aiReplyDraft.sentAt = new Date();
    }
    await lead.save();

    res.json({
      success: true,
      message: `Message dispatched successfully to ${lead.customerName} via simulated ${channel}.`,
      communicationLog: commLog,
    });
  } catch (error) {
    next(error);
  }
};

export const importCSVLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Please upload a valid CSV file.', 400);
    }

    const isPreview = req.query.preview === 'true';

    if (isPreview) {
      const preview = await CSVParserService.validateAndPreview(req.file.buffer);
      res.json({
        success: true,
        preview,
      });
      return;
    }

    const result = await CSVParserService.executeImport(
      req.file.buffer,
      req.file.originalname,
      req.user?.id
    );

    res.json({
      success: true,
      message: `CSV import completed: ${result.successCount} leads imported, ${result.failureCount} failed/duplicates.`,
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const createTradeInRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      currentVehicleModel,
      manufacturingYear,
      kilometres,
      fuelType,
      condition,
      interestedNewModelId,
      consentGiven,
    } = req.body;

    if (!consentGiven) {
      throw new AppError('Customer consent required under DPDP.', 400);
    }

    const tradeIn = new TradeInRequest({
      customerName,
      customerPhone,
      customerEmail,
      currentVehicleModel,
      manufacturingYear: Number(manufacturingYear),
      kilometres: Number(kilometres),
      fuelType,
      condition,
      interestedNewModelId: interestedNewModelId ? new mongoose.Types.ObjectId(interestedNewModelId) : undefined,
      consentGiven: true,
    });

    await tradeIn.save();

    // Also register an enquiry lead for the sales desk
    const lead = new Lead({
      customerName,
      customerPhone,
      customerEmail,
      interestedModelId: interestedNewModelId ? new mongoose.Types.ObjectId(interestedNewModelId) : undefined,
      leadSource: 'Used-car enquiry',
      status: 'NEW',
      responseDeadline: new Date(Date.now() + 5 * 60 * 1000),
      message: `Trade-in enquiry for ${currentVehicleModel} (${manufacturingYear}, ${kilometres} km, ${fuelType}, Condition: ${condition}).`,
      consentGiven: true,
      consentTimestamp: new Date(),
    });
    await lead.save();
    await LeadAssignmentEngine.assignLead(lead._id, undefined, interestedNewModelId, 'SYSTEM_AUTO', 'Trade-in valuation lead');

    res.status(201).json({
      success: true,
      message: 'Trade-in valuation request submitted. An evaluator will contact you shortly.',
      tradeIn,
    });
  } catch (error) {
    next(error);
  }
};

export const getTradeInRequests = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requests = await TradeInRequest.find()
      .populate('interestedNewModelId', 'name heroImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};
