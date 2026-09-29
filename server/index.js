// Load environment variables (supports dotenv or native Node.js loadEnvFile)
try {
  require('dotenv').config();
} catch (e) {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(); } catch (_) {}
  }
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Parse JSON and urlencoded data with larger limit for photo diagnosis
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Static assets and pages from sites/
const sitesDir = path.join(__dirname, '..', 'sites');
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
