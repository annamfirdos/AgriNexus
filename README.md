# 🌾 AgriNexus - Full-Stack AI Farm Planning Platform

> **One Platform. Your Entire Farm.**

AgriNexus is an enterprise-grade, AI-guided agricultural planning and lifecycle platform tailored for India's smallholder farmers. It integrates a **Node.js/Express REST backend**, a **persistent database**, **Google Gemini 2.5 Flash AI** for agronomist consultations & multimodal crop disease diagnosis, and a responsive **Liquid-Glass UI** across English, Tamil, and Hindi.

## 🏆 Agriculture & Sustainability Hackathon Challenges

### 🤖 Challenge 1 — Farm Advisor AI
- **Context-Grounded Conversational Intelligence**: Integrated `/api/ai/chat` powered by Google Gemini 2.5 Flash that deeply understands the active farm profile (district, soil, water source, budget, active crop profiles, and live advisories).
- **Factor Sensitivity Explanations**: Explains *why* specific recommendations are made and how changing soil type, irrigation reliability, or sowing dates shifts risk and returns.
- **Explicit Uncertainty & Risk Bounds**: Communicates statistical confidence levels, separating established agronomic baselines from weather and market price volatility.
- **Interactive Factor Probes**: Quick-action prompt chips on the Chat interface for instant factor sensitivity inquiries.

### 🧪 Challenge 2 — What-If Farm Simulator
- **Interactive Multi-Variable Sandbox** (`/app#simulator`): Allows farmers to test hypothetical decisions before committing real-world capital and labor.
- **Configurable Sensitivity Controls**:
  - 💧 **Water Availability**: −50% (Severe Drought) to +50% (Monsoon Surplus).
  - 🧪 **Fertilizer & Nutrition**: −50% (Low Organic) to +50% (High Intensive).
  - 👷 **Labor Supply & Wages**: −40% (Peak Shortage) to +40% (Abundant Family Labor).
  - 📈 **Mandi Price Volatility**: −40% (Market Crash) to +60% (Festival Peak).
  - 🌦️ **Climate Shock Scenarios**: Heatwave (+3.5°C at flowering), Heavy Unseasonal Rains (Waterlogging), Delayed Monsoon.
- **Side-by-Side Comparison Dashboard**: Real-time evaluation of Baseline Normal vs Simulated Scenario across Yield, Production Cost, Net Profit Delta, Moisture Stress, Downside Risk, and Breakeven Mandi Price.
- **Stated Assumptions & Empirical Model Disclosure**: Explicitly details the mathematical model (Jensen-Hanks water-yield production function, Cobb-Douglas fertilizer elasticity) and stated $\pm12\%$ confidence bounds.
- **AI Scenario Explainer**: 1-click `"🤖 Ask Farm Advisor AI to Explain This Scenario"` button calling `/api/ai/simulate`.

### ⚖️ Challenge 3 — Farm Resource Budget Planner
- **Multi-Resource Allocator** (`/app#budget`): Distributes limited farm resources across 4 critical domains:
  1. 💧 **Water Budget**: Dynamic allocation across 4 growth stages (Sowing, Vegetative, Flowering/Podding, Grain Fill).
  2. 🧪 **Nutrient & Fertilizer Split**: Basal Dressing vs 1st Top Dressing vs 2nd Top Dressing.
  3. 👷 **Labor Allocation**: Land Prep, Weeding/Intercultural, Irrigation/Spraying, Harvesting/Bagging person-days.
  4. ⚡ **Machinery & Energy**: Tractor hours & tube-well pumping energy.
- **Constraint Meters & Balance Tracker**: Live multi-segment capacity meter tracking remaining vs allocated units with over-budget alerts.
- **Visible Trade-Offs Engine**: Makes operational trade-offs transparent (e.g., highlighting that cutting water during flowering causes an acute 32% pollination drop, or that heavy basal fertilizer causes nitrogen leaching).
- **Resource Productivity Scorecard**: Tracks Water Productivity ($kg/m^3$) and Labor Value Return ($₹/person-day$).
- **AI Multi-Resource Trade-Off Analysis**: 1-click `"🤖 AI Multi-Resource Trade-Off Analysis"` button calling `/api/ai/budget-tradeoffs`.

---

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your **Google Gemini API Key** (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)):
```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_PASSCODE=agriadmin2026
```

### 3. Run the Server
```bash
# Production mode
npm start

# Development mode (auto-reload on change)
npm run dev
```

Visit in your browser:
- 🌾 **Farmer Web App**: [http://localhost:3000/app](http://localhost:3000/app)
- 🏠 **Landing Page**: [http://localhost:3000](http://localhost:3000)
- 📊 **Pitch Deck**: [http://localhost:3000/pitch](http://localhost:3000/pitch)
- 🩺 **API Status**: [http://localhost:3000/api/status](http://localhost:3000/api/status)

---

## ☁️ Live Cloud Hosting

AgriNexus is configured for 1-click cloud deployment:

| Platform | Configuration | Instructions |
| :--- | :--- | :--- |
| **Render** | `render.yaml` | Connect repo to [Render.com](https://render.com) -> New Web Service |
| **Railway** | Auto-detects Node.js | Deploy repository on [Railway.app](https://railway.app) & add `GEMINI_API_KEY` |
| **Docker** | `Dockerfile`, `docker-compose.yml` | Run `docker-compose up -d` |
| **Vercel** | `vercel.json` | Import project into [Vercel](https://vercel.com) |

Detailed deployment steps and VPS configurations are available in [**`docs/DEPLOYMENT.md`**](docs/DEPLOYMENT.md).

---

## 📡 API Reference Overview

- `GET /api/status` - Service & AI health check
- `GET /api/crops` / `POST /api/crops` - Agronomic crop database
- `GET /api/advisories` / `POST /api/advisories` - Weather & pest alert broadcasts
- `GET /api/qa` / `POST /api/qa` - Farmer community Q&A forum
- `GET /api/community-plans` / `POST /api/community-plans` - Anonymously shared farm plans
- `POST /api/ai/chat` - Google Gemini agronomist conversation
- `POST /api/ai/crop-doctor` - Vision model multimodal leaf diagnosis
- `POST /api/ai/review-plan` - Plan agronomic validation
- `POST /api/ai/translate` - Real-time multilingual text translation
- `POST /api/admin/verify` - Admin passcode authentication

---

## 📂 Repository Structure

```
agrinexus-repo/
├── server/
│   ├── index.js          # Express app, static routing & middleware
│   ├── db.js             # Atomic database persistence engine
│   ├── gemini.js         # Google Gemini AI SDK service integration
│   └── routes/
│       └── api.js        # RESTful API route definitions
├── sites/
│   ├── home.html         # Landing page & 3D farm simulator
│   ├── farmer-app.html   # 9-module Farmer application + API client bridge
│   └── pitch.html        # Investor & partner presentation
├── docs/
│   ├── ARCHITECTURE.md   # Architectural specifications
│   └── DEPLOYMENT.md     # Comprehensive cloud hosting guide
├── Dockerfile            # Production container configuration
├── docker-compose.yml    # Multi-container compose configuration
├── render.yaml           # Render.com deployment Blueprint
├── vercel.json           # Vercel serverless deployment config
├── .env.example          # Environment variable template
└── package.json          # Node.js dependencies & scripts
```

---

## 📄 License
MIT License
