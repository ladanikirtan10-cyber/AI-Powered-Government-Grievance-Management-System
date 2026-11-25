# CivicPulse AI (Pune) — AI-Powered Government Grievance Management System

🔗 **Live Demo (Vercel):** [https://civic-pulse-mauve-sigma.vercel.app/](https://civic-pulse-mauve-sigma.vercel.app/)

A full-stack civic grievance submission, automated AI triage, geospatial duplicate detection, and municipal resolution tracking web application built with **React**, **TypeScript**, **Tailwind CSS**, **Leaflet (OpenStreetMap)**, and **Express.js**. Configured for **Pune Municipal Corporation (PMC)** across all **15 administrative wards**.

---

## Key Features

### Citizen Portal
- **Smart 4-Step Grievance Wizard (`/file`)**:
  - **Real-Time AI Triage**: Automatically classifies complaints into 8 municipal departments as you type, detects hazard keywords, assigns priority (`Critical`, `High`, `Medium`, `Low`), and calculates SLA deadlines (`12h`–`72h`). Citizens can also override the suggested department manually.
  - **Photo Evidence & Defect Tagging**: Upload images directly from your device/camera or enter an image URL, inspected via `AIEngine.inspectImage` to generate defect tags and severity labels.
  - **Interactive GIS Pin & GPS Detection**: Click anywhere on the Leaflet map centered on Pune (`18.5204, 73.8567`) or use one-click browser geolocation to attach coordinates and select from all **15 PMC administrative wards**.
  - **Geospatial & Semantic Duplicate Detection**: Uses the Haversine formula (within a `600m` radius) + category and keyword similarity scoring to surface existing active complaints so citizens can **Upvote ("Me Too")** instead of creating duplicate tickets.
  - **Instant Confirmation & QR Code**: Generates unique tracking IDs (`CIVIC-2026-XXXX`) with a scannable QR code pointing to the live ticket route.
- **Live Ticket Tracker (`/track` & `/track/:id`)**:
  - Flexible ticket lookup (supports full IDs like `CIVIC-2026-1001`, shorthand numeric suffixes like `1001`, or `#1001`).
  - Step-by-step lifecycle timeline (`Submitted` -> `AI Triaged` -> `Assigned` -> `In Progress` -> `Resolved`), SLA details, assigned engineer contact card, before/after comparison, citizen rating/feedback (`1–5` stars), and a **Reopen Grievance** flow for unresolved issues.
- **Public Transparency Wall (`/feed`)**:
  - Browse, search, and filter community grievances by department, priority, status, and ward, with real-time upvoting.
- **Interactive Pune GIS Map (`/map`)**:
  - OpenStreetMap-powered map featuring custom priority markers, heatmap overlay toggle, and all **15 official PMC administrative wards** (*Aundh, Ghole Road, Kothrud - Karve Road, Warje - Karvenagar, Dholepatil Road, Nagar Road (Vadgaon Sheri), Sangamwadi, Bhawani Peth, Kasba - Vishrambaug, Tilak Road, Sahakarnagar, Bibewadi, Hadapsar, Dhankawadi, Kondhwa - Wanorie*) with click-to-pan navigation.
- **CivicBot 24/7 AI Assistant**:
  - Floating conversational assistant capable of tracking tickets by ID, classifying issues in chat and pre-filling `/file`, explaining SLA tiers, and sharing emergency helplines.

### Municipal Official & Admin Portal
- **Persona Role Switcher**: Switch between **Resident Citizen**, **Municipal Commissioner (`ADMIN`)**, and **Department Heads (`OFFICER`)** via the top navigation dropdown (`RoleContext`). Citizens are restricted from accessing internal dashboards and analytics (`/admin` and `/analytics` are hidden from navigation and guarded by routes).
- **Official Triage Dashboard (`/admin`)**: Filter grievances, assign field officers, transition statuses (`Assigned`, `In_Progress`, `Resolved`), attach resolution notes, and upload post-remediation proof photos.
- **Analytics Hub (`/analytics`)**: Interactive Recharts visualizations, AI executive summary insights, department SLA scorecards, ward telemetry metrics (anchored on the **585** complaint PMC Stage 1 Smart City Scorecard baseline), and CSV report export.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5.7, Vite 6.1, React Router v7, Tailwind CSS 3.4 |
| **UI & Visualizations** | Lucide React, Recharts, Framer Motion, Leaflet & React-Leaflet (OpenStreetMap), `qrcode.react`, `canvas-confetti` |
| **Backend** | Node.js, Express 4.21, CORS, Multer, `dotenv`, `tsx` |
| **Data Persistence** | Local JSON file storage (`data/complaints.json`) via `StorageManager` |

---

## Project Structure

```text
civic-pulse/
├── data/
│   └── complaints.json             # Persistent JSON complaint database (seeded for Pune)
├── server/
│   ├── routes/
│   │   ├── ai.ts                   # /api/ai/* (classify, vision-inspect, check-duplicates, chat)
│   │   ├── analytics.ts            # /api/analytics/* (overview, departments, wards)
│   │   └── complaints.ts           # /api/complaints/* (CRUD, vote, feedback, status, reopen)
│   ├── aiEngine.ts                 # NLP classification, image inspection tags & Haversine duplicate check
│   ├── chatEngine.ts               # CivicBot intent matching & response generator
│   ├── index.ts                    # Express app entry point (port 5000)
│   └── storage.ts                  # JSON DB manager & 15 PMC ward analytics aggregator
├── src/
│   ├── components/
│   │   ├── AIClassifierBadge.tsx   # AI department, priority & SLA explanation badge
│   │   ├── CivicBotModal.tsx       # Floating 24/7 AI chatbot drawer
│   │   ├── DuplicateWarningModal.tsx
│   │   ├── Footer.tsx
│   │   ├── LeafletMap.tsx          # Interactive OpenStreetMap map & heatmap circles
│   │   ├── Navbar.tsx              # Navigation, ticket quick-search & persona switcher
│   │   └── ScrollToTop.tsx         # Automatic scroll reset on route change
│   ├── context/
│   │   └── RoleContext.tsx         # Citizen / Admin / Officer persona context (localStorage backed)
│   ├── pages/
│   │   ├── AdminDashboard.tsx      # Official triage queue, assignment & proof upload
│   │   ├── Analytics.tsx           # Charts, department scorecards, ward stats & CSV export
│   │   ├── FileComplaint.tsx       # 4-step smart grievance filing wizard
│   │   ├── Home.tsx                # Landing page, live counters, resolved gallery & map preview
│   │   ├── MapView.tsx             # Fullscreen GIS map with 15 PMC wards & incident cards
│   │   ├── PublicFeed.tsx          # Searchable & filterable community grievance wall
│   │   └── TrackComplaint.tsx      # Ticket tracker, timeline, feedback & reopen UI
│   ├── services/
│   │   └── api.ts                  # Typed frontend API client
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── App.tsx                     # Root routes & role-based access guards
│   ├── index.css                   # Tailwind CSS setup & custom Leaflet marker styles
│   └── main.tsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts                  # Vite dev server (port 5173) & API proxy to port 5000
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended) and **npm**

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ladanikirtan10-cyber/civic-pulse.git
   cd civic-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start both Frontend and Backend together**
   ```bash
   npm run dev
   ```
   This runs `concurrently`:
   - **Frontend (Vite):** [http://localhost:5173](http://localhost:5173) (proxies `/api` and `/uploads` to port `5000`)
   - **Backend (Express + tsx watch):** [http://localhost:5000](http://localhost:5000)

   Or run them in separate terminals:
   ```bash
   # Terminal 1: Backend API
   npm run server

   # Terminal 2: Frontend client
   npm run client
   ```

### Production Build
```bash
npm run build
npm run preview
```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health status & version info |
| `GET` | `/api/complaints` | List complaints with optional `department`, `priority`, `status`, `ward`, and `search` filters |
| `GET` | `/api/complaints/:id` | Fetch a single ticket (supports full ID or numeric suffix lookup) |
| `POST` | `/api/complaints` | Submit a new grievance with automated AI routing & SLA calculation |
| `POST` | `/api/complaints/:id/vote` | Toggle "Me Too" community upvote |
| `POST` | `/api/complaints/:id/feedback` | Submit citizen satisfaction rating (`1–5`) and comment |
| `PUT` | `/api/complaints/:id/status` | Update status, officer assignment, resolution notes, and after-photos |
| `POST` | `/api/complaints/:id/reopen` | Reopen a resolved ticket with citizen reason and auto-escalate priority |
| `POST` | `/api/ai/classify` | Real-time department, sub-category, priority, and SLA prediction |
| `POST` | `/api/ai/vision-inspect` | Image tag & severity extraction |
| `POST` | `/api/ai/check-duplicates` | Geospatial (`600m` Haversine radius) & keyword similarity check |
| `POST` | `/api/ai/chat` | CivicBot conversational triage, ticket status lookup & FAQ |
| `GET` | `/api/analytics/overview` | Aggregated grievance metrics, department scorecards & 15 PMC ward stats |
| `GET` | `/api/analytics/departments` | Department-wise metrics |
| `GET` | `/api/analytics/wards` | Ward-level geolocation and complaint counts |

---

## AI Classification & SLA Tiers

| Priority Tier | Trigger Signals (Examples) | Target SLA |
| :--- | :--- | :--- |
| **Critical** | `>= 2` hazard keywords, `live wire`, `burst`, `spark`, `hospital`, `open manhole` | **12 Hours** (up to 4h for seeded emergencies) |
| **High** | `1` hazard keyword, `overflowing`, `dark`, `deep`, `unsafe` | **24 Hours** |
| **Medium** | Default civic infrastructure issues | **48 Hours** |
| **Low** | Minor maintenance, `paint`, `suggestion`, `lawn` | **72 Hours** |

---

## License

This project is built for academic/demonstration civic-tech purposes showcasing smart municipal grievance management.
