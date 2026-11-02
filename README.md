# AUTOVERSE – Premium Car Dealership Management & Booking Platform

> **Tagline:** Discover Your Drive.  
> **Dealership Client:** Company A, Authorised Passenger Car Dealership (Lucknow, UP, India)  
> **Operating Footprint:** 3 Showrooms • 2 Mega Service Workshops • 1 Certified Pre-Owned Yard • 340 Employees

---

## 🚗 Project Introduction
**AUTOVERSE** is a full-stack, enterprise-grade digital automotive dealership platform engineered to eliminate operational bottlenecks in passenger car sales and certified pre-owned management.

Designed specifically for Company A's multi-facility footprint in Lucknow, the platform replaces fragmented spreadsheets, manual telephone scheduling, and unverified WhatsApp inventory with:
1. **Mathematical City-Wise On-Road Pricing Engine**: RTO road tax and registration charges computed strictly from admin-controlled MongoDB tariffs with full component breakdown. Official prices are **never** estimated by AI.
2. **Conflict-Free Test Drive Booking Wizard**: Real-time demo car availability checking with atomic slot reservation to eliminate double-booking.
3. **60-Second Authorized Service Booking by Bay Capacity**: Live bay reservation across Lucknow's 40 workshop bays (Amausi 16 bays, Transport Nagar 24 bays). Eliminates unanswered service calls and recaptures ₹48.6 Lakhs/year lost service revenue.
4. **AI Used-Car Price Band Suggestion (Used-Car Manager Private Intelligence)**: Statistical price band recommendation computed from depreciation curves and certified historical comps. Kept strictly private to dealership leadership.
5. **Daily DMS Integration CSV Exports**: 1-click batch exports for daily sales intake and workshop job cards in Brand X DMS standard CSV format.
6. **Automated Workload-Balanced Lead Routing**: Incoming leads are routed instantly to eligible consultants in the matching Lucknow showroom with the lowest active workload.
7. **5-Minute SLA Countdown Clock**: Live timer in consultant dashboard tracking responsiveness with prominent `OVERDUE` badges.
8. **AI Copilot (Human-in-the-Loop)**: Structured buyer intelligence extraction and personalized first-reply drafts that require consultant review and approval before simulated dispatch.
9. **Certified Pre-Owned 150-Point Reports**: Full mechanical, ultrasonic paint depth, and tyre/brake life transparency with masked registration plates (`UP32AB****`).
10. **Bilingual Support & DPDP Act 2023 Compliance**: Dynamic English and Hindi (हिंदी) language switching with mandatory explicit consent capture and audit logging.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts, React Router v7.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose ODM, JWT, bcryptjs, Zod, Multer, CSV Parser, Helmet, Rate Limiter.
- **Database**: MongoDB 8.0 with compound unique indexes and ACID transactions.
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`) with fallback to Deterministic Intelligence Provider.
- **Testing**: Vitest & React Testing Library (15 automated unit & integration tests).

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** and a running **MongoDB** instance (local `mongodb://127.0.0.1:27017` or Atlas).

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example server/.env
```
*(A pre-configured development `.env` is already created for seamless zero-config execution).*

### 4. Seed Realistic Dealership Catalog
Populates 3 Lucknow showrooms, 2 workshops, required client brief inventory (`NEW-H-02`, `UC-1182`, `UC-1190`), demo cars, pricing tables, and demo roles:
```bash
npm run seed --workspace=server
```

### 5. Run Automated Tests
```bash
# Backend test suite (18 tests including pricing, booking, SLA, AI price band, DMS exports, and service capacity)
npm test --workspace=server

