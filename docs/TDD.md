# AUTOVERSE: Technical Design Document (TDD)
**Project Title:** Autoverse – Premium Car Dealership Management & Booking Platform  
**Author:** Senior Full-Stack Software Architect & Systems Engineer  
**Dealership Client:** Company A, Authorised Passenger Car Dealership (Lucknow, UP, India)  
**Document Version:** 1.0.0 (Production Release)  
**Status:** Approved & Implemented  

---

## 1. Executive Summary & Project Overview
Company A operates as an authorised passenger vehicle dealership headquartered in Lucknow, Uttar Pradesh, with three strategic showrooms (Lucknow Central Hazratganj, Gomti Nagar Vibhuti Khand, and Alambagh Kanpur Road), two mega service workshops (Transport Nagar and Amausi), one certified pre-owned stockyard, and 340 employees.

Historically, dealership operations suffered from fragmented workflows:
- Customer on-road quotations were negotiated inconsistently over telephone and spreadsheets.
- Pre-owned inventory was circulated informally via WhatsApp without certified diagnostic reports.
- Test-drive appointments were booked without live demo vehicle collision prevention.
- Sales consultant assignments were manual, leading to lead leakage and SLA violations.

**AUTOVERSE** is an enterprise-grade, end-to-end digital dealership management and booking platform. It delivers real-time city-wise on-road price computation, conflict-free demo vehicle scheduling, automated workload-balanced consultant lead dispatch with a strict 5-minute SLA timer, and AI-powered buyer intelligence copilot.

---

## 2. Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|                              AUTOVERSE CLIENT                                     |
|  React 18 + Vite + TypeScript + Tailwind CSS + Lucide React + Recharts + i18n     |
+-----------------------------------------+-----------------------------------------+
                                          | REST / JSON (JWT Bearer)
+-----------------------------------------v-----------------------------------------+
|                              EXPRESS BACKEND API                                  |
|   Node.js + Express 4 + TypeScript + Helmet + CORS + Rate Limiting + Zod + Multer |
+--------------------+--------------------+--------------------+--------------------+
| Pricing Engine     | Booking Engine     | Lead SLA Engine    | AI Copilot Service |
| (Admin RTO Tables) | (Atomic Slot Lock) | (Workload Balance) | (Gemini + Fallback)|
+--------------------+--------------------+--------------------+--------------------+
                                          | Mongoose 8 (ObjectIds, Indexes)
+-----------------------------------------v-----------------------------------------+
|                              MONGODB DATABASE                                     |
|  21 Relational Schemas (Pricing, Bookings, Leads, Inventory, Inspection, Audits)  |
+-----------------------------------------------------------------------------------+
```

### Technology Selections & Rationale
| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | Ultra-fast HMR, strict type safety, modular component architecture. |
| **Styling** | Tailwind CSS | Minimalist automotive aesthetic (deep charcoal `#121212`, automotive red `#DC2626`). |
| **State & Forms** | React Hook Form, Zod | High-performance uncontrolled form inputs with schema validation. |
| **Visualization** | Recharts | Responsive SVG charts for administrator and CRM analytics. |
| **Backend** | Node.js, Express.js, TypeScript | Production-proven event-driven asynchronous I/O with unified typing. |
| **Database** | MongoDB 8.0, Mongoose ODM | Flexible document storage with ACID transaction support, compound indexes. |
| **Security** | Helmet, bcryptjs, JWT | Hardened HTTP response headers, salted password hashing, stateless tokens. |
| **AI Integration** | Google Gemini API + Deterministic Fallback | Enterprise LLM with confidence scoring, low-latency fallback, and schema validation. |
| **Testing** | Vitest, Supertest, Testing Library | Lightning-fast test runner with native ESM and TypeScript support. |

---

## 3. Database Schemas & Data Relationships

The database utilizes 21 specialized Mongoose schemas with ObjectId references, audit timestamps, and compound indexing:

```
[City] <-------- [Pricing] --------> [CarVariant] <-------- [CarModel]
                   |                       ^                    ^
                   |                       |                    |
[Showroom] <-------+------------ [DemoVehicle]                  |
   ^               |                       ^                    |
   |               |                       |                    |
   +---------------+--------- [TestDriveBooking] ---------------+
                   |
[User (Consultant)] <------- [Lead] --------> [AIAnalysis]
       ^                       |
       |                       +------------> [CommunicationLog]
[LeadAssignmentHistory]        |
                               +------------> [TradeInRequest]

[UsedCar] <----------------- [InspectionReport]
```

