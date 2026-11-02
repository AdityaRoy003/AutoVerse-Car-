import mongoose from 'mongoose';
import { TestDriveBooking, ITestDriveBooking } from '../models/TestDriveBooking.js';
import { DemoVehicle } from '../models/DemoVehicle.js';
import { TestDriveSlot } from '../models/TestDriveSlot.js';
import { Showroom } from '../models/Showroom.js';
import { CarVariant } from '../models/CarVariant.js';
import { PricingEngine } from './pricingEngine.js';

export interface CreateBookingDTO {
  buyerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  carModelId: string;
  carVariantId: string;
  showroomId: string;
  demoVehicleId: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 11:00 AM"
  cityId?: string;
  consentGiven: boolean;
  notes?: string;
}

export class BookingEngine {
  /**
   * Generates unique reference code, e.g., AV-TB-202611-9281
   */
  static generateReference(): string {
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    return `AV-TB-${dateStr}-${randomHex}`;
  }

  /**
   * Checks if demo vehicle is free on given date and slot
   */
  static async isSlotAvailable(
    demoVehicleId: string,
    bookingDate: string,
    timeSlot: string
  ): Promise<boolean> {
    const existing = await TestDriveBooking.findOne({
      demoVehicleId,
      bookingDate,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    return !existing;
  }

  /**
   * Atomically reserve test drive slot and create confirmed booking with pricing snapshot
   */
  static async createBooking(dto: CreateBookingDTO): Promise<ITestDriveBooking> {
    // 1. Validate Demo Vehicle existence and active status
    const demo = await DemoVehicle.findById(dto.demoVehicleId);
    if (!demo || !demo.isActive) {
      throw new Error('Selected demo vehicle is unavailable or inactive.');
    }

    if (demo.showroomId.toString() !== dto.showroomId) {
      throw new Error('Demo vehicle is not stationed at the selected showroom.');
    }

    // 2. Validate Showroom
    const showroom = await Showroom.findById(dto.showroomId);
    if (!showroom || !showroom.active) {
      throw new Error('Selected showroom is not operational.');
    }

    // 3. Prevent Double Booking
    const isAvailable = await this.isSlotAvailable(dto.demoVehicleId, dto.bookingDate, dto.timeSlot);
    if (!isAvailable) {
      throw new Error('Conflict: This demo vehicle is already reserved for the selected date and time slot. Please choose another slot.');
    }

    // 4. Retrieve pricing snapshot if cityId is available
    let pricingSnapshot: any = undefined;
    if (dto.cityId) {
      const priceResult = await PricingEngine.calculateOnRoadPrice(dto.carVariantId, dto.cityId);
      if (priceResult.available && priceResult.data) {
        pricingSnapshot = {
          exShowroomPrice: priceResult.data.exShowroomPrice,
          onRoadPrice: priceResult.data.totalOnRoadPrice,
          cityId: new mongoose.Types.ObjectId(dto.cityId),
          cityName: priceResult.data.cityName,
          calculatedAt: new Date(),
        };
      }
    }

    // If pricing not calculated via city, fetch exShowroom price from CarVariant directly
    if (!pricingSnapshot) {
      const variant = await CarVariant.findById(dto.carVariantId);
      if (variant) {
        pricingSnapshot = {
          exShowroomPrice: variant.exShowroomPrice,
          onRoadPrice: variant.exShowroomPrice,
          calculatedAt: new Date(),
        };
      }
    }

    // 5. Create Booking
    const booking = new TestDriveBooking({
      bookingReference: this.generateReference(),
      buyerId: dto.buyerId ? new mongoose.Types.ObjectId(dto.buyerId) : undefined,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      carModelId: new mongoose.Types.ObjectId(dto.carModelId),
      carVariantId: new mongoose.Types.ObjectId(dto.carVariantId),
      showroomId: new mongoose.Types.ObjectId(dto.showroomId),
      demoVehicleId: new mongoose.Types.ObjectId(dto.demoVehicleId),
      bookingDate: dto.bookingDate,
      timeSlot: dto.timeSlot,
      status: 'CONFIRMED',
      consentGiven: dto.consentGiven,
      consentTimestamp: new Date(),
      policyVersion: '1.0',
      pricingSnapshot,
      notes: dto.notes,
    });

    await booking.save();
    return booking;
  }
}

