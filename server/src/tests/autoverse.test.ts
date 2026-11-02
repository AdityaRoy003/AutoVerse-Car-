import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app.js';
import { PricingEngine } from '../services/pricingEngine.js';
import { BookingEngine } from '../services/bookingEngine.js';
import { LeadAssignmentEngine } from '../services/leadAssignmentEngine.js';
import { BuyerSummarySchema, DeterministicFallbackProvider } from '../services/aiProvider.js';
import { City, CarVariant, TestDriveBooking, DemoVehicle, Showroom, User, Lead, Workshop, ServiceBooking } from '../models/index.js';

const app = createApp();

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autoverse';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, { family: 4, serverSelectionTimeoutMS: 10000 });
  }
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}, 15000);

describe('1. City-Wise On-Road Pricing Engine & EMI Calculation', () => {
  it('calculates exact on-road price for Model H ZX Automatic in Lucknow', async () => {
    const variant = await CarVariant.findOne({ code: 'NEW-H-02' });
    const lucknow = await City.findOne({ name: 'Lucknow' });

    expect(variant).toBeDefined();
    expect(lucknow).toBeDefined();

    const result = await PricingEngine.calculateOnRoadPrice(variant!._id, lucknow!._id);
    expect(result.available).toBe(true);
    expect(result.data).toBeDefined();

    // Check pricing components:
    // ExShowroom: 12,45,000 | Tax: 10% (1,24,500) + 2000 = 126500 | Insurance: 48000 | Accessories: 15000 | Reg: 1500 | Other: 2500
    // Total On-road = 14,38,500
    expect(result.data!.exShowroomPrice).toBe(1245000);
    expect(result.data!.roadTaxAmount).toBe(126500);
    expect(result.data!.insuranceAmount).toBe(48000);
    expect(result.data!.accessoriesAmount).toBe(15000);
    expect(result.data!.registrationCharges).toBe(1500);
    expect(result.data!.otherCharges).toBe(2500);
    expect(result.data!.totalOnRoadPrice).toBe(1438500);
    expect(result.data!.disclaimer).toContain('Prices are indicative');
  });

  it('reflects different regional taxes for Delhi vs Lucknow', async () => {
    const variant = await CarVariant.findOne({ code: 'NEW-H-02' });
    const lucknow = await City.findOne({ name: 'Lucknow' });
    const delhi = await City.findOne({ name: 'Delhi NCR' });

    const lucknowPrice = await PricingEngine.calculateOnRoadPrice(variant!._id, lucknow!._id);
    const delhiPrice = await PricingEngine.calculateOnRoadPrice(variant!._id, delhi!._id);

    expect(lucknowPrice.available).toBe(true);
    expect(delhiPrice.available).toBe(true);
    // Delhi road tax rate is 12% vs Lucknow 10%
    expect(delhiPrice.data!.roadTaxRatePercent).toBe(12);
    expect(delhiPrice.data!.totalOnRoadPrice).toBeGreaterThan(lucknowPrice.data!.totalOnRoadPrice);
  });

  it('gracefully handles missing or expired pricing tables without hallucinating prices', async () => {
    // Model S LX in Kanpur is deliberately seeded with expired validity
    const variant = await CarVariant.findOne({ code: 'NEW-S-01' });
    const kanpur = await City.findOne({ name: 'Kanpur' });

    const result = await PricingEngine.calculateOnRoadPrice(variant!._id, kanpur!._id);
    expect(result.available).toBe(false);
    expect(result.message).toContain('Price currently unavailable');
  });

  it('accurately calculates EMI using reducing balance amortization formula', () => {
    // Principal: ₹10,00,000 | 9% annual interest | 60 months tenure
    const calculation = PricingEngine.calculateEMI(1000000, 9, 60);
    expect(calculation.monthlyEmi).toBe(20758); // Standard banking EMI
    expect(calculation.totalRepayment).toBe(20758 * 60);
    expect(calculation.totalInterest).toBe(20758 * 60 - 1000000);
  });
});