### Key Schema Definitions
1. **`CarModel`**: Stores brand, model name, slug, body type (`SUV`, `Sedan`, `Hatchback`, `EV`), starting price, specifications (engine, power, torque, mileage, seating, boot), safety rating, and color swatches.
2. **`CarVariant`**: Belongs to `CarModel`. Contains unique variant stock code (e.g. `NEW-H-02`), fuel type, transmission, ex-showroom base price, and equipment highlights.
3. **`City`**: Stores state, name (Lucknow, Kanpur, Delhi NCR), and official RTO jurisdiction code (`UP32`, `UP78`, `DL01`).
4. **`Pricing`**: Admin-managed pricing table linking `CarVariant` and `City`. Contains `exShowroomPrice`, `roadTaxRatePercent`, `roadTaxFixed`, `insuranceAmount`, `accessoriesAmount`, `registrationCharges`, `otherCharges`, `validFrom`, `validUntil`, and `isActive`.
5. **`Showroom`**: Lucknow Central (Hazratganj), Gomti Nagar (Vibhuti Khand), and Alambagh (Kanpur Road).
6. **`DemoVehicle`**: Assigned to a specific showroom, links to `CarModel` and `CarVariant` with license registration number and color.
7. **`TestDriveBooking`**: Stores reservation with unique reference code (`AV-TB-YYYYMM-XXXX`), links to customer, showroom, demo vehicle, booking date, time slot, status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), and stores **immutable pricing snapshot** at time of booking.
8. **`Lead`**: Central CRM record storing contact details, interested model/variant, budget, lead source, assigned consultant, 5-minute response deadline (`responseDeadline`), contact timestamp (`firstContactedAt`), notes, and AI analysis.
9. **`UsedCar`**: Stock ID (e.g. `UC-1182`, `UC-1190`), manufacturing year, mileage, masked registration plate (`UP32AB****` for DPDP compliance), asking price, certification status, and reference to `InspectionReport`.
10. **`InspectionReport`**: 150-point diagnostic audit with exterior ultrasound paint depth, engine compression, interior electronics, tyre tread depth & life %, and brake pad life %.
11. **`AuditLog`**: Immutable audit records for every pricing, inventory, user, and role modification.

---

## 4. Critical Algorithms & Business Rules

### 4.1. City-Wise On-Road Pricing Algorithm
> **RULE:** Official on-road price must NEVER be generated or estimated by AI. It must ALWAYS be calculated deterministically from administrator-managed MongoDB tables.

```
Formula:
Road Tax Amount = Math.round((ExShowroom * roadTaxRatePercent / 100) + roadTaxFixed)
Total On-Road Price = ExShowroom + Road Tax + Insurance + Accessories + Registration + Other Charges
```

**Algorithm Steps:**
1. Given `variantId` and `cityId`, verify ObjectId validity.
2. Retrieve active pricing record matching `(carVariantId, cityId, isActive: true)`.
3. If no record exists, or `now < validFrom` or `now > validUntil`:
   - Return `{ available: false, message: "Price currently unavailable. Contact dealership for the latest quotation." }`.
   - Never invent or fabricate missing pricing numbers.
4. Execute mathematical computation and return full component-wise breakdown, last updated timestamp, validity dates, and official disclaimer.

### 4.2. Double-Booking & Conflict Prevention Algorithm
> **RULE:** A demo vehicle cannot be booked for overlapping slots on the same day.

```
Compound Unique Partial Index:
TestDriveBookingSchema.index(
  { demoVehicleId: 1, bookingDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } } }
);
```

**Algorithm Steps:**
1. Verify selected `demoVehicleId` is active and stationed at the selected `showroomId`.
2. Query active bookings where `demoVehicleId == demoId`, `bookingDate == date`, `timeSlot == slot`, and `status in ['PENDING', 'CONFIRMED']`.
3. If match found, throw 409 Conflict error.
4. Generate unique reference code `AV-TB-YYYYMM-XXXX`.
5. Capture pricing snapshot from current active RTO table.
6. Commit booking record atomically to database.

### 4.3. Automated Lead Assignment & 5-Minute SLA Engine
> **RULE:** Leads must be routed instantly to eligible consultants in the matching showroom with the lowest active workload. Every enquiry receives a strict 5-minute response deadline.

**Algorithm Steps:**
1. Filter active sales consultants (`role: 'SALES_CONSULTANT', active: true`) stationed at the lead's preferred showroom.
2. If the lead specifies a vehicle model and consultants have designated model specializations, prioritize specialized consultants.
3. If no showroom consultants match, fall back to dealership-wide active consultants.
4. Aggregate active lead workload (`status in ['NEW', 'ASSIGNED', 'CONTACTED', 'FOLLOW_UP']`) across eligible candidates.
5. Select candidate with lowest active lead workload; apply round-robin / least-recent assignment as tie-breaker.
6. Atomically update `Lead.assignedConsultantId`, set `Lead.status = 'ASSIGNED'`, and set `Lead.responseDeadline = Date.now() + 5 minutes`.
7. Log assignment transaction in `LeadAssignmentHistory`.
8. In consultant dashboard, display a real-time ticking countdown; if `now > responseDeadline` and lead is not contacted, mark as `OVERDUE`.

### 4.4. Reducing Balance EMI Amortization Algorithm
```
Formula:
r = annualInterestRatePercent / 12 / 100
n = loanTenureMonths
factor = Math.pow(1 + r, n)
monthlyEmi = Math.round((principal * r * factor) / (factor - 1))
totalRepayment = monthlyEmi * n
totalInterest = totalRepayment - principal
```

---

## 5. AI Copilot Architecture & Safety Controls

