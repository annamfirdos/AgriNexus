# 🚀 AgriNexus Live Deployment Guide

This guide covers everything you need to run, configure, and host the **AgriNexus Full-Stack Agricultural Platform** with live REST APIs, persistent database storage, and Google Gemini AI integration.

---

## 📋 Architecture Overview

- **Backend**: Node.js & Express (`server/index.js`)
- **Database**: Atomic JSON / SQLite-ready persistence engine (`server/db.js`)
- **AI Integration**: Google Gemini 2.5 Flash (`@google/genai`) for agronomist consultations, multimodal leaf/crop disease detection, translation, and plan validation (`server/gemini.js`)
- **Frontend**: Responsive Liquid-Glass UI with 9 interactive modules (`sites/farmer-app.html`, `sites/home.html`, `sites/pitch.html`)
- **API Routing**: RESTful API endpoints at `/api/*`

---

## ⚡ Quick Start (Local Hosting)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Git](https://git-scm.com/)

### 2. Setup & Installation
```bash
# 1. Clone or open your AgriNexus repository
cd agrinexus-repo

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

### 3. Configure Gemini AI API Key
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open `.env` and set your key:
   ```env
   PORT=3000
   NODE_ENV=development
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   ADMIN_PASSCODE=agriadmin2026
   ```

### 4. Start the Application
```bash
# Production mode
npm start

# Development mode (with auto-reloading)
npm run dev
```

Open your browser and navigate to:
- 🌾 **Farmer Web App**: [http://localhost:3000/app](http://localhost:3000/app)
- 🌐 **Landing Page**: [http://localhost:3000](http://localhost:3000)
- 📊 **Investor Pitch**: [http://localhost:3000/pitch](http://localhost:3000/pitch)
- 🩺 **API Health Check**: [http://localhost:3000/api/status](http://localhost:3000/api/status)

---

## ☁️ Cloud Deployment Options

### Option A: Render.com (Recommended Free Cloud Hosting)

Render provides free hosting for Node.js web services with HTTPS out of the box.

1. **Push your code to GitHub / GitLab**.
2. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Name**: `agrinexus`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `ADMIN_PASSCODE`: *(A secure custom passcode for the Admin tab)*
6. Click **Create Web Service**. Your app will be live with an automatic HTTPS URL like `https://agrinexus.onrender.com/app`!

---

### Option B: Railway.app

1. Go to [Railway.app](https://railway.app) and create a new project.
2. Select **Deploy from GitHub repo** and choose your repository.
3. In **Variables**, add:
   - `PORT`: `3000`
   - `GEMINI_API_KEY`: `your-key`
   - `ADMIN_PASSCODE`: `your-passcode`
4. Railway will automatically build and assign a public domain.

---

### Option C: Docker Container

You can deploy anywhere with Docker (AWS EC2, DigitalOcean, Google Cloud Run, Azure Container Apps):

```bash
# Build Docker image
docker build -t agrinexus:latest .

# Run container with environment variables
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  -e ADMIN_PASSCODE="agriadmin2026" \
  -v agrinexus_data:/app/data \
  --name agrinexus_prod \
  agrinexus:latest
```

Or with **Docker Compose**:
```bash
docker-compose up -d
```

---

### Option D: Linux VPS (Ubuntu / Debian with PM2 & Nginx)

1. **SSH into your server & clone repo**:
   ```bash
   git clone https://github.com/your-username/agrinexus.git /var/www/agrinexus
   cd /var/www/agrinexus
   npm install --production
   ```

2. **Set up `.env` file**:
   ```bash
   nano .env
   ```

3. **Run with PM2 Process Manager**:
   ```bash
   sudo npm install -g pm2
   pm2 start server/index.js --name "agrinexus"
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Config** (`/etc/nginx/sites-available/agrinexus`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable SSL with `sudo certbot --nginx -d yourdomain.com`.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | System health check & AI status | No |
| `GET` | `/api/crops` | List agronomic crop profiles | No |
| `POST` | `/api/crops` | Add custom crop | Yes (Admin) |
| `GET` | `/api/advisories` | Active weather/pest advisories | No |
| `POST` | `/api/advisories` | Broadcast new advisory | Yes (Admin) |
| `GET` | `/api/qa` | Community Q&A forum threads | No |
| `POST` | `/api/qa` | Post a question or reply | No |
| `GET` | `/api/community-plans` | Public shared farm plans | No |
| `POST` | `/api/community-plans` | Share anonymous crop plan | No |
| `POST` | `/api/ai/chat` | AI Agronomist conversation (Gemini) | No |
| `POST` | `/api/ai/crop-doctor` | Multimodal plant disease diagnosis | No |
| `POST` | `/api/ai/review-plan` | AI validation of user crop plan | No |
| `POST` | `/api/ai/translate` | Multilingual text translation | No |
| `POST` | `/api/admin/verify` | Verify admin passcode | Yes |

---

## 🔒 Security & Best Practices

1. **Environment Variables**: Never commit `.env` containing your real `GEMINI_API_KEY` to public repositories.
2. **Admin Passcode**: Change the default `ADMIN_PASSCODE` in your production environment settings.
3. **Data Persistence**: When hosting in Docker or containers, mount the `/app/data` volume to preserve community questions, shared plans, and custom crop definitions across deployments.