describe('2. Test-Drive Booking Engine & Conflict Prevention', () => {
  it('prevents double-booking for the same demo vehicle and time slot', async () => {
    const demo = await DemoVehicle.findOne({ isActive: true });
    const showroom = await Showroom.findById(demo!.showroomId);
    const variant = await CarVariant.findById(demo!.carVariantId);
    const date = '2026-11-20';
    const slot = '10:00 AM - 11:00 AM';

    // Clear any previous test bookings for this slot
    await TestDriveBooking.deleteMany({ demoVehicleId: demo!._id, bookingDate: date, timeSlot: slot });

    // First booking should succeed
    const booking1 = await BookingEngine.createBooking({
      customerName: 'Aarav Gupta',
      customerPhone: '9876543210',
      customerEmail: 'aarav@test.com',
      carModelId: demo!.carModelId.toString(),
      carVariantId: variant!._id.toString(),
      showroomId: showroom!._id.toString(),
      demoVehicleId: demo!._id.toString(),
      bookingDate: date,
      timeSlot: slot,
      consentGiven: true,
    });

    expect(booking1).toBeDefined();
    expect(booking1.bookingReference).toMatch(/^AV-TB-/);
    expect(booking1.status).toBe('CONFIRMED');

    // Second booking attempt on the SAME slot must throw Conflict
    await expect(
      BookingEngine.createBooking({
        customerName: 'Rohan Mehta',
        customerPhone: '9876543211',
        customerEmail: 'rohan@test.com',
        carModelId: demo!.carModelId.toString(),
        carVariantId: variant!._id.toString(),
        showroomId: showroom!._id.toString(),
        demoVehicleId: demo!._id.toString(),
        bookingDate: date,
        timeSlot: slot,
        consentGiven: true,
      })
    ).rejects.toThrow(/Conflict: This demo vehicle is already reserved/);
  });
});

