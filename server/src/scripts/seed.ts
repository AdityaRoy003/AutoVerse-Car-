import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  CustomerProfile,
  CarModel,
  CarVariant,
  UsedCar,
  InspectionReport,
  City,
  Pricing,
  Showroom,
  Workshop,
  DemoVehicle,
  TestDriveSlot,
  TestDriveBooking,
  Lead,
  LeadAssignmentHistory,
  Offer,
  AuditLog,
} from '../models/index.js';

dotenv.config();

export async function seedDatabase() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    CustomerProfile.deleteMany({}),
    CarModel.deleteMany({}),
    CarVariant.deleteMany({}),
    UsedCar.deleteMany({}),
    InspectionReport.deleteMany({}),
    City.deleteMany({}),
    Pricing.deleteMany({}),
    Showroom.deleteMany({}),
    Workshop.deleteMany({}),
    DemoVehicle.deleteMany({}),
    TestDriveSlot.deleteMany({}),
    TestDriveBooking.deleteMany({}),
    Lead.deleteMany({}),
    LeadAssignmentHistory.deleteMany({}),
    Offer.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Seed Cities
  console.log('[Seed] Seeding Cities...');
  const cities = await City.create([
    { name: 'Lucknow', state: 'Uttar Pradesh', rtoCode: 'UP32', active: true },
    { name: 'Kanpur', state: 'Uttar Pradesh', rtoCode: 'UP78', active: true },
    { name: 'Delhi NCR', state: 'Delhi', rtoCode: 'DL01', active: true },
  ]);
  const lucknowCity = cities[0];
  const kanpurCity = cities[1];
  const delhiCity = cities[2];

  // 2. Seed Showrooms (Lucknow 3 Showrooms)
  console.log('[Seed] Seeding Showrooms...');
  const showrooms = await Showroom.create([
    {
      name: 'Lucknow Central',
      address: '24/B, Mahatma Gandhi Marg, Hazratganj, Lucknow, UP 226001',
      city: 'Lucknow',
      phone: '+91 522 2618900',
      email: 'central@autoverse.demo',
      operatingHours: { open: '09:30 AM', close: '08:00 PM', workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      geoCoordinates: { latitude: 26.8505, longitude: 80.9422 },
      active: true,
    },
    {
      name: 'Gomti Nagar',
      address: 'Plot 4, Vibhuti Khand, Behind Cyber Tower, Gomti Nagar, Lucknow, UP 226010',
      city: 'Lucknow',
      phone: '+91 522 4105200',
      email: 'gomtinagar@autoverse.demo',
      operatingHours: { open: '09:30 AM', close: '08:00 PM', workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      geoCoordinates: { latitude: 26.8628, longitude: 80.9995 },
      active: true,
    },
    {
      name: 'Alambagh',
      address: 'Metro Pillar 42, Kanpur - Lucknow Road, Alambagh, Lucknow, UP 226005',
      city: 'Lucknow',
      phone: '+91 522 2451300',
      email: 'alambagh@autoverse.demo',
      operatingHours: { open: '09:30 AM', close: '07:30 PM', workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      geoCoordinates: { latitude: 26.8082, longitude: 80.9028 },
      active: true,
    },
  ]);

  // 3. Seed Service Workshops (2 Workshops)
  console.log('[Seed] Seeding Workshops...');
  await Workshop.create([
    {
      name: 'Transport Nagar Central Mega Workshop',
      address: 'Sector E, Transport Nagar Industrial Area, Lucknow, UP 226012',
      city: 'Lucknow',
      phone: '+91 522 2439100',
      baysCount: 24,
      servicesOffered: ['Periodic Maintenance', 'Body & Paint Ultrasound Booth', 'Automated Wheel Alignment', 'EV Battery Diagnostics'],
      active: true,
    },
    {
      name: 'Amausi Express Service Hub',
      address: 'Near Amausi Airport Crossing, Kanpur Road, Lucknow, UP 226008',
      city: 'Lucknow',
      phone: '+91 522 2438800',
      baysCount: 16,
      servicesOffered: ['Quick 90-Min Service', 'Brake Disc Resurfacing', 'AC System Sterilization', 'Tire Replacement'],
      active: true,
    },
  ]);

  // 4. Seed New Car Models
  console.log('[Seed] Seeding Car Models...');
  const carModels = await CarModel.create([
    {
      name: 'Model H',
      slug: 'model-h',
      tagline: 'Bold Elegance Meets Turbocharged Command',
      brand: 'Autoverse Flagship',
      bodyType: 'SUV',
      startingPrice: 1095000,
      heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      overview: 'Engineered for commanding road presence and long-distance touring comfort. Model H integrates intelligent all-wheel dynamics with dual-screen luxury cockpit and Level-2 ADAS suite.',
      specifications: {
        engine: '1.5L VTEC Turbocharged Petrol Engine',
        displacementCc: 1498,
        maxPower: '158 bhp @ 5500 rpm',
        maxTorque: '253 Nm @ 1600-4500 rpm',
        fuelTypes: ['Petrol', 'Hybrid'],
        transmissions: ['Automatic', 'Manual'],
        mileageKmpl: 18.2,
        seatingCapacity: 5,
        bootSpaceLiters: 485,
        fuelTankCapacityLiters: 50,
      },
      safetyRating: 5,
      safetyFeatures: ['6 Airbags Standard', 'Level 2 ADAS (Auto Emergency Braking, Lane Keep Assist)', '360-Degree Camera', 'Electronic Stability Control', 'Hill Hold Assist'],
      availableColors: [
        { name: 'Radiant Red Metallic', hexCode: '#DC2626' },
        { name: 'Obsidian Black Pearl', hexCode: '#171717' },
        { name: 'Platinum White Metallic', hexCode: '#F8FAFC' },
        { name: 'Lunar Silver Metallic', hexCode: '#94A3B8' },
      ],
      featured: true,
      active: true,
    },
    {
      name: 'Model C',
      slug: 'model-c',
      tagline: 'Sophistication Reimagined for the Modern Executive',
      brand: 'Autoverse Luxury',
      bodyType: 'Sedan',
      startingPrice: 1145000,
      heroImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      ],
      overview: 'Aerodynamic executive sedan offering ultra-plush rear lounge seats, whisper-quiet cabin acoustics, and seamless connected tech.',
      specifications: {
        engine: '1.5L i-DTEC Clean Diesel / 1.5L Petrol',
        displacementCc: 1498,
        maxPower: '121 bhp @ 6600 rpm',
        maxTorque: '200 Nm @ 1750 rpm',
        fuelTypes: ['Diesel', 'Petrol'],
        transmissions: ['Manual', 'Automatic'],
        mileageKmpl: 24.1,
        seatingCapacity: 5,
        bootSpaceLiters: 506,
        fuelTankCapacityLiters: 45,
      },
      safetyRating: 5,
      safetyFeatures: ['6 Airbags', 'Tyre Pressure Monitoring (TPMS)', 'Brake Assist', 'Multi-Angle Rearview Camera'],
      availableColors: [
        { name: 'Golden Brown Metallic', hexCode: '#78350F' },
        { name: 'Meteoroid Grey Metallic', hexCode: '#475569' },
        { name: 'Lunar Silver Metallic', hexCode: '#CBD5E1' },
      ],
      featured: true,
      active: true,
    },
    {
      name: 'Model S',
      slug: 'model-s',
      tagline: 'Agile Urban Performance with Unmatched Fuel Economy',
      brand: 'Autoverse Urban',
      bodyType: 'Hatchback',
      startingPrice: 685000,
      heroImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
      ],
      overview: 'The quintessential city hatchback, delivering swift acceleration, effortless tight-space parking, and cutting-edge touchscreen infotainment.',
      specifications: {
        engine: '1.2L DualJet Dual VVT Petrol',
        displacementCc: 1197,
        maxPower: '89 bhp @ 6000 rpm',
        maxTorque: '113 Nm @ 4400 rpm',
        fuelTypes: ['Petrol', 'CNG'],
        transmissions: ['Manual', 'Automatic'],
        mileageKmpl: 22.4,
        seatingCapacity: 5,
        bootSpaceLiters: 318,
        fuelTankCapacityLiters: 37,
      },
      safetyRating: 4,
      safetyFeatures: ['Dual Front Airbags', 'ABS with EBD', 'Reverse Parking Sensors', 'Speed Sensing Auto Door Locks'],
      availableColors: [
        { name: 'Sporty Red', hexCode: '#B91C1C' },
        { name: 'Pearl Arctic White', hexCode: '#FFFFFF' },
        { name: 'Magma Grey', hexCode: '#52525B' },
      ],
      featured: false,
      active: true,
    },
    {
      name: 'Model E Electric',
      slug: 'model-e',
      tagline: 'Pure Electric Velocity with 520 km Real-World Range',
      brand: 'Autoverse Electric',
      bodyType: 'EV',
      startingPrice: 1950000,
      heroImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      ],
      overview: 'Zero emissions, instant 310 Nm torque delivery, and 150 kW ultra-fast DC charging that juices from 10% to 80% in 32 minutes.',
      specifications: {
        engine: 'Permanent Magnet Synchronous AC Motor (60 kWh Battery)',
        displacementCc: 0,
        maxPower: '201 bhp',
        maxTorque: '310 Nm Instantaneous',
        fuelTypes: ['Electric'],
        transmissions: ['Automatic'],
        mileageKmpl: 0,
        seatingCapacity: 5,
        bootSpaceLiters: 450,
        fuelTankCapacityLiters: 0,
      },
      safetyRating: 5,
      safetyFeatures: ['7 Airbags with Driver Knee Bag', 'IP67 Ingress Rated Battery Enclosure', 'Pedestrian Acoustic Warning', 'Blind Spot Detection'],
      availableColors: [
        { name: 'Cyber Blue Metallic', hexCode: '#0284C7' },
        { name: 'Glacier White', hexCode: '#F1F5F9' },
        { name: 'Stealth Grey', hexCode: '#334155' },
      ],
      featured: true,
      active: true,
    },
  ]);

  const modelH = carModels[0];
  const modelC = carModels[1];
  const modelS = carModels[2];
  const modelE = carModels[3];

  // 5. Seed Car Variants (Includes NEW-H-02 from client brief)
  console.log('[Seed] Seeding Car Variants...');
  const variants = await CarVariant.create([
    // Required sample: NEW-H-02 Model H ZX Automatic ₹12,45,000
    {
      carModelId: modelH._id,
      name: 'ZX Automatic',
      code: 'NEW-H-02',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      exShowroomPrice: 1245000,
      keyFeatures: ['Paddle Shifters', 'Panoramic Sunroof', 'Level 2 ADAS', '10.25-inch Touchscreen HD Infotainment', 'Ventilated Leatherette Front Seats'],
      isAvailable: true,
    },
    {
      carModelId: modelH._id,
      name: 'VX Manual',
      code: 'NEW-H-01',
      fuelType: 'Petrol',
      transmission: 'Manual',
      exShowroomPrice: 1095000,
      keyFeatures: ['Electric Sunroof', 'Auto AC', 'Push Button Start', 'Alloy Wheels 16-inch'],
      isAvailable: true,
    },
    {
      carModelId: modelH._id,
      name: 'ZX Strong Hybrid e:HEV',
      code: 'NEW-H-03',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      exShowroomPrice: 1585000,
      keyFeatures: ['Dual Motor Hybrid Synergy Drive', '27.1 km/l Fuel Economy', 'Electric Parking Brake with Auto Hold', 'Acoustic Windshield'],
      isAvailable: true,
    },
    {
      carModelId: modelC._id,
      name: 'VX Manual Diesel',
      code: 'NEW-C-01',
      fuelType: 'Diesel',
      transmission: 'Manual',
      exShowroomPrice: 1145000,
      keyFeatures: ['1.5L Clean Diesel', 'Smart Keyless Entry', 'LED Projector Headlamps', 'Cruise Control'],
      isAvailable: true,
    },
    {
      carModelId: modelC._id,
      name: 'ZX Automatic Petrol',
      code: 'NEW-C-02',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      exShowroomPrice: 1320000,
      keyFeatures: ['7-Speed CVT with Step Up Shift Logic', 'One-Touch Electric Sunroof', 'LaneWatch Camera', '8-Speaker Premium Audio'],
      isAvailable: true,
    },
    {
      carModelId: modelS._id,
      name: 'LX Manual',
      code: 'NEW-S-01',
      fuelType: 'Petrol',
      transmission: 'Manual',
      exShowroomPrice: 685000,
      keyFeatures: ['Power Steering', 'Front Power Windows', 'ABS with EBD', 'High Speed Alert'],
      isAvailable: true,
    },
    {
      carModelId: modelS._id,
      name: 'ZXI+ Automatic AMT',
      code: 'NEW-S-02',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      exShowroomPrice: 840000,
      keyFeatures: ['SmartPlay Pro+ 9-inch Display', 'Wireless Apple CarPlay & Android Auto', 'Keyless Push Start', 'Diamond Cut Alloy Wheels'],
      isAvailable: true,
    },
    {
      carModelId: modelE._id,
      name: 'Long Range Prestige',
      code: 'NEW-E-01',
      fuelType: 'Electric',
      transmission: 'Automatic',
      exShowroomPrice: 1950000,
      keyFeatures: ['60 kWh Lithium Iron Phosphate Pack', '520 km ARAI Range', 'Vehicle-to-Load (V2L) Power Outlet', 'Panoramic Glass Roof'],
      isAvailable: true,
    },
  ]);

  const variantModelHZX = variants[0]; // NEW-H-02
  const variantModelHVX = variants[1];
  const variantModelC = variants[3];

  // 6. Seed Demo Accounts
  console.log('[Seed] Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
  const consultantPasswordHash = await bcrypt.hash('Sales@12345', salt);
  const buyerPasswordHash = await bcrypt.hash('Buyer@12345', salt);

  const adminUser = await User.create({
    name: 'Dealership General Manager',
    email: 'admin@autoverse.demo',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    phone: '+91 98765 00001',
    assignedShowroom: showrooms[0]._id,
    active: true,
  });

  const consultant1 = await User.create({
    name: 'Rajesh Sharma',
    email: 'consultant@autoverse.demo',
    passwordHash: consultantPasswordHash,
    role: 'SALES_CONSULTANT',
    phone: '+91 98765 00002',
    assignedShowroom: showrooms[0]._id, // Lucknow Central
    supportedModels: [modelH._id, modelC._id],
    active: true,
  });

  const consultant2 = await User.create({
    name: 'Priya Verma',
    email: 'priya.verma@autoverse.demo',
    passwordHash: consultantPasswordHash,
    role: 'SALES_CONSULTANT',
    phone: '+91 98765 00003',
    assignedShowroom: showrooms[1]._id, // Gomti Nagar
    supportedModels: [modelH._id, modelS._id, modelE._id],
    active: true,
  });

  const consultant3 = await User.create({
    name: 'Amit Patel',
    email: 'amit.patel@autoverse.demo',
    passwordHash: consultantPasswordHash,
    role: 'SALES_CONSULTANT',
    phone: '+91 98765 00004',
    assignedShowroom: showrooms[2]._id, // Alambagh
    supportedModels: [modelC._id, modelS._id],
    active: true,
  });

  const buyerUser = await User.create({
    name: 'Aditya Srivastava',
    email: 'buyer@autoverse.demo',
    passwordHash: buyerPasswordHash,
    role: 'BUYER',
    phone: '+91 98765 11111',
    active: true,
  });

  await CustomerProfile.create({
    userId: buyerUser._id,
    alternatePhone: '+91 98765 22222',
    address: 'Flat 402, Shalimar Grand Residences, Gomti Nagar Extension',
    city: 'Lucknow',
    preferredShowroom: showrooms[1]._id,
    marketingOptIn: true,
    consentHistory: [
      {
        type: 'PRIVACY_POLICY',
        consentGiven: true,
        consentedAt: new Date(),
        policyVersion: '1.0',
        ipAddress: '127.0.0.1',
      },
    ],
  });

  // 7. Seed City-wise Pricing Tables for Variants
  console.log('[Seed] Seeding City-wise Pricing Tables...');
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const pastYear = new Date();
  pastYear.setFullYear(pastYear.getFullYear() - 1);

  // Lucknow Pricing for NEW-H-02 (ZX Auto)
  // ExShowroom: 12,45,000 | Road Tax: 10% (1,24,500) + Fixed 2000 | Insurance: 48,000 | Accessories: 15,000 | Reg: 1,500 | Other: 2,500
  // On-road = 1245000 + 126500 + 48000 + 15000 + 1500 + 2500 = 14,38,500
  await Pricing.create([
    {
      carVariantId: variantModelHZX._id,
      cityId: lucknowCity._id,
      exShowroomPrice: 1245000,
      roadTaxRatePercent: 10,
      roadTaxFixed: 2000,
      insuranceAmount: 48000,
      accessoriesAmount: 15000,
      registrationCharges: 1500,
      otherCharges: 2500,
      validFrom: new Date('2026-01-01'),
      validUntil: nextYear,
      isActive: true,
      createdBy: adminUser._id,
      auditNotes: 'Annual Lucknow UP32 official RTO tariff applied.',
    },
    {
      carVariantId: variantModelHZX._id,
      cityId: kanpurCity._id,
      exShowroomPrice: 1245000,
      roadTaxRatePercent: 10,
      roadTaxFixed: 2500,
      insuranceAmount: 48000,
      accessoriesAmount: 12000,
      registrationCharges: 1600,
      otherCharges: 2500,
      validFrom: new Date('2026-01-01'),
      validUntil: nextYear,
      isActive: true,
      createdBy: adminUser._id,
      auditNotes: 'Kanpur UP78 district RTO tariff.',
    },
    {
      carVariantId: variantModelHZX._id,
      cityId: delhiCity._id,
      exShowroomPrice: 1245000,
      roadTaxRatePercent: 12,
      roadTaxFixed: 4000,
      insuranceAmount: 51000,
      accessoriesAmount: 10000,
      registrationCharges: 2200,
      otherCharges: 3000,
      validFrom: new Date('2026-01-01'),
      validUntil: nextYear,
      isActive: true,
      createdBy: adminUser._id,
      auditNotes: 'Delhi DL01 transport department tax slab.',
    },
    // Seed pricing for other variants in Lucknow
    {
      carVariantId: variantModelHVX._id,
      cityId: lucknowCity._id,
      exShowroomPrice: 1095000,
      roadTaxRatePercent: 9.5,
      roadTaxFixed: 1500,
      insuranceAmount: 42000,
      accessoriesAmount: 12000,
      registrationCharges: 1500,
      otherCharges: 2000,
      validFrom: new Date('2026-01-01'),
      validUntil: nextYear,
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      carVariantId: variantModelC._id,
      cityId: lucknowCity._id,
      exShowroomPrice: 1145000,
      roadTaxRatePercent: 10.5,
      roadTaxFixed: 2000,
      insuranceAmount: 45000,
      accessoriesAmount: 14000,
      registrationCharges: 1500,
      otherCharges: 2000,
      validFrom: new Date('2026-01-01'),
      validUntil: nextYear,
      isActive: true,
      createdBy: adminUser._id,
    },
    // Deliberately expired pricing record for test verification
    {
      carVariantId: variants[5]._id, // Model S LX
      cityId: kanpurCity._id,
      exShowroomPrice: 685000,
      roadTaxRatePercent: 8,
      roadTaxFixed: 1000,
      insuranceAmount: 28000,
      accessoriesAmount: 5000,
      registrationCharges: 1200,
      otherCharges: 1500,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'), // EXPIRED
      isActive: true,
      createdBy: adminUser._id,
      auditNotes: 'Expired historical 2024 promotional pricing.',
    },
  ]);

  // 8. Seed Demo Vehicles for Showrooms (5 or more demo cars)
  console.log('[Seed] Seeding Demo Vehicles...');
  const demoVehicles = await DemoVehicle.create([
    {
      showroomId: showrooms[0]._id, // Lucknow Central
      carModelId: modelH._id,
      carVariantId: variantModelHZX._id,
      registrationNumber: 'UP32DV0011',
      color: 'Radiant Red Metallic',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      isActive: true,
      notes: 'Main executive test-drive vehicle with sunroof',
    },
    {
      showroomId: showrooms[0]._id, // Lucknow Central
      carModelId: modelC._id,
      carVariantId: variantModelC._id,
      registrationNumber: 'UP32DV0012',
      color: 'Golden Brown Metallic',
      fuelType: 'Diesel',
      transmission: 'Manual',
      isActive: true,
      notes: 'City executive diesel demo vehicle',
    },
    {
      showroomId: showrooms[1]._id, // Gomti Nagar
      carModelId: modelH._id,
      carVariantId: variantModelHZX._id,
      registrationNumber: 'UP32DV0021',
      color: 'Obsidian Black Pearl',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      isActive: true,
      notes: 'Equipped with ADAS demonstration kit',
    },
    {
      showroomId: showrooms[1]._id, // Gomti Nagar
      carModelId: modelE._id,
      carVariantId: variants[7]._id,
      registrationNumber: 'UP32DV0022',
      color: 'Cyber Blue Metallic',
      fuelType: 'Electric',
      transmission: 'Automatic',
      isActive: true,
      notes: 'Dedicated EV demo car with fast charger demonstration',
    },
    {
      showroomId: showrooms[2]._id, // Alambagh
      carModelId: modelS._id,
      carVariantId: variants[6]._id,
      registrationNumber: 'UP32DV0031',
      color: 'Sporty Red',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      isActive: true,
      notes: 'Urban city demo vehicle',
    },
    {
      showroomId: showrooms[2]._id, // Alambagh
      carModelId: modelH._id,
      carVariantId: variantModelHVX._id,
      registrationNumber: 'UP32DV0032',
      color: 'Platinum White Metallic',
      fuelType: 'Petrol',
      transmission: 'Manual',
      isActive: true,
      notes: 'Manual transmission demo SUV',
    },
  ]);

  // 9. Seed Test-Drive Slots & Bookings
  console.log('[Seed] Seeding Test Drive Slots & Bookings...');
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // Booking 1 (Buyer's confirmed booking)
  await TestDriveBooking.create({
    bookingReference: 'AV-TB-202611-9281',
    buyerId: buyerUser._id,
    customerName: buyerUser.name,
    customerPhone: buyerUser.phone!,
    customerEmail: buyerUser.email,
    carModelId: modelH._id,
    carVariantId: variantModelHZX._id,
    showroomId: showrooms[0]._id,
    demoVehicleId: demoVehicles[0]._id,
    bookingDate: tomorrowStr,
    timeSlot: '11:30 AM - 12:30 PM',
    status: 'CONFIRMED',
    consentGiven: true,
    consentTimestamp: new Date(),
    policyVersion: '1.0',
    pricingSnapshot: {
      exShowroomPrice: 1245000,
      onRoadPrice: 1438500,
      cityId: lucknowCity._id,
      cityName: 'Lucknow',
      calculatedAt: new Date(),
    },
    notes: 'Customer requested 30-minute highway run to test ADAS cruise control.',
  });

  // 10. Seed Certified Used Cars (8 or more cars, including UC-1182 & UC-1190)
  console.log('[Seed] Seeding Certified Used Cars & 150-Point Inspection Reports...');
  const usedCarData = [
    {
      stockId: 'UC-1182',
      modelName: 'Model C',
      variantName: 'VX Diesel Manual',
      bodyType: 'Sedan',
      manufacturingYear: 2022,
      kilometres: 41200,
      fuelType: 'Diesel',
      transmission: 'Manual',
      ownershipCount: 1,
      askingPrice: 845000,
      registrationNumber: 'UP32BC8812',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Single Owner', 'Dealership Maintained', 'Rear Camera', 'Cruise Control', 'Touchscreen'],
    },
    {
      stockId: 'UC-1190',
      modelName: 'Model S',
      variantName: 'LX Petrol Manual',
      bodyType: 'Hatchback',
      manufacturingYear: 2021,
      kilometres: 58600,
      fuelType: 'Petrol',
      transmission: 'Manual',
      ownershipCount: 2,
      askingPrice: 512000,
      registrationNumber: 'UP32EF4419',
      city: 'Lucknow',
      status: 'Booked',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Dual Airbags', 'Kenwood Audio System', 'Fresh Michelin Tyres', 'Insurance Valid Till Oct 2027'],
    },
    {
      stockId: 'UC-1205',
      modelName: 'Model H',
      variantName: 'ZX Automatic Turbo',
      bodyType: 'SUV',
      manufacturingYear: 2023,
      kilometres: 19800,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      ownershipCount: 1,
      askingPrice: 1125000,
      registrationNumber: 'UP32GH9901',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Certified Pre-Owned', '1 Year Extended Warranty', 'Panoramic Sunroof', 'Ventilated Seats'],
    },
    {
      stockId: 'UC-1210',
      modelName: 'Model C',
      variantName: 'ZX CVT Petrol',
      bodyType: 'Sedan',
      manufacturingYear: 2020,
      kilometres: 64000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      ownershipCount: 1,
      askingPrice: 790000,
      registrationNumber: 'UP32KL3310',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Full Service Record at Autoverse Hazratganj', 'Paddle Shifters', 'Sunroof'],
    },
    {
      stockId: 'UC-1222',
      modelName: 'Model S',
      variantName: 'ZXI AMT Automatic',
      bodyType: 'Hatchback',
      manufacturingYear: 2022,
      kilometres: 28400,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      ownershipCount: 1,
      askingPrice: 660000,
      registrationNumber: 'UP32MN7722',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Alloy Wheels', 'Push Button Start', 'Factory Painted Magma Grey', 'Zero Depreciation Insurance'],
    },
    {
      stockId: 'UC-1234',
      modelName: 'Model E Electric',
      variantName: 'Prestige 60kWh',
      bodyType: 'EV',
      manufacturingYear: 2023,
      kilometres: 14200,
      fuelType: 'Electric',
      transmission: 'Automatic',
      ownershipCount: 1,
      askingPrice: 1690000,
      registrationNumber: 'UP32EV8834',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Battery Health 98.4%', '7.2kW AC Wallbox Charger Included', '7 Years Motor Warranty Active'],
    },
    {
      stockId: 'UC-1240',
      modelName: 'Model H',
      variantName: 'VX Manual Petrol',
      bodyType: 'SUV',
      manufacturingYear: 2021,
      kilometres: 49500,
      fuelType: 'Petrol',
      transmission: 'Manual',
      ownershipCount: 1,
      askingPrice: 910000,
      registrationNumber: 'UP32PQ5540',
      city: 'Lucknow',
      status: 'Available',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Clean Title', 'Non-Accidental Ultrasound Verified', 'All Original Panels'],
    },
    {
      stockId: 'UC-1255',
      modelName: 'Model C',
      variantName: 'VX Diesel Manual',
      bodyType: 'Sedan',
      manufacturingYear: 2019,
      kilometres: 76000,
      fuelType: 'Diesel',
      transmission: 'Manual',
      ownershipCount: 2,
      askingPrice: 625000,
      registrationNumber: 'UP32RS1155',
      city: 'Lucknow',
      status: 'Sold',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Sold to verified buyer', 'Recently serviced at Transport Nagar Workshop'],
    },
  ];

  for (const car of usedCarData) {
    const rawReg = car.registrationNumber;
    const masked = `${rawReg.slice(0, 6)}****`;

    const inspection = await InspectionReport.create({
      usedCarStockId: car.stockId,
      inspectionDate: new Date('2026-02-15'),
      inspectorName: 'Sanjay Awasthi (Lead Certified Evaluator)',
      overallRatingPoints: 144,
      exterior: {
        rating: 4.8,
        comments: 'Original paint depth measured between 95 to 110 microns. Minor 2cm scratch on lower rear valence touched up with OEM paint.',
      },
      interior: {
        rating: 4.9,
        comments: 'Non-smoker vehicle. Headliner spotless, instrument binnacle clear, climate control airflow chilled to 5.2°C.',
      },
      engineTransmission: {
        rating: 5.0,
        comments: 'Dyno power output 99% of factory specification. Cold start test passed with clean emission profile.',
      },
      tyresBrakes: {
        rating: 4.7,
        comments: 'Remaining tyre tread depth: Front 5.8mm, Rear 6.4mm. Brake pads measured at 82% life.',
        tyreLifePercent: 82,
        brakePadLifePercent: 80,
      },
      electricals: {
        rating: 5.0,
        comments: 'All 4 power windows, electric sunroof, alternator charging rate (14.2V), and starter motor verified.',
      },
      accidentHistory: {
        hasAccident: false,
        details: 'Zero insurance accident claims detected via nationwide VAHAN database verification.',
      },
      serviceHistoryAvailable: true,
      status: 'Passed',
    });

    await UsedCar.create({
      ...car,
      registrationNumber: rawReg,
      maskedRegistration: masked,
      showroomId: showrooms[0]._id,
      inspectionReportId: inspection._id,
      certifiedByDealership: true,
    });
  }

  // 11. Seed 10 or more Realistic Leads
  console.log('[Seed] Seeding 10+ Leads & AI Summaries...');
  const sampleLeads = [
    {
      customerName: 'Vikramaditya Singhania',
      customerPhone: '9839012345',
      customerEmail: 'vikram.singhania@gmail.com',
      interestedModelId: modelH._id,
      budgetRange: '12-15 Lakh',
      preferredShowroom: showrooms[0]._id, // Lucknow Central
      assignedConsultantId: consultant1._id,
      leadSource: 'Website',
      status: 'ASSIGNED',
      responseDeadline: new Date(Date.now() + 3 * 60 * 1000), // Active 3 mins remaining
      message: 'Hi, I am looking for an automatic SUV under 15 lakh. I want to purchase within one month for daily commute between Gomti Nagar and Hazratganj.',
      aiSummary: {
        summary: 'Customer is looking for an automatic SUV within 12-15 Lakh for urban daily commute.',
        budget: '12-15 lakh',
        preferredModel: 'Model H',
        fuelPreference: 'Petrol',
        transmission: 'Automatic',
        purchaseTimeline: 'Within 30 days',
        intent: 'High',
        confidence: 0.94,
        needsReview: false,
        provider: 'google_gemini',
        generatedAt: new Date(),
      },
      aiReplyDraft: {
        draft: 'Dear Vikramaditya,\n\nThank you for reaching out to Autoverse Lucknow! The Model H ZX Automatic fits your 12-15 Lakh budget seamlessly, offering smooth paddle-shift city driving and commanding visibility. Would you be open to an executive test drive at our Hazratganj showroom tomorrow at 11:30 AM?\n\nWarm regards,\nRajesh Sharma\nAutoverse Dealership, Lucknow',
        confidence: 0.92,
        needsReview: false,
        provider: 'google_gemini',
        generatedAt: new Date(),
        isApproved: false,
        isSent: false,
      },
    },
    {
      customerName: 'Ananya Deshmukh',
      customerPhone: '9839023456',
      customerEmail: 'ananya.deshmukh@yahoo.co.in',
      interestedModelId: modelC._id,
      budgetRange: '11-13 Lakh',
      preferredShowroom: showrooms[1]._id, // Gomti Nagar
      assignedConsultantId: consultant2._id,
      leadSource: 'Website',
      status: 'NEW',
      responseDeadline: new Date(Date.now() - 8 * 60 * 1000), // OVERDUE by 8 mins!
      message: 'Interested in the Model C VX diesel variant. Need details on road tax and on-road quotation for Lucknow registration.',
      aiSummary: {
        summary: 'Buyer requesting diesel sedan quotation and road tax breakdown for Lucknow registration.',
        budget: '11-13 lakh',
        preferredModel: 'Model C',
        fuelPreference: 'Diesel',
        transmission: 'Manual',
        purchaseTimeline: 'Within 30 days',
        intent: 'High',
        confidence: 0.91,
        needsReview: false,
        provider: 'google_gemini',
        generatedAt: new Date(),
      },
      aiReplyDraft: {
        draft: 'Dear Ananya,\n\nThank you for contacting Autoverse Gomti Nagar. I have compiled the complete Lucknow RTO road tax and on-road price breakup for the Model C VX Diesel. Shall I share the official quotation with you over email, or schedule a showroom walkthrough this afternoon?\n\nWarm regards,\nPriya Verma\nAutoverse Dealership, Lucknow',
        confidence: 0.91,
        needsReview: false,
        provider: 'google_gemini',
        generatedAt: new Date(),
        isApproved: false,
        isSent: false,
      },
    },
    {
      customerName: 'Mohammad Farooq',
      customerPhone: '9839034567',
      customerEmail: 'mfarooq.lucknow@outlook.com',
      interestedModelId: modelE._id,
      budgetRange: '18-21 Lakh',
      preferredShowroom: showrooms[1]._id,
      assignedConsultantId: consultant2._id,
      leadSource: 'Website',
      status: 'CONTACTED',
      responseDeadline: new Date(Date.now() - 60 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 50 * 60 * 1000),
      message: 'Want to know about home charging wallbox installation and subsidy on Model E Electric in Uttar Pradesh.',
      notes: [
        {
          note: 'Called client at 11:15 AM. Discussed UP EV road tax exemption and 7.2 kW charger survey at his Gomti Nagar villa.',
          authorId: consultant2._id,
          authorName: 'Priya Verma',
          createdAt: new Date(),
        },
      ],
    },
    {
      customerName: 'Sunil Bajpai',
      customerPhone: '9839045678',
      customerEmail: 'bajpai.sunil@gmail.com',
      interestedModelId: modelS._id,
      budgetRange: '6-8 Lakh',
      preferredShowroom: showrooms[2]._id, // Alambagh
      assignedConsultantId: consultant3._id,
      leadSource: 'Walk-in',
      status: 'QUALIFIED',
      responseDeadline: new Date(Date.now() - 120 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 110 * 60 * 1000),
      message: 'Looking for a second car for family city runabout in Alambagh.',
    },
    {
      customerName: 'Kavita Mehrotra',
      customerPhone: '9839056789',
      customerEmail: 'kavita.m@rediffmail.com',
      interestedModelId: modelH._id,
      budgetRange: '15-18 Lakh',
      preferredShowroom: showrooms[0]._id,
      assignedConsultantId: consultant1._id,
      leadSource: 'Test-drive request',
      status: 'CONVERTED',
      responseDeadline: new Date(Date.now() - 240 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 235 * 60 * 1000),
      message: 'Booked test drive for Model H ZX e:HEV Hybrid. Finalized booking token.',
    },
    {
      customerName: 'Gaurav Tandon',
      customerPhone: '9839067890',
      customerEmail: 'gtandon@techup.in',
      budgetRange: '8-10 Lakh',
      preferredShowroom: showrooms[0]._id,
      assignedConsultantId: consultant1._id,
      leadSource: 'Used-car enquiry',
      status: 'CONTACTED',
      responseDeadline: new Date(Date.now() - 30 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 22 * 60 * 1000),
      message: 'Inquiring about certified used Model C VX stock ID UC-1182.',
    },
    {
      customerName: 'Ritu Saxena',
      customerPhone: '9839078901',
      customerEmail: 'ritu.saxena@live.com',
      interestedModelId: modelH._id,
      budgetRange: '13-16 Lakh',
      preferredShowroom: showrooms[1]._id,
      assignedConsultantId: consultant2._id,
      leadSource: 'Portal CSV import',
      status: 'NEW',
      responseDeadline: new Date(Date.now() + 4 * 60 * 1000),
      message: 'CarDekho portal lead: Interested in Automatic SUV, ready to exchange 2018 Swift.',
    },
    {
      customerName: 'Dr. Alok Tripathi',
      customerPhone: '9839089012',
      customerEmail: 'dr.tripathi@sgpgi.ac.in',
      interestedModelId: modelC._id,
      budgetRange: '12-14 Lakh',
      preferredShowroom: showrooms[2]._id,
      assignedConsultantId: consultant3._id,
      leadSource: 'Website',
      status: 'FOLLOW_UP',
      responseDeadline: new Date(Date.now() - 180 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 170 * 60 * 1000),
      message: 'Requested comparison between Model C ZX CVT and rivals.',
    },
    {
      customerName: 'Deepak Agarwal',
      customerPhone: '9839090123',
      customerEmail: 'd.agarwal@lucknowtraders.com',
      interestedModelId: modelS._id,
      budgetRange: '7-9 Lakh',
      preferredShowroom: showrooms[2]._id,
      assignedConsultantId: consultant3._id,
      leadSource: 'Website',
      status: 'LOST',
      responseDeadline: new Date(Date.now() - 500 * 60 * 1000),
      firstContactedAt: new Date(Date.now() - 480 * 60 * 1000),
      message: 'Client decided to defer purchase until Diwali.',
    },
    {
      customerName: 'Meenakshi Chandra',
      customerPhone: '9839101234',
      customerEmail: 'meenakshi.chandra@tcs.com',
      interestedModelId: modelE._id,
      budgetRange: '20 Lakh',
      preferredShowroom: showrooms[1]._id,
      assignedConsultantId: consultant2._id,
      leadSource: 'Website',
      status: 'NEW',
      responseDeadline: new Date(Date.now() + 2 * 60 * 1000), // 2 mins remaining
      message: 'Looking for high-range EV for office travel to Lucknow IT City on Sultanpur Road.',
    },
  ];

  for (const l of sampleLeads) {
    const lead = await Lead.create({
      ...l,
      consentGiven: true,
      consentTimestamp: new Date(),
      policyVersion: '1.0',
    });

    if (l.assignedConsultantId) {
      await LeadAssignmentHistory.create({
        leadId: lead._id,
        assignedTo: l.assignedConsultantId,
        assignedBy: 'SYSTEM_AUTO',
        reason: 'Automated initial assignment based on showroom roster and active lead workload.',
        assignedAt: new Date(),
      });
    }
  }

  // 12. Seed Promotional Offers
  console.log('[Seed] Seeding Offers...');
  await Offer.create([
    {
      title: 'Grand Lucknow Automotive Festival',
      description: 'Zero processing fee, complimentary 5-year extended warranty package, and corporate exchange bonus up to ₹50,000 on Model H & Model C.',
      discountAmount: 50000,
      bannerImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      badgeText: 'Limited Festive Offer',
      validTill: nextYear,
      applicableModels: [modelH._id, modelC._id],
      active: true,
    },
    {
      title: 'Green Mobility EV Road Tax Subsidy',
      description: '100% road tax waiver and complimentary 7.2 kW home fast charger installation for all Model E Electric reservations this month.',
      discountAmount: 120000,
      bannerImageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      badgeText: 'Govt. EV Incentive',
      validTill: nextYear,
      applicableModels: [modelE._id],
      active: true,
    },
  ]);

  // 13. Seed Initial Audit Log
  console.log('[Seed] Seeding Initial Audit Log...');
  await AuditLog.create({
    userId: adminUser._id,
    userName: adminUser.name,
    action: 'INITIALIZE_SYSTEM_SEED',
    entityType: 'SHOWROOM',
    entityId: showrooms[0]._id.toString(),
    newValues: {
      seededModels: carModels.length,
      seededVariants: variants.length,
      seededUsedCars: usedCarData.length,
      seededDemoVehicles: demoVehicles.length,
      seededLeads: sampleLeads.length,
    },
    timestamp: new Date(),
  });

  console.log('========================================================');
  console.log('✅ AUTOVERSE DATABASE SEEDED SUCCESSFULLY');
  console.log('--------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  Admin:       admin@autoverse.demo      / Admin@12345');
  console.log('  Consultant:  consultant@autoverse.demo / Sales@12345');
  console.log('  Buyer:       buyer@autoverse.demo      / Buyer@12345');
  console.log('--------------------------------------------------------');
  console.log(`  Showrooms:     ${showrooms.length}`);
  console.log(`  Car Models:    ${carModels.length}`);
  console.log(`  Variants:      ${variants.length}`);
  console.log(`  Demo Vehicles: ${demoVehicles.length}`);
  console.log(`  Used Cars:     ${usedCarData.length}`);
  console.log(`  Leads:         ${sampleLeads.length}`);
  console.log('========================================================');

  await disconnectDB();
}

// Execute when invoked directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}

