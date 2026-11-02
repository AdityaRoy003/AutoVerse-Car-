import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { TestDriveBooking } from '../models/TestDriveBooking.js';
import { CarModel } from '../models/CarModel.js';
import { CarVariant } from '../models/CarVariant.js';
import { UsedCar } from '../models/UsedCar.js';
import { DemoVehicle } from '../models/DemoVehicle.js';
import { Showroom } from '../models/Showroom.js';
import { AuditLog } from '../models/AuditLog.js';
import { Offer } from '../models/Offer.js';
import { ServiceBooking } from '../models/ServiceBooking.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      overdueLeads,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      carModelsCount,
      variantsCount,
      usedCarsCount,
      demoVehiclesCount,
      showroomsCount,
      recentAuditLogs,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'NEW' }),
      Lead.countDocuments({ status: 'CONTACTED' }),
      Lead.countDocuments({ status: 'QUALIFIED' }),
      Lead.countDocuments({ status: 'CONVERTED' }),
      Lead.countDocuments({
        status: { $in: ['NEW', 'ASSIGNED'] },
        responseDeadline: { $lt: now },
        firstContactedAt: { $exists: false },
      }),
      TestDriveBooking.countDocuments(),
      TestDriveBooking.countDocuments({ status: 'PENDING' }),
      TestDriveBooking.countDocuments({ status: 'CONFIRMED' }),
      TestDriveBooking.countDocuments({ status: 'COMPLETED' }),
      CarModel.countDocuments({ active: true }),
      CarVariant.countDocuments({ isAvailable: true }),
      UsedCar.countDocuments({ status: 'Available' }),
      DemoVehicle.countDocuments({ isActive: true }),
      Showroom.countDocuments({ active: true }),
      AuditLog.find().sort({ timestamp: -1 }).limit(10),
    ]);

    // Average response time calculation
    const contactedWithTimestamps = await Lead.find({
      firstContactedAt: { $exists: true },
    }).select('createdAt firstContactedAt');

    let totalDurationMs = 0;
    for (const lead of contactedWithTimestamps) {
      if (lead.firstContactedAt) {
        totalDurationMs += new Date(lead.firstContactedAt).getTime() - new Date(lead.createdAt).getTime();
      }
    }
    const avgResponseMinutes = contactedWithTimestamps.length > 0
      ? Math.round((totalDurationMs / contactedWithTimestamps.length / 60000) * 10) / 10
      : 3.5;

    res.json({
      success: true,
      stats: {
        leads: {
          total: totalLeads,
          new: newLeads,
          contacted: contactedLeads,
          qualified: qualifiedLeads,
          converted: convertedLeads,
          overdue: overdueLeads,
          conversionRatePercent: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
          avgResponseMinutes,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
        },
        inventory: {
          carModels: carModelsCount,
          variants: variantsCount,
          certifiedUsedCars: usedCarsCount,
          demoVehicles: demoVehiclesCount,
          showrooms: showroomsCount,
        },
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('assignedShowroom', 'name city')
      .populate('supportedModels', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role = 'SALES_CONSULTANT', phone, assignedShowroom, supportedModels } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError('A user with this email address already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Sales@12345', salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone,
      assignedShowroom: assignedShowroom || undefined,
      supportedModels: supportedModels || [],
      active: true,
    });

    await user.save();

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: user._id.toString(),
      newValues: { name, email, role },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, role, active, assignedShowroom, supportedModels } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) throw new AppError('User not found', 404);

    // Prevent changing the master admin's role
    if (targetUser.email === 'admin@autoverse.demo' && role && role !== 'ADMIN') {
      throw new AppError('Root administrator account role cannot be changed.', 403);
    }

    const oldValues = targetUser.toObject();

    if (name) targetUser.name = name;
    if (phone) targetUser.phone = phone;
    if (role) targetUser.role = role;
    if (active !== undefined) targetUser.active = active;
    if (assignedShowroom !== undefined) targetUser.assignedShowroom = assignedShowroom || null;
    if (supportedModels !== undefined) targetUser.supportedModels = supportedModels;

    await targetUser.save();

    await AuditLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: id,
      oldValues,
      newValues: req.body,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: targetUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityType, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (entityType && entityType !== 'all') {
      query.entityType = entityType;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      logs,
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

export const getOffers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offers = await Offer.find({ active: true }).populate('applicableModels', 'name startingPrice heroImage');
    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({
      success: true,
      message: 'Offer banner created successfully',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to escape CSV cell contents
 */
const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Daily DMS Sales CSV Export
 * Exports Leads and Test-Drive Bookings in standardized Dealer Management System intake format
 */
export const exportDmsSalesCsv = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    const query: any = {};
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [leads, testDrives] = await Promise.all([
      Lead.find(query)
        .populate('assignedConsultantId', 'name email phone')
        .populate('preferredShowroom', 'name code')
        .populate('interestedModelId', 'name')
        .populate('interestedVariantId', 'name')
        .sort({ createdAt: -1 }),
      TestDriveBooking.find(query)
        .populate('carModelId', 'name')
        .populate('carVariantId', 'name exShowroomPrice')
        .populate('showroomId', 'name code')
        .sort({ createdAt: -1 }),
    ]);

    const headers = [
      'DMS_RECORD_REF',
      'INTAKE_TYPE',
      'CREATED_TIMESTAMP',
      'CUSTOMER_NAME',
      'CONTACT_PHONE',
      'CONTACT_EMAIL',
      'INTERESTED_MODEL',
      'VARIANT_NAME',
      'SHOWROOM_DEALERSHIP',
      'ASSIGNED_OFFICER',
      'WORKFLOW_STATUS',
      'SOURCE_CHANNEL',
      'VALUATION_OR_BUDGET_INR',
      'DPDP_CONSENT_VERIFIED',
    ];

    const rows: string[] = [headers.join(',')];

    // Format Leads
    for (const lead of leads) {
      const showroom = (lead.preferredShowroom as any)?.name || 'Lucknow Dealership';
      const consultant = (lead.assignedConsultantId as any)?.name || 'Unassigned / Lead Pool';
      const model = (lead.interestedModelId as any)?.name || lead.aiSummary?.preferredModel || 'Brand X';
      const variant = (lead.interestedVariantId as any)?.name || 'Any Variant';
      rows.push([
        escapeCsv(lead._id),
        escapeCsv('SALES_ENQUIRY'),
        escapeCsv(lead.createdAt.toISOString()),
        escapeCsv(lead.customerName),
        escapeCsv(lead.customerPhone),
        escapeCsv(lead.customerEmail),
        escapeCsv(model),
        escapeCsv(variant),
        escapeCsv(showroom),
        escapeCsv(consultant),
        escapeCsv(lead.status),
        escapeCsv(lead.leadSource),
        escapeCsv(lead.budgetRange || 'Market Rate'),
        escapeCsv(lead.consentGiven ? 'YES' : 'NO'),
      ].join(','));
    }

    // Format Test Drives
    for (const td of testDrives) {
      const showroom = (td.showroomId as any)?.name || 'Lucknow Dealership';
      const model = (td.carModelId as any)?.name || 'Brand X';
      const variant = (td.carVariantId as any)?.name || 'Standard';
      const price = (td.carVariantId as any)?.exShowroomPrice || td.pricingSnapshot?.exShowroomPrice || 0;
      rows.push([
        escapeCsv(td.bookingReference),
        escapeCsv('TEST_DRIVE_BOOKING'),
        escapeCsv(td.createdAt.toISOString()),
        escapeCsv(td.customerName),
        escapeCsv(td.customerPhone),
        escapeCsv(td.customerEmail),
        escapeCsv(model),
        escapeCsv(variant),
        escapeCsv(showroom),
        escapeCsv('Demo Specialist'),
        escapeCsv(td.status),
        escapeCsv('Online Test Drive Wizard'),
        escapeCsv(price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'N/A'),
        escapeCsv(td.consentGiven ? 'YES' : 'NO'),
      ].join(','));
    }

    const todayStr = (date as string) || new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="autoverse_dms_sales_${todayStr}.csv"`);
    res.status(200).send(rows.join('\r\n'));
  } catch (error) {
    next(error);
  }
};

/**
 * Daily DMS Workshop Service CSV Export
 * Exports Service Bookings & Workshop Bay Job Cards in standardized DMS intake format
 */
export const exportDmsServiceCsv = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    const query: any = {};
    if (date) {
      query.bookingDate = date;
    }

    const serviceBookings = await ServiceBooking.find(query)
      .populate('workshopId', 'name code baysCount address')
      .sort({ bookingDate: -1, assignedBayNumber: 1 });

    const headers = [
      'DMS_JOB_CARD_REF',
      'BOOKING_DATE',
      'ALLOCATED_TIME_SLOT',
      'VEHICLE_REGISTRATION_NO',
      'VEHICLE_MODEL',
      'WORKSHOP_NAME',
      'BAY_NUMBER',
      'CUSTOMER_NAME',
      'MOBILE',
      'EMAIL',
      'SERVICE_TYPE',
      'ESTIMATED_AMOUNT_INR',
      'HOME_PICKUP_REQUIRED',
      'PICKUP_ADDRESS',
      'SERVICE_ADVISOR',
      'WORKFLOW_STATUS',
      'DPDP_CONSENT_VERIFIED',
    ];

    const rows: string[] = [headers.join(',')];

    for (const sb of serviceBookings) {
      const workshop = (sb.workshopId as any)?.name || 'Lucknow Service Workshop';
      rows.push([
        escapeCsv(sb.bookingReference),
        escapeCsv(sb.bookingDate),
        escapeCsv(sb.timeSlot),
        escapeCsv(sb.vehicleRegistrationNumber),
        escapeCsv(sb.vehicleModel),
        escapeCsv(workshop),
        escapeCsv(`Bay #${sb.assignedBayNumber}`),
        escapeCsv(sb.customerName),
        escapeCsv(sb.customerPhone),
        escapeCsv(sb.customerEmail),
        escapeCsv(sb.serviceType),
        escapeCsv(`₹${sb.estimatedCost.toLocaleString('en-IN')}`),
        escapeCsv(sb.pickupDropRequired ? 'YES' : 'NO'),
        escapeCsv(sb.pickupAddress || 'N/A'),
        escapeCsv(sb.serviceAdvisorName),
        escapeCsv(sb.status),
        escapeCsv(sb.consentGiven ? 'YES' : 'NO'),
      ].join(','));
    }

    const todayStr = (date as string) || new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="autoverse_dms_service_${todayStr}.csv"`);
    res.status(200).send(rows.join('\r\n'));
  } catch (error) {
    next(error);
  }
};

