// Load environment variables (supports dotenv or native Node.js loadEnvFile)
try {
  require('dotenv').config();
} catch (e) {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(); } catch (_) {}
  }
}
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

// Ensure sites/assets exists and copy background images if available
const sitesDir = path.join(__dirname, '..', 'sites');
const assetsDir = path.join(sitesDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

try {
  const uploadDir = 'C:\\Users\\E103136\\.gemini\\antigravity-ide\\brain\\72427891-32da-475c-8e50-67e141130993\\.user_uploaded';
  const sunsetSrc = path.join(uploadDir, 'media_1790664974340.png');
  const cloudsSrc = path.join(uploadDir, 'media_1790664946305.png');
  if (fs.existsSync(sunsetSrc) && !fs.existsSync(path.join(assetsDir, 'farm-sunset.png'))) {
    fs.copyFileSync(sunsetSrc, path.join(assetsDir, 'farm-sunset.png'));
  }
  if (fs.existsSync(cloudsSrc) && !fs.existsSync(path.join(assetsDir, 'farm-clouds.png'))) {
    fs.copyFileSync(cloudsSrc, path.join(assetsDir, 'farm-clouds.png'));
  }
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Parse JSON and urlencoded data with larger limit for photo diagnosis
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Explicit background image route handlers with direct disk fallbacks
const uploadDir = 'C:\\Users\\E103136\\.gemini\\antigravity-ide\\brain\\72427891-32da-475c-8e50-67e141130993\\.user_uploaded';

app.get(['/assets/farm-sunset.png', '/farm-sunset.png'], (req, res) => {
  const local = path.join(assetsDir, 'farm-sunset.png');
  if (fs.existsSync(local)) return res.sendFile(local);
  const src = path.join(uploadDir, 'media_1790664974340.png');
  if (fs.existsSync(src)) return res.sendFile(src);
  res.status(404).end();
});

app.get(['/assets/farm-clouds.png', '/farm-clouds.png'], (req, res) => {
  const local = path.join(assetsDir, 'farm-clouds.png');
  if (fs.existsSync(local)) return res.sendFile(local);
  const src = path.join(uploadDir, 'media_1790664946305.png');
  if (fs.existsSync(src)) return res.sendFile(src);
  res.status(404).end();
});

// Static assets and pages from sites/
app.use(express.static(sitesDir));

// Clean URL routing
app.get('/', (req, res) => {
  res.sendFile(path.join(sitesDir, 'home.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(sitesDir, 'home.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(sitesDir, 'farmer-app.html'));
});

app.get('/farmer-app', (req, res) => {
  res.sendFile(path.join(sitesDir, 'farmer-app.html'));
});

app.get('/pitch', (req, res) => {
  res.sendFile(path.join(sitesDir, 'pitch.html'));
});

// Fallback route
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(sitesDir, 'home.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🌾 AgriNexus Full-Stack Server Running on Port ${PORT}`);
  console.log(`🏠 Home / 3D Story:    http://localhost:${PORT}/`);
  console.log(`🌾 Farmer Application:  http://localhost:${PORT}/app`);
  console.log(`📊 Pitch Deck:          http://localhost:${PORT}/pitch`);
  console.log(`🔌 REST API Status:     http://localhost:${PORT}/api/status`);
  console.log('====================================================');
});
