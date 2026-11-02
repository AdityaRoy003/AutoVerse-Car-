import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ServiceBooking } from '../models/ServiceBooking.js';
import { Workshop } from '../models/Workshop.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

const STANDARD_SERVICE_SLOTS = [
  '09:00 AM - 10:30 AM',
  '11:00 AM - 12:30 PM',
  '02:00 PM - 03:30 PM',
  '04:00 PM - 05:30 PM',
];

const SERVICE_ESTIMATES: Record<string, number> = {
  'Periodic Maintenance': 4500,
  'Express 90-Min Service': 3200,
  'Running Repairs & Diagnostics': 2800,
  'Body & Paint Ultrasound': 6500,
  'AC Sterilization & Filter': 2400,
  'EV Battery Health Check': 3800,
};

export const getWorkshops = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workshops = await Workshop.find({ active: true }).sort({ name: 1 });
    res.json({
      success: true,
      workshops,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableServiceSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workshopId, date } = req.query;
    if (!workshopId || !date) {
      throw new AppError('workshopId and date (YYYY-MM-DD) are required query parameters.', 400);
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop || !workshop.active) {
      throw new AppError('Workshop not found or inactive.', 404);
    }

    const totalBays = workshop.baysCount || 16;

    // Count bookings per slot on this date
    const bookings = await ServiceBooking.find({
      workshopId,
      bookingDate: date,
      status: { $in: ['CONFIRMED', 'IN_SERVICE'] },
    }).select('timeSlot assignedBayNumber');

    const slotCounts = new Map<string, number>();
    for (const b of bookings) {
      slotCounts.set(b.timeSlot, (slotCounts.get(b.timeSlot) || 0) + 1);
    }

    const slots = STANDARD_SERVICE_SLOTS.map((slot) => {
      const booked = slotCounts.get(slot) || 0;
      const baysLeft = Math.max(0, totalBays - booked);
      return {
        slot,
        totalBays,
        bookedBays: booked,
        baysLeft,
        isAvailable: baysLeft > 0,
      };
    });

    res.json({
      success: true,
      workshop: {
        id: workshop._id,
        name: workshop.name,
        totalBays,
      },
      date,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

export const createServiceBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      workshopId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleRegistrationNumber,
      vehicleModel,
      serviceType = 'Periodic Maintenance',
      bookingDate,
      timeSlot,
      pickupDropRequired = false,
      pickupAddress,
      notes,
      consentGiven,
    } = req.body;

    if (!consentGiven) {
      throw new AppError('Customer consent under DPDP is required to schedule service appointment.', 400);
    }

    if (!workshopId || !customerName || !customerPhone || !vehicleRegistrationNumber || !bookingDate || !timeSlot) {
      throw new AppError('All required service booking fields must be provided.', 400);
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop || !workshop.active) {
      throw new AppError('Selected workshop facility is inactive.', 404);
    }

    // Atomic bay capacity check
    const existingCount = await ServiceBooking.countDocuments({
      workshopId,
      bookingDate,
      timeSlot,
      status: { $in: ['CONFIRMED', 'IN_SERVICE'] },
    });

    if (existingCount >= workshop.baysCount) {
      throw new AppError(
        `All ${workshop.baysCount} service bays at ${workshop.name} are fully booked for ${timeSlot} on ${bookingDate}. Please pick another time slot.`,
        409
      );
    }

    const assignedBayNumber = existingCount + 1;
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingReference = `AV-SB-${dateStr}-${randomHex}`;

    const advisorName = workshop.name.includes('Transport Nagar')
      ? 'Vikash Saxena (Senior Service Advisor)'
      : 'Rakesh Yadav (Express Bay Advisor)';

    const estimatedCost = SERVICE_ESTIMATES[serviceType] || 4500;

    const booking = new ServiceBooking({
      bookingReference,
      workshopId,
      buyerId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      customerName,
      customerPhone,
      customerEmail,
      vehicleRegistrationNumber: vehicleRegistrationNumber.toUpperCase(),
      vehicleModel,
      serviceType,
      bookingDate,
      timeSlot,
      assignedBayNumber,
      pickupDropRequired,
      pickupAddress,
      estimatedCost,
      serviceAdvisorName: advisorName,
      status: 'CONFIRMED',
      consentGiven: true,
      notes,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: `Service appointment confirmed! Assigned to Bay #${assignedBayNumber} at ${workshop.name}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyServiceBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401);

    const bookings = await ServiceBooking.find({
      $or: [
        { buyerId: req.user.id },
        { customerEmail: req.user.email.toLowerCase() },
      ],
    })
      .populate('workshopId', 'name address phone baysCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServiceBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, workshopId, date } = req.query;
    const query: any = {};

    if (status && status !== 'all') query.status = status;
    if (workshopId && workshopId !== 'all') query.workshopId = workshopId;
    if (date) query.bookingDate = date;

    const bookings = await ServiceBooking.find(query)
      .populate('workshopId', 'name address baysCount')
      .sort({ bookingDate: 1, timeSlot: 1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceBookingStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { status, cancellationReason } = req.body;

    const booking = await ServiceBooking.findById(id);
    if (!booking) throw new AppError('Service booking not found', 404);

    if (req.user?.role === 'BUYER') {
      const isOwner = booking.buyerId?.toString() === req.user.id || booking.customerEmail === req.user.email;
      if (!isOwner) throw new AppError('Forbidden: Cannot modify another buyer\'s service booking.', 403);
      if (status !== 'CANCELLED') throw new AppError('Buyers may only cancel appointments.', 400);
    }

    booking.status = status;
    if (status === 'CANCELLED') {
      booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    }

    await booking.save();

    res.json({
      success: true,
      message: `Service appointment status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
