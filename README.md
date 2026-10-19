# CampusConnect — College Event & Registration Management System

> **CampusConnect** is a modern, responsive university event platform with a premium SaaS aesthetic. It provides a comprehensive student discovery and digital ticketing experience alongside an administrative event creation, capacity management, and real-time attendance dashboard.

---

## 1. Quick Start & Local Execution

### Prerequisites
- Node.js `v18.0.0` or later (tested on Node v22.18.0)
- npm `v9.0.0` or later

### Installation & Development
```bash
# Navigate to the project root
cd campusconnect

# Install dependencies
npm install

# Start the local development server (runs on http://localhost:3000)
npm run dev

# Generate a deployable production build
npm run build

# Preview the production static build locally
npm run preview
```

---

## 2. Demo Accounts & Testing Credentials

The application includes an **isolated demo adapter** initialized with 12 realistic collegiate events across technical festivals, hackathons, workshops, cultural shows, and sports meets.

### Pre-Configured Demo Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Student** | `student@campus.edu` | `campusDemo123` | Browse events, 1-click registration, view/print digital admission passes, cancel registrations. |
| **Administrator** | `admin@campus.edu` | `adminDemo123` | Create/edit events, publish/unpublish, real-time analytics chart, participant roster, attendance marking, CSV export, ticket scanner. |