# Frontend test suite (3 tests)
npm test --workspace=client
```

### 6. Start Development Servers
```bash
npm run dev
```
- Open Frontend: [http://localhost:5173](http://localhost:5173)
- API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Credentials
A top navigation button **"⚡ Switch Demo Role"** allows instant 1-click authentication without entering credentials:

| Role | Email Address | Password | Primary Features |
| :--- | :--- | :--- | :--- |
| **Administrator / Used-Car Manager** | `admin@autoverse.demo` | `Admin@12345` | Admin Studio, RTO Pricing Rules, Inventory CRUD, 40-Bay Workshop Management, Daily DMS CSV Exports, AI Price Band Estimator, CSV Lead Import, Audit Trail |
| **Sales Consultant** | `consultant@autoverse.demo` | `Sales@12345` | CRM Lead Inbox, 5-Min SLA Timer, AI Buyer Summary, Editable AI Reply Draft, Lead Reassignment |
| **Verified Buyer** | `buyer@autoverse.demo` | `Buyer@12345` | My Garage, Test Drive Status, 60-Second Service Booking Appointments, Digital Gate Pass Voucher, Quotations Snapshot, DPDP Consent Center |

---

## 📋 Comprehensive REST API Reference

### Authentication
- `POST /api/auth/register` - Create buyer account with DPDP consent
- `POST /api/auth/login` - Authenticate user & issue JWT
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Current authenticated user profile
- `PUT /api/auth/profile` - Update customer address, city, and marketing consent

### Vehicles (New Inventory)
- `GET /api/cars` - Filterable catalog (fuel, transmission, body type, budget)
- `GET /api/cars/:slug` - Model details, specs, safety rating, colors, variants
- `POST /api/cars` - Create new car model (Admin)
- `PUT /api/cars/:id` - Update car model (Admin)
- `DELETE /api/cars/:id` - Archive car model (Admin)
- `POST /api/cars/:id/variants` - Add variant (Admin)

### Certified Pre-Owned Cars
- `GET /api/used-cars` - Pre-owned listings with masked plates (`UP32AB****`)
- `GET /api/used-cars/:stockId` - Car details & 150-point diagnostic inspection report
- `POST /api/used-cars` - List certified used car (Admin)
- `PUT /api/used-cars/:stockId` - Update used car (Admin)
- `PUT /api/used-cars/:stockId/inspection` - Update 150-point inspection (Admin)

### City-Wise Pricing Engine
- `GET /api/pricing/on-road/:variantId?cityId=` - Exact mathematical on-road price breakdown
- `GET /api/pricing/cities` - Active RTO regions (Lucknow, Kanpur, Delhi NCR)
- `POST /api/pricing/calculate-emi` - Reducing balance EMI amortization calculator
- `GET /api/pricing` - List all pricing records (Admin)
- `POST /api/pricing` - Create pricing record with audit trail (Admin)
- `PUT /api/pricing/:id` - Update pricing record (Admin)

### Showrooms & Demo Fleet
- `GET /api/showrooms` - Showrooms in Lucknow Central, Gomti Nagar, Alambagh
- `GET /api/showrooms/:id/demo-vehicles` - Active test-drive fleet
- `GET /api/showrooms/workshops/list` - Transport Nagar & Amausi Mega Workshops

### Test-Drive Bookings
- `GET /api/bookings/available-slots?demoVehicleId=&date=` - Slot availability
- `POST /api/bookings` - Atomic reservation with collision prevention & pricing snapshot
- `GET /api/bookings/my-bookings` - Buyer's personal test drives
- `GET /api/bookings` - Dealership booking overview (Consultant/Admin)
- `PATCH /api/bookings/:id/status` - Update status (`CONFIRMED`, `COMPLETED`, `CANCELLED`)

### CRM Leads & AI Intelligence
- `POST /api/leads` - Public enquiry submission (triggers AI analysis & auto-assignment)
- `GET /api/leads` - Filterable leads queue with live countdown timers
- `GET /api/leads/:id` - Lead details, AI Buyer Summary, AI First-Reply draft
- `PATCH /api/leads/:id/status` - Transition status (`NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`)
- `PATCH /api/leads/:id/assign` - Reassign lead with audit trail
- `POST /api/leads/:id/notes` - Add internal consultant note
- `POST /api/leads/:id/send-reply` - Approve/edit AI draft and send simulated message
- `POST /api/leads/import-csv` - Upload CSV lead file (preview & execution modes)
- `POST /api/leads/trade-in` - Submit vehicle exchange valuation request

### Admin Studio
- `GET /api/admin/dashboard` - Dealership analytics & KPI metrics
- `GET /api/admin/users` - Staff roster & model specializations
- `POST /api/admin/users` - Create sales consultant or administrator
- `GET /api/admin/audit-logs` - Chronological audit logs
- `GET /api/admin/offers` - Promotional festive banners

---

## 🗄️ Database Collections (21 Schemas)
1. `User` 2. `CustomerProfile` 3. `CarModel` 4. `CarVariant` 5. `UsedCar` 6. `InspectionReport` 7. `City` 8. `Pricing` 9. `Showroom` 10. `Workshop` 11. `DemoVehicle` 12. `TestDriveSlot` 13. `TestDriveBooking` 14. `Lead` 15. `LeadAssignmentHistory` 16. `AIAnalysis` 17. `CommunicationLog` 18. `TradeInRequest` 19. `Offer` 20. `AuditLog` 21. `CSVImport`

---

## 🧪 Test Verification Results
All automated tests execute and pass:
```
✓ 1. City-Wise On-Road Pricing Engine & EMI Calculation (4 tests)
  - calculates exact on-road price for Model H ZX Automatic in Lucknow (₹14,38,500)
  - reflects regional road tax disparity between Delhi (12%) and Lucknow (10%)
  - gracefully handles missing or expired pricing tables without hallucinating prices
  - accurately calculates EMI using reducing balance amortization formula
✓ 2. Test-Drive Booking Engine & Conflict Prevention (1 test)
  - prevents double-booking for the same demo vehicle and time slot
✓ 3. Automated Lead Assignment & SLA Engine (1 test)
  - routes new lead to consultant based on showroom and balances workload
✓ 4. AI Lead Intelligence Schema & Fallback Safety (3 tests)
  - validates structured AI output conforming to strict JSON schema
  - rejects hallucinated or invalid schema fields
  - runs deterministic fallback when AI key is unavailable
✓ 5. Authentication, DPDP Consent & Role Permissions (3 tests)
  - authenticates admin with seeded demo credentials
  - enforces RBAC: forbids buyers from accessing admin dashboard metrics
  - enforces DPDP consent: rejects enquiries without explicit customer consent
✓ 6. Frontend Unit Tests (3 tests)
  - multi-lingual English and Hindi translations
  - masked registration number formatting (UP32AB****)
  - 1-Click Demo Persona Switcher Modal rendering

Total: 15 / 15 Tests Passed (100% Pass Rate)
```

---

## 📄 Documentation Links
- [Technical Design Document (TDD)](docs/TDD.md)
- [Production Deployment Guide](deployment.md)
- [Environment Configuration Template](.env.example)

