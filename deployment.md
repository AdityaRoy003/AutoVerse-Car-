# AUTOVERSE: Production Deployment & Operations Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0+ or **pnpm**
- **MongoDB**: MongoDB 6.0+ local daemon or MongoDB Atlas cloud cluster
- **Git** (for version control)

---

## 2. Environment Variables Configuration

Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

### Environment Variable Reference
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | API Server listening port | `5000` |
| `NODE_ENV` | Runtime environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB connection URI (IPv4) | `mongodb://127.0.0.1:27017/autoverse` or Atlas URI |
| `JWT_SECRET` | 256-bit cryptographically secure key | `autoverse_production_secret_key_change_me` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `DEALERSHIP_CITY` | Primary operational city | `Lucknow` |
| `DEALERSHIP_STATE` | State jurisdiction | `Uttar Pradesh` |
| `AI_PROVIDER` | Active LLM service (`gemini` / `openai` / `fallback`) | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

---

## 3. Local Installation & Seed Execution

### Step 1: Install All Dependencies (Workspaces)
```bash
# From project root
npm install
```

### Step 2: Seed Realistic Dealership Catalog
The seed script populates 3 Lucknow Showrooms, 2 Mega Workshops, 4 Car Models, 8 Variants, 6 Demo Cars, 8 Certified Pre-Owned Cars (including required client brief vehicles `NEW-H-02`, `UC-1182`, `UC-1190`), 10 Leads, and 3 Demo Roles:

```bash
npm run seed --workspace=server
```

### Step 3: Run Automated Test Suites
```bash
# Run backend tests (18 tests including pricing, atomic booking, SLA timer, service bay capacity, AI price band, and DMS exports)
npm test --workspace=server

# Run frontend tests (3 tests)
npm test --workspace=client
```

### Step 4: Launch Development Servers
```bash
# Start concurrently
npm run dev
```
- Client runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5000/api`

---

## 4. Demo Login Credentials

The application provides a **"⚡ Switch Demo Role"** button in the top navigation micro-bar for immediate 1-click evaluation:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@autoverse.demo` | `Admin@12345` | Full Admin Studio: Inventory CRUD, Pricing Rules, CSV Import, Roster, Audit Logs |
| **Sales Consultant** | `consultant@autoverse.demo` | `Sales@12345` | CRM Lead Inbox: 5-minute countdown SLA timer, AI Buyer Summary, Editable AI Reply Draft |
| **Verified Buyer** | `buyer@autoverse.demo` | `Buyer@12345` | Customer Garage: My bookings, status tracking, cancellations, DPDP consent preferences |

---

## 5. Production Build & Deployment

### Step 1: Compile TypeScript & Bundle Assets
```bash
# Build backend to dist/ and frontend to client/dist/
npm run build
```

### Step 2: Process Management (PM2)
```bash
npm install -g pm2
pm2 start server/dist/index.js --name "autoverse-api" -i max
pm2 save
```

### Step 3: Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name dealership.autoverse.in;

    # Serve compiled Vite frontend
    location / {
        root /var/www/autoverse/client/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Known Limitations & Demonstration Scope
1. **SMS & Email Transmission:** Simulated in this assessment via `CommunicationLog` entries rather than live telecom gateway balance consumption.
2. **Payment Processing:** On-road calculations and token booking reservations are simulated without external bank merchant gateways.
3. **Vehicle Images:** Sourced from Unsplash high-resolution automotive assets with local placeholder fallbacks.