### 5.1. Provider Abstraction
The AI module implements the `IAIProvider` interface with support for **Google Gemini API** (`gemini-1.5-flash`), OpenAI API, and a **Deterministic Fallback Provider**.

```typescript
export interface IAIProvider {
  name: string;
  summariseLead(leadContext: LeadEnquiryContext): Promise<AIAnalysisResult>;
  draftReply(leadContext: LeadEnquiryContext, consultantName?: string): Promise<AIDraftReplyResult>;
  suggestUsedCarPrice(context: AIUsedCarPriceContext): Promise<AIUsedCarPriceResult>;
}
```

### 5.2. AI Feature 1: Structured Buyer Needs Summary
- Parses customer enquiry text, stated budget, preferred fuel/transmission, and purchase timeline.
- Output is validated against a strict Zod schema (`BuyerSummarySchema`).
- Unknown fields default to `null` (never invented).
- Confidence score between 0.0 and 1.0; if `<= 0.70`, flagged as `needsReview: true`.

### 5.3. AI Feature 2: First-Reply Draft with Human Approval
- Generates a courteous first response on behalf of the assigned consultant.
- **Strict Compliance:** Zero fabricated discounts, zero unapproved cash offers, zero guaranteed delivery dates for out-of-stock items.
- **Human-in-the-Loop:** Draft is presented in the consultant dashboard for live editing and approval.
- Clicking "Approve & Send (Mock)" commits the message to `CommunicationLog` and marks the lead as `CONTACTED`.

### 5.4. AI Feature 3: Certified Used-Car Price Band Suggestion (Used-Car Manager Internal Tool)
- **Role Isolation:** Client brief mandate: Only the Used-Car Manager sees AI price suggestions; public listings display only the authorized asking price.
- **Algorithm & Comps:** Analyzes model name, manufacturing year, odometer reading, fuel type, transmission, ownership count, and 150-point inspection score. Blends algorithmic depreciation curves with historical certified comps from MongoDB transactions.
- **Band Calculation:** Recommends a minimum, ideal baseline, and maximum asking price with a market demand index (`High`, `Moderate`, `Soft`) and rationale.

---

## 6. Service Workshop 40-Bay Capacity & Booking Engine
To resolve Company A's ₹48.6 Lakhs/year loss from 20% unanswered phone calls (300 lost customers/month × ₹4,500 average bill):
- **Live Workshop Capacity:** Queries real-time bay occupancy for Amausi (16 active bays) and Transport Nagar (24 active bays).
- **Express 60-Second Booking:** Direct online scheduling with immediate sequential bay number assignment (e.g. Bay #14).
- **Doorstep Driver Handover:** Optional doorstep vehicle pickup and drop within Lucknow municipal limits.
- **Instant Gate Pass Voucher:** Generates digital service voucher with Reference ID, assigned bay, dedicated advisor name, and transparent cost estimate.

---

## 7. Daily DMS Integration CSV Exports
Replaces manual DMS double-entry with standardized batch exports:
- **Sales Intake CSV (`/api/admin/dms-export/sales`):** Exports web leads and test-drive bookings formatted with DMS reference, customer contact, showroom, consultant, status, and DPDP consent flags.
- **Workshop Job Cards CSV (`/api/admin/dms-export/service`):** Exports workshop bookings with job card reference, allocated bay number, vehicle plate, model, service type, and estimated invoice value.

---

## 8. Privacy & DPDP Compliance
1. **Explicit Consent:** Every enquiry and test drive form enforces an unchecked mandatory DPDP consent checkbox before submission.
2. **Marketing Granularity:** Separate opt-in toggle for promotional SMS/WhatsApp communications with instant opt-out in customer profile.
3. **Data Masking:** Pre-owned vehicle registration plates are masked publicly (e.g. `UP32AB****`) to protect previous owner identity.
4. **Access Control:** Buyers can only view their own bookings; sales consultants can only access their assigned showroom queue; administrators have full governance.

---

## 9. Verification & Automated Test Strategy
The test suite in `server/src/tests/autoverse.test.ts` and `client/src/tests/frontend.test.tsx` validates:
- [x] Accurate on-road price calculation for Lucknow (`NEW-H-02` ₹14,38,500)
- [x] Regional road tax disparity (Delhi 12% vs Lucknow 10%)
- [x] Missing and expired pricing error handling without price hallucination
- [x] Standard banking EMI formula calculation
- [x] Prevention of double-booking for identical demo vehicle time slots
- [x] Automated showroom matching and workload-balanced lead assignment
- [x] Zod schema validation of AI structured outputs and rejection of invalid fields
- [x] Deterministic fallback execution when API key is missing
- [x] RBAC authentication and prohibition of buyer access to admin metrics
- [x] DPDP consent validation and rejection of non-consenting enquiries
- [x] Multi-lingual English & Hindi dictionary completeness
- [x] Workshop service bay capacity tracking and sequential bay assignment
- [x] Rejection of service appointments without DPDP consent
- [x] AI used-car price band calculation with market demand scoring
- [x] Authorization restriction: buyer forbidden from accessing AI price band API
- [x] DMS Sales daily CSV export with standardized headers
- [x] DMS Workshop Job Cards daily CSV export with bay allocations