describe('3. Automated Lead Assignment & SLA Engine', () => {
  it('routes new lead to consultant based on showroom and balances workload', async () => {
    const gomtiNagarShowroom = await Showroom.findOne({ name: 'Gomti Nagar' });
    const testLead = await Lead.create({
      customerName: 'Pooja Agarwal',
      customerPhone: '9839999999',
      customerEmail: 'pooja@test.com',
      preferredShowroom: gomtiNagarShowroom!._id,
      leadSource: 'Website',
      status: 'NEW',
      responseDeadline: new Date(Date.now() + 5 * 60 * 1000),
      consentGiven: true,
      consentTimestamp: new Date(),
      policyVersion: '1.0',
    });

    const assignment = await LeadAssignmentEngine.assignLead(
      testLead._id,
      gomtiNagarShowroom!._id,
      undefined,
      'SYSTEM_AUTO'
    );

    expect(assignment.assignedConsultantId).toBeDefined();

    const assignedUser = await User.findById(assignment.assignedConsultantId);
    expect(assignedUser).toBeDefined();
    expect(assignedUser!.assignedShowroom!.toString()).toBe(gomtiNagarShowroom!._id.toString());

    // Updated lead should have 5-minute SLA target
    const updatedLead = await Lead.findById(testLead._id);
    expect(updatedLead!.status).toBe('ASSIGNED');
    expect(updatedLead!.responseDeadline.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('4. AI Lead Intelligence Schema & Fallback Safety', () => {
  it('validates structured AI output conforming to strict JSON schema', () => {
    const validAIOutput = {
      summary: 'Customer is interested in Model H automatic for family weekend touring.',
      budget: '12-15 lakh',
      preferredModel: 'Model H',
      fuelPreference: 'Petrol',
      transmission: 'Automatic',
      purchaseTimeline: 'Within 30 days',
      intent: 'High',
      confidence: 0.93,
    };

    const validated = BuyerSummarySchema.parse(validAIOutput);
    expect(validated.preferredModel).toBe('Model H');
    expect(validated.intent).toBe('High');
    expect(validated.confidence).toBe(0.93);
  });

  it('rejects hallucinated or invalid schema fields', () => {
    const invalidOutput = {
      summary: 'Bad schema',
      intent: 'SuperHighUrgent', // Invalid enum
      confidence: 1.5, // Exceeds 1.0 limit
    };

    expect(() => BuyerSummarySchema.parse(invalidOutput)).toThrow();
  });

  it('runs deterministic fallback when AI key is unavailable', async () => {
    const fallback = new DeterministicFallbackProvider();
    const result = await fallback.summariseLead({
      customerName: 'Nitin Pandey',
      message: 'Looking for an automatic petrol SUV under 15 lakh immediately.',
    });

    expect(result.fuelPreference).toBe('Petrol');
    expect(result.transmission).toBe('Automatic');
    expect(result.provider).toBe('deterministic_fallback');
  });
});

describe('5. Authentication, DPDP Consent & Role Permissions', () => {
  it('authenticates admin with seeded demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@autoverse.demo', password: 'Admin@12345' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('enforces RBAC: forbids buyers from accessing admin dashboard metrics', async () => {
    // 1. Login as buyer
    const buyerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer@autoverse.demo', password: 'Buyer@12345' });

    const buyerToken = buyerLogin.body.token;

    // 2. Try to access Admin Dashboard
    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.message).toContain('Forbidden');
  });

  it('enforces DPDP consent: rejects enquiries without explicit customer consent', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({
        customerName: 'Anonymous Visitor',
        customerPhone: '9876543210',
        customerEmail: 'test@example.com',
        consentGiven: false, // Consent declined
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('consent is required');
  });
});

describe('6. Workshop Service Booking by Bay Capacity & DPDP Compliance', () => {
  it('correctly tracks workshop bay capacity and assigns sequential bay numbers', async () => {
    const workshop = await Workshop.findOne({ active: true });
    expect(workshop).toBeDefined();

    const bookingDate = '2026-11-25';
    const timeSlot = '09:00 AM - 10:30 AM';

    // Clear test bookings for this date and slot
    await ServiceBooking.deleteMany({ workshopId: workshop!._id, bookingDate, timeSlot });

    // Check available bays via API
    const slotRes = await request(app)
      .get(`/api/services/available-slots?workshopId=${workshop!._id}&date=${bookingDate}`);

    expect(slotRes.status).toBe(200);
    expect(slotRes.body.slots).toBeDefined();
    const targetSlot = slotRes.body.slots.find((s: any) => s.slot === timeSlot);
    expect(targetSlot.baysLeft).toBe(workshop!.baysCount);

    // Create service booking
    const bookingRes = await request(app)
      .post('/api/services')
      .send({
        workshopId: workshop!._id,
        customerName: 'Vivek Sharma',
        customerPhone: '9876501234',
        customerEmail: 'vivek@example.com',
        vehicleRegistrationNumber: 'UP32AB9999',
        vehicleModel: 'Model H (Sedan)',
        serviceType: 'Periodic Maintenance',
        bookingDate,
        timeSlot,
        consentGiven: true,
      });

    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.booking).toBeDefined();
    expect(bookingRes.body.booking.assignedBayNumber).toBe(1);
    expect(bookingRes.body.booking.bookingReference).toContain('AV-SB-');
  });

  it('rejects service booking when DPDP consent is omitted', async () => {
    const workshop = await Workshop.findOne({ active: true });
    const bookingRes = await request(app)
      .post('/api/services')
      .send({
        workshopId: workshop!._id,
        customerName: 'No Consent User',
        customerPhone: '9876501234',
        customerEmail: 'noconsent@example.com',
        vehicleRegistrationNumber: 'UP32XY0000',
        vehicleModel: 'Model C',
        bookingDate: '2026-11-25',
        timeSlot: '09:00 AM - 10:30 AM',
        consentGiven: false,
      });

    expect(bookingRes.status).toBe(400);
    expect(bookingRes.body.message).toContain('consent under DPDP is required');
  });
});

describe('7. AI Used-Car Price Band Suggestion (Used-Car Manager Role Isolation)', () => {
  it('generates statistically sound price band from model, year, and odometer wear', async () => {
    const provider = new DeterministicFallbackProvider();
    const result = await provider.suggestUsedCarPrice({
      modelName: 'Model H',
      manufacturingYear: 2023,
      kilometres: 35000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      ownershipCount: 1,
      conditionScore: 90,
    });

    expect(result.suggestedIdealPrice).toBeGreaterThan(700000);
    expect(result.suggestedMinPrice).toBeLessThan(result.suggestedIdealPrice);
    expect(result.suggestedMaxPrice).toBeGreaterThan(result.suggestedIdealPrice);
    expect(result.marketDemandIndex).toBe('High');
    expect(result.disclaimer).toContain('Used-Car Manager');
  });

  it('restricts AI price suggestion API to Admin/Used-Car Manager role', async () => {
    // Login as buyer
    const buyerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer@autoverse.demo', password: 'Buyer@12345' });

    const buyerToken = buyerLogin.body.token;

    // Buyer tries to call AI price band API
    const res = await request(app)
      .post('/api/ai/suggest-used-car-price')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        modelName: 'Model H',
        manufacturingYear: 2023,
        kilometres: 35000,
      });

    expect(res.status).toBe(403);
  });
});

describe('8. DMS Integration Daily CSV Exports', () => {
  it('exports daily sales CSV with correct headers and DPDP consent flags', async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@autoverse.demo', password: 'Admin@12345' });

    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .get('/api/admin/dms-export/sales')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('DMS_RECORD_REF');
    expect(res.text).toContain('CUSTOMER_NAME');
    expect(res.text).toContain('DPDP_CONSENT_VERIFIED');
  });

  it('exports daily service workshop CSV with bay numbers and job card references', async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@autoverse.demo', password: 'Admin@12345' });

    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .get('/api/admin/dms-export/service')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('DMS_JOB_CARD_REF');
    expect(res.text).toContain('BAY_NUMBER');
    expect(res.text).toContain('VEHICLE_REGISTRATION_NO');
  });
});

