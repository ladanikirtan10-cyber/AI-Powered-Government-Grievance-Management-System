# CivicPulse AI

**Smart Citizen Grievance & Municipal Resolution Portal**

🔗 **Live Deployment (Vercel):** [https://civic-pulse-mauve-sigma.vercel.app/](https://civic-pulse-mauve-sigma.vercel.app/)

---

## Overview

CivicPulse AI is a full-stack civic grievance management web application that enables citizens to file, track, upvote, and visualize municipal complaints while giving administrators AI-assisted triage, duplicate detection, and analytics dashboards.

## Key Features

- **AI Grievance Classification & Triage**: Real-time NLP classification (`POST /api/ai/classify`) to assign departments, subcategories, priority levels, and SLA deadlines.
- **Vision Inspection**: Image inspection support (`POST /api/ai/vision-inspect`) for submitted complaint photos.
- **Geo-Duplicate Detection**: Location-aware duplicate complaint checking (`POST /api/ai/check-duplicates`) to surface nearby existing reports.
- **24/7 CivicBot Assistant**: Interactive AI assistant (`CivicBotModal` / `POST /api/ai/chat`) to guide citizens.
- **Citizen Portal**:
  - Home overview (`/`)
  - File a complaint with location & photo support (`/file`)
  - Track complaint status by Ticket ID (`CIVIC-2026-XXXX`) (`/track`, `/track/:id`)
  - Public grievance feed with filtering & upvoting (`/feed`)
  - Interactive Leaflet map view (`/map`)
- **Admin & Analytics Views**:
  - Municipal Admin Dashboard (`/admin`)
  - Department & Ward Analytics (`/analytics`, `/api/analytics/*`)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Lucide React, Leaflet (`react-leaflet`), Recharts, `qrcode.react`, `canvas-confetti`
- **Backend**: Node.js, Express, TypeScript (`tsx`), Multer, CORS, dotenv, JSON-backed persistent storage (`data/complaints.json`)

## Project Structure

```text
civic-pulse/
├── data/
│   └── complaints.json       # Persistent JSON complaint store
├── server/
│   ├── index.ts              # Express server entry point (port 5000)
│   ├── aiEngine.ts           # NLP classification, vision & duplicate checks
│   ├── chatEngine.ts         # CivicBot conversational handler
│   ├── storage.ts            # JSON persistence & analytics aggregation
│   └── routes/               # /api/complaints, /api/analytics, /api/ai
├── src/
│   ├── App.tsx               # App routes & layout
│   ├── components/           # Navbar, Footer, LeafletMap, CivicBotModal, etc.
│   ├── context/              # RoleContext
│   ├── pages/                # Home, FileComplaint, TrackComplaint, PublicFeed, MapView, AdminDashboard, Analytics
│   ├── services/api.ts       # Frontend API client
│   └── types/                # Shared TypeScript definitions
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start both the Express API server (`http://localhost:5000`) and Vite dev server (`http://localhost:5173`):
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Live Link

Visit the deployed app on Vercel: [https://civic-pulse-mauve-sigma.vercel.app/](https://civic-pulse-mauve-sigma.vercel.app/)