### 1-Click Role Switcher
When running in demo mode (`VITE_USE_MOCK_DATA=true`):
- Click the **Demo: Student | Admin** quick switcher directly in the top navigation bar.
- Or use the **1-Click Demo Fill** buttons on the [`/login`](http://localhost:3000/login) page.
- Reset all changes back to initial seed data anytime by clicking **Reset Demo Data** in the footer.

---

## 3. Technology Stack

- **Frontend Core**: React 18 + Vite (JavaScript & JSX only — no TypeScript).
- **Routing**: React Router v6 with public, protected student, and protected admin routes.
- **Styling**: Organized CSS design system (`src/styles/index.css`) with CSS custom properties, responsive layout, accessible forms, and smooth micro-interactions.
- **Icons**: Lucide React.
- **Data Visualizations**: Recharts (category registration breakdown chart).
- **Ticketing & Delight**: Deterministic SVG QR Code generator and Canvas Confetti.
- **Cloud Readiness**: Dual-mode service architecture (`src/services/`) switchable via environment variables.

---

## 4. Key Workflows & Features

### A. Student Portal
1. **Public Landing Page** (`/`): Curated hero section, live university metrics, category showcase, and featured events.
2. **Explore Events** (`/events`): Real-time keyword search, category pills, date filters, venue filters, and sorting by upcoming date or popularity.
3. **Event Details** (`/events/:id`): Full description, venue, organizer contact, live remaining seats progress bar, deadline validation, and interactive registration modal.
4. **Duplicate & Capacity Safeguards**:
   - Duplicate prevention: Students cannot register twice for the same event.
   - Capacity limits: Prevents registration when seats are full.
5. **Digital Pass & Ticket** (`/my-registrations`): Student pass with generated QR code matrix, attendee credentials, security watermark, and PDF printing support (`window.print()`).
6. **Cancellation**: Students can cancel confirmed passes, automatically restoring available seat capacity.

### B. Administrator Control Center
1. **Admin Dashboard** (`/admin`):
   - Key metrics: Total Events, Confirmed Registrations, Verified Attendance Rate, Total Capacity utilization.
   - Interactive Recharts bar chart comparing registrations across event categories.
   - Live feed of recent student registrations.
2. **Event Management** (`/admin/events`):
   - Searchable, filterable table (by status: Published, Draft, Cancelled).
   - Create and edit events with comprehensive form validation (positive capacity, deadline preceding event date).
   - Instant poster image selection with preview (ready for S3 presigned PUT).
   - Status toggle: Publish / Unpublish / Cancel / Delete Draft.
3. **Participant Rosters & Attendance** (`/admin/participants`):
   - Filter by event, status, or search by student name/roll number/ticket code.
   - One-click attendance toggle: **Present** (Checked in) / **Absent**.
   - **CSV Export**: Generates and downloads standard CSV rosters.
   - **Ticket Scanner Modal**: Input ticket code (e.g. `CC-HCK-2026-8941`) to simulate gate barcode check-in.

---

## 5. Architectural Safeguards

- **No TypeScript / TSX**: Built strictly with JavaScript and JSX.
- **Strict Service Separation**: Demo services (`src/services/demo/`) and production API services (`src/services/api/`) are completely decoupled.
- **No Silent Fallback**: When `VITE_USE_MOCK_DATA=false`, API failures throw honest errors rather than masking issues by secretly returning mock data.
- **No Embedded AWS Credentials**: The client never stores AWS access keys, secret keys, or plaintext passwords in browser storage.
- **Client Role Checks**: Clearly documented that client-side route guards are for User Experience (UX) gating only. In production, AWS Lambda authorizers strictly enforce access control.
- **Atomic Operations Design**: Duplicate checks and seat capacity decrements are structured around DynamoDB conditional expressions (`attribute_not_exists` and `registeredCount < maxParticipants`).
- **Private S3 Upload Flow**: Poster uploads are designed around secure presigned PUT URLs, keeping the S3 bucket private.

---

## 6. Project Structure

```
campusconnect/
├── docs/
│   ├── API_CONTRACT.md          # REST API specifications, payloads & response schemas
│   └── AWS_ARCHITECTURE.md     # Serverless cloud design, DynamoDB schema & IAM roles
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AttendanceScannerModal.jsx  # Simulated ticket scanner
│   │   ├── Badge.jsx                  # Status and category badges
│   │   ├── ConfirmDialog.jsx          # Confirmation modal for cancellations/deletions
│   │   ├── EventCard.jsx              # Event card with poster, category & capacity bar
│   │   ├── EventFilters.jsx           # Search, category pills, date & venue filters
│   │   ├── EventFormModal.jsx         # Event creation/editing modal with validation
│   │   ├── Footer.jsx                 # Footer with AWS indicator and demo reset
│   │   ├── Navbar.jsx                 # Header with demo switcher and auth status
│   │   ├── RegistrationTicketModal.jsx # Digital pass with SVG QR code & print
│   │   ├── Sidebar.jsx                # Admin dashboard sidebar
│   │   └── StatCard.jsx               # Dashboard metric card
│   ├── context/
│   │   ├── AuthContext.jsx            # User state, login, register, role switcher
│   │   └── ToastContext.jsx           # Global stackable notifications
│   ├── data/
│   │   └── seedData.js                # 12 realistic campus events, users, registrations
│   ├── layouts/
│   │   ├── AdminLayout.jsx            # Admin console wrapper with scanner integration
│   │   └── MainLayout.jsx             # Public student shell
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx     # Overview KPIs, Recharts trends & recent feed
│   │   │   ├── AdminEventsPage.jsx    # Event CRUD, publish/unpublish & capacity management
│   │   │   └── AdminParticipantsPage.jsx # Roster, attendance toggle & CSV export
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx          # Sign-in with 1-click demo fillers
│   │   │   └── RegisterPage.jsx       # Student account creation form
│   │   ├── errors/
│   │   │   ├── NotFoundPage.jsx       # Friendly 404 screen
│   │   │   └── UnauthorizedPage.jsx   # 403 Forbidden screen with role switcher
│   │   ├── EventDetailsPage.jsx       # Full event page, seat counter, registration flow
│   │   ├── ExploreEventsPage.jsx      # Discover catalog with active filters
│   │   ├── LandingPage.jsx            # University landing hero, stats, how-it-works
│   │   ├── MyRegistrationsPage.jsx    # Upcoming, past & cancelled tickets
│   │   └── StudentDashboard.jsx       # Personalized student home
│   ├── routes/
│   │   ├── AppRoutes.jsx              # Application route map
│   │   └── ProtectedRoute.jsx         # Role-based navigation guard
│   ├── services/
│   │   ├── api/                       # Production AWS API Gateway integrations
│   │   │   ├── attendanceApi.js
│   │   │   ├── authApi.js
│   │   │   ├── eventApi.js
│   │   │   ├── registrationApi.js
│   │   │   └── uploadApi.js
│   │   ├── demo/                      # Isolated localStorage demo adapters
│   │   │   ├── attendanceDemo.js
│   │   │   ├── authDemo.js
│   │   │   ├── eventDemo.js
│   │   │   ├── registrationDemo.js
│   │   │   ├── storage.js
│   │   │   └── uploadDemo.js
│   │   ├── apiClient.js               # Centralized fetch wrapper with JWT injection
│   │   └── index.js                   # Unified factory switching via VITE_USE_MOCK_DATA
│   ├── styles/
│   │   └── index.css                  # Global SaaS university design system
│   ├── App.jsx
│   └── main.jsx
├── .env.example                       # Environment variables template
├── index.html
├── package.json
└── vite.config.js
```

---

## 7. Amazon S3 & CloudFront Deployment Guide

When deploying the frontend static build to AWS:

### Step 1: Build the Static Bundle
```bash
npm run build
```
This produces optimized production assets inside the `dist/` directory.

### Step 2: Create S3 Hosting Bucket
1. Open the **Amazon S3** console.
2. Create a bucket: `campusconnect-frontend-prod`.
3. Keep **Block all public access** enabled (best practice when fronted by CloudFront).

### Step 3: Configure Amazon CloudFront Distribution
1. Create a CloudFront Distribution with the S3 bucket as origin.
2. Select **Origin Access Control (OAC)** to permit CloudFront to read from the private S3 bucket.
3. Set **Default root object** to `index.html`.
4. Configure Custom Error Responses:
   - HTTP Error Code: `403` & `404`
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200` (Required for React Router client-side routing).

### Step 4: Upload Assets via AWS CLI
```bash
# Upload assets with caching headers for immutable chunks
aws s3 sync dist/ s3://campusconnect-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

---

## 8. Summary of Demo vs AWS Integration Status

| Module | Current Development Status | Path to AWS Production Integration |
|---|---|---|
| **Demo Auth & Switcher** | ✅ Functional in browser memory & localStorage | Configure `VITE_COGNITO_USER_POOL_ID` and integrate Amazon Cognito SDK |
| **Event Catalog & Filtering** | ✅ Fully functional (12 seed events + CRUD) | Set `VITE_USE_MOCK_DATA=false` and point to API Gateway `/events` |
| **Registration & Capacity** | ✅ Duplicate checks & atomic capacity simulated | Handled by AWS Lambda `TransactWriteItems` on DynamoDB |
| **Ticket Passes & Printing** | ✅ SVG QR code rendering & browser print ready | In production, ticket validity is verified cryptographically |
| **Poster Uploads** | ✅ Local preview URL generator | Calls `POST /admin/uploads/presigned-url` to upload directly to S3 |
| **Attendance Check-In** | ✅ Interactive manual & simulate scan check-in | Sends code to `POST /admin/attendance/verify` |
| **CSV Export** | ✅ Functional client-side report download | Generates verified records report |
