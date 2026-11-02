import { Request, Response, NextFunction } from 'express';
import { BookingEngine } from '../services/bookingEngine.js';
import { TestDriveBooking } from '../models/TestDriveBooking.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

const STANDARD_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:30 AM - 12:30 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
];

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { demoVehicleId, date } = req.query;
    if (!demoVehicleId || !date) {
      throw new AppError('demoVehicleId and date (YYYY-MM-DD) are required query parameters.', 400);
    }

    const reservedBookings = await TestDriveBooking.find({
      demoVehicleId,
      bookingDate: date,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    }).select('timeSlot');

    const reservedSlots = new Set(reservedBookings.map((b) => b.timeSlot));

    const slots = STANDARD_SLOTS.map((slot) => ({
      slot,
      isAvailable: !reservedSlots.has(slot),
    }));

    res.json({
      success: true,
      demoVehicleId,
      date,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      carModelId,
      carVariantId,
      showroomId,
      demoVehicleId,
      bookingDate,
      timeSlot,
      cityId,
      consentGiven,
      notes,
    } = req.body;

    if (!consentGiven) {
      throw new AppError('Explicit consent to data handling and test-drive terms is required under DPDP.', 400);
    }

    const booking = await BookingEngine.createBooking({
      buyerId: req.user?.id,
      customerName,
      customerPhone,
      customerEmail,
      carModelId,
      carVariantId,
      showroomId,
      demoVehicleId,
      bookingDate,
      timeSlot,
      cityId,
      consentGiven: true,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Test drive confirmed successfully! A simulated SMS and email confirmation has been dispatched.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401);

    const bookings = await TestDriveBooking.find({
      $or: [
        { buyerId: req.user.id },
        { customerEmail: req.user.email.toLowerCase() },
      ],
    })
      .populate('carModelId', 'name heroImage bodyType')
      .populate('carVariantId', 'name fuelType transmission exShowroomPrice')
      .populate('showroomId', 'name address phone')
      .populate('demoVehicleId', 'registrationNumber color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, showroomId, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (status && status !== 'all') query.status = status;
    if (showroomId && showroomId !== 'all') query.showroomId = showroomId;

    // If sales consultant has assigned showroom, filter by default
    if (req.user?.role === 'SALES_CONSULTANT' && req.user.assignedShowroom) {
      query.showroomId = req.user.assignedShowroom;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      TestDriveBooking.find(query)
        .populate('carModelId', 'name heroImage')
        .populate('carVariantId', 'name fuelType transmission')
        .populate('showroomId', 'name address')
        .populate('demoVehicleId', 'registrationNumber color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TestDriveBooking.countDocuments(query),
    ]);

    res.json({
      success: true,
      bookings,
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

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await TestDriveBooking.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);

    // Permission check: Buyer can only cancel their own booking
    if (req.user?.role === 'BUYER') {
      const isOwner = booking.buyerId?.toString() === req.user.id || booking.customerEmail === req.user.email;
      if (!isOwner) throw new AppError('Forbidden: Cannot modify another buyer\'s booking.', 403);
      if (status !== 'CANCELLED') throw new AppError('Buyers may only cancel bookings.', 400);
    }

    booking.status = status;
    if (status === 'CANCELLED') {
      booking.cancellationReason = cancellationReason || 'Cancelled by user';
      booking.cancelledAt = new Date();
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

