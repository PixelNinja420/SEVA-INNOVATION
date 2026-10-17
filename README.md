# URJA-SYNC (ऊर्जा-Sync)
> **AI-Driven Active Asset Protection, Regional Grid Simulation & Intelligent Demand Response Platform**

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?logo=sqlite&logoColor=white)](https://sql.js.org/)

---

## ⚡ Executive Summary

**Urja-Sync** is an intelligent software overlay for modern electricity distribution grids (DISCOMs). 

During evening peak hours (the **6:30 PM Duck Curve**), solar rooftop generation rapidly drops while air conditioning, commercial loads, and electric vehicle (EV) charging spike simultaneously. This mismatch pushes distribution transformers beyond their thermal capacity, accelerating insulation degradation and causing catastrophic asset burnouts.

**Urja-Sync solves this problem without expensive grid reinvention:**
1. **Anticipates thermal overload** ~15 minutes ahead using diurnal forecasting models.
2. **Executes 0/1 Knapsack optimization** to dynamically target the minimal subset of flexible neighborhood loads (EV chargers, inverter ACs, water heaters, pumps).
3. **Engages consumers in real-time** via a gamified Progressive Web App (PWA) with **Urja Coins**.
4. **Protects distribution transformers** and saves an estimated **₹4 Lakh** per prevented transformer blowout.

---

## 🏗️ System Architecture

```
                                  [ DISCOM Regional Grid Telemetry ]
                                                  │
                                                  ▼
                               ┌─────────────────────────────────────┐
                               │     High-Throughput Ingestion       │
                               │  Fastify 5 + WebSocket Stream (:5000)│
                               └──────────────────┬──────────────────┘
                                                  │
                       ┌──────────────────────────┴──────────────────────────┐
                       ▼                                                     ▼
        ┌─────────────────────────────┐                       ┌─────────────────────────────┐
        │     Predictive Engine       │                       │    Deterministic Engine     │
        │   LightGBM / 15m Horizon    │                       │  0/1 Knapsack Optimization  │
        │ Overload Risk Stratification│                       │ Exact Load Shedding Minimizer│
        └──────────────┬──────────────┘                       └──────────────┬──────────────┘
                       │                                                     │
                       └──────────────────────────┬──────────────────────────┘
                                                  │
                                                  ▼
                       ┌─────────────────────────────────────────────┐
                       │     Urja Coins Ledger & Database (SQLite)   │
                       └──────────────────┬──────────────────────────┘
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
┌───────────────────────────────┐                       ┌───────────────────────────────┐
│ DISCOM Operator Control Room  │                       │   Consumer Energy PWA         │
│  - GIS Map with Thermal Pins  │                       │  - Live Transformer Status    │
│  - Grid Simulation Lab (1-10x)│                       │  - Demand Response Alert Card │
│  - BESS & V2G Dispatch        │                       │  - Urja Coins Wallet & Ledger │
│  - ROI Financial Calculator   │                       │  - Appliance Flexibility Sliders
└───────────────────────────────┘                       └───────────────────────────────┘
```

---

## 🎨 Design System & Color Palette

Urja-Sync adheres to the presentation's technical aesthetic:

| Token | Hex | Role |
|---|---|---|
| **Background** | `#F5F2E9` | Warm technical off-white canvas |
| **Surface** | `#FFFFFF` | Primary UI card and modal surface |
| **Primary Olive** | `#7F9565` | Brand anchor, positive confirmation |
| **Primary Teal** | `#368F8A` | Secondary brand anchor, predictive AI |
| **Accent Coral** | `#E56F59` | Overload warnings, call-to-actions |
| **Dark Control Room** | `#171D22` | SCADA Operator dark theme surfaces |
| **Success / Normal** | `#24845B` | Healthy transformer indicators |
| **Warning / Watch** | `#E5A23D` | Pre-trip 75-90% load thresholds |
| **Critical** | `#D94F45` | IEEE thermal threshold breach (>90%) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** >= 18 (Tested on v20 & v24)
- **npm** >= 9

### 1. Clone the repository
```bash
git clone https://github.com/PixelNinja420/SEVA-INNOVATION.git
cd SEVA-INNOVATION
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Initialize & Seed Database
```bash
cd ../server
npm run db:setup
npm run db:seed
```
*Creates 30 transformers, 10 feeders, 54 smart consumers across 5 Goa regions (Panaji, Margao, Vasco, Ponda, Curchorem) and pre-configures demo accounts.*

### 4. Run Automated Tests
```bash
# In server/
npm test
```
*Executes all 18 Vitest test suites across Knapsack optimization, AI prediction, JWT authentication, Campaign lifecycles, and Rewards ledger.*

### 5. Launch the Platform
In two separate terminals:

```bash
# Terminal 1: Backend API & WebSocket Server
cd server
npm run dev
# Running on http://localhost:5000 (ws://localhost:5000/ws)
```

```bash
# Terminal 2: Frontend Vite App
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🔑 Demo Accounts & Role-Based Access

The login screen includes **one-click instant demo login buttons**:

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **GRID_OPERATOR** | `operator@urjasync.demo` | `Operator@123` | Operator Control Room, Simulation Lab, GIS Map, BESS & V2G |
| **DISCOM_ADMIN** | `discom@urjasync.demo` | `DiscomAdmin@123` | DISCOM Performance, Analytics, Fleet Health, ROI Calculator |
| **SUPER_ADMIN** | `super@urjasync.demo` | `SuperAdmin@123` | Multi-DISCOM Management, System Config, Audit Logs, Users |
| **CONSUMER** | `consumer@urjasync.demo` | `Consumer@123` | Mobile PWA, Urja Coins Wallet, Active DR Alerts |

---

## 🔬 Core Intelligence Engines

### 1. Dual-Engine Predictive Intelligence
- **Diurnal Cycle Extrapolator**: Generates 15-minute load forecasts combining baseline diurnal power demand with rooftop solar bell curve ($P_{\text{solar}} = P_{\text{peak}} \times \max(0, \sin(\pi \times (h-6)/12))$).
- **Thermal Stress Model**: Calculates top-oil and winding temperature rises via IEEE C57.91 empirical relations:
  $$T_{\text{transformer}} = T_{\text{ambient}} + \left(\frac{\text{Loading \%}}{100}\right)^2 \times \Delta T_{\text{rated\_rise}}$$
- **Stratification**: Categorizes asset state into `NORMAL` (<60%), `WATCH` (60-75%), `WARNING` (75-90%), `CRITICAL` (≥90%), or `DATA_UNAVAILABLE`.

### 2. 0/1 Knapsack Dynamic Programming Optimizer
- **Problem Formulation**:
  $$\min \sum_{i=1}^n c_i \cdot x_i \quad \text{subject to} \quad \sum_{i=1}^n w_i \cdot x_i \ge W_{\text{required}}, \quad x_i \in \{0, 1\}$$
- Implemented with **integer scaling** (0.1 kW granularity) to prevent IEEE 754 floating-point inaccuracies.
- Selects the exact, minimal-cost cohort of consumers with verified flexibility without over-shedding power.

---

## 🎬 10-Step Guided Demo Walkthrough (`/demo`)

Navigate to `/demo` for the self-guided 3-5 minute interactive showcase:
1. **Baseline**: View normal grid conditions (12:00 PM) with strong solar generation and safe transformer temperatures.
2. **Evening Peak**: Advance the clock to 6:30 PM. Watch solar plummet, residential demand spike, and transformer load rise to 94%.
3. **Predictive Warning**: Urja-Sync AI flags an impending thermal burnout risk 15 minutes ahead.
4. **Optimization**: Solver calculates the exact 17.4 kW reduction required and picks the optimal consumer subset.
5. **Operator Approval**: Operator verifies and approves the targeted DR campaign with one click.
6. **Consumer Response**: Switch to consumer view; accept the notification to pause the EV charger.
7. **Load Reduction**: Watch aggregate transformer load drop safely below 80%.
8. **Rewards**: 250 Urja Coins are minted and credited to the consumer's immutable ledger.
9. **Outcome**: Compare Before vs After metrics showing restored thermal headroom.
10. **Financial Impact**: Inspect DISCOM B2B ROI calculator proving ₹4 Lakh asset replacement savings.

---

## ☁️ Deployment Guide

### Deploying Frontend to Vercel
1. Fork or push this repository to GitHub.
2. Connect the repository in [Vercel Dashboard](https://vercel.com).
3. Set the **Root Directory** to `client` or use root with the included [`vercel.json`](./vercel.json).
4. Configure Build Settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

### Deploying Backend to Render
1. In [Render Dashboard](https://render.com), create a **New Web Service** pointing to your repository.
2. The project includes [`render.yaml`](./render.yaml) blueprint for one-click setup:
   - Environment: `Node`
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && node dist/index.js`
   - Health Check Path: `/api/health`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: *(secure random string)*
   - `CLIENT_URL`: *(your Vercel frontend URL)*
4. Deploy!

### Docker & Docker Compose
To run the full stack in isolated containers:
```bash
docker compose up --build
```
- Client accessible at: `http://localhost:5173`
- Backend API accessible at: `http://localhost:5000`

---

## 📄 License & Attribution
Developed for the Urja-Sync Hackathon Prototype Initiative. Synthetic power grid data representing illustrative Goa Electricity Department feeders.
