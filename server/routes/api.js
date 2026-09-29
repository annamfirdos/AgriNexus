const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const gemini = require('../gemini');

const router = express.Router();

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Helper middleware to extract user identifier (from header or fallback)
function getUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || 'default_user';
}

// ================= Health & Config Status =================
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    app: 'AgriNexus',
    aiConfigured: gemini.isConfigured(),
    timestamp: Date.now()
  });
});

// ================= Crops API =================
router.get('/crops', (req, res) => {
  try {
    const crops = db.getCrops();
    res.json({ crops });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

router.post('/crops/:id', (req, res) => {
  try {
    const cropId = req.params.id;
    const cropData = req.body;
    const saved = db.saveCrop(cropId, cropData);
    res.json({ success: true, crop: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save crop' });
  }
});

router.delete('/crops/:id', (req, res) => {
  try {
    const ok = db.deleteCrop(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

router.post('/crops/bulk-prices', (req, res) => {
  try {
    const { prices } = req.body;
    if (!prices || typeof prices !== 'object') {
      return res.status(400).json({ error: 'Invalid prices object' });
    }
    const updatedCount = db.bulkUpdatePrices(prices);
    res.json({ success: true, updatedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prices' });
  }
});

router.post('/crops/reset-all', (req, res) => {
  try {
    db.resetAllCrops();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset crops' });
  }
});

// ================= Advisories API =================
router.get('/advisories', (req, res) => {
  try {
    const filter = {
      state: req.query.state || null,
      crop: req.query.crop || null,
      activeOnly: req.query.active !== 'false'
    };
    const advisories = db.getAdvisories(filter);
    res.json({ advisories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advisories' });
  }
});

router.post('/advisories', (req, res) => {
  try {
    const { text, type, state, crop, pinned, expires } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Advisory text is required' });
    }
    const advisory = db.addAdvisory({ text, type, state, crop, pinned: !!pinned, expires });
    res.json({ success: true, advisory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post advisory' });
  }
});

router.put('/advisories/:id', (req, res) => {
  try {
    const updated = db.updateAdvisory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Advisory not found' });
    res.json({ success: true, advisory: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update advisory' });
  }
});

router.delete('/advisories/:id', (req, res) => {
  try {
    const ok = db.deleteAdvisory(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete advisory' });
  }
});

// ================= Community Q&A / Farmer Network =================
router.get('/qa', (req, res) => {
  try {
    const questions = db.getQuestions();
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/qa', (req, res) => {
  try {
    const { text, name } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const q = db.addQuestion(text.trim(), name);
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post question' });
  }
});

router.delete('/qa/:id', (req, res) => {
  try {
    const ok = db.deleteQuestion(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

router.get('/qa/:id/replies', (req, res) => {
  try {
    const replies = db.getReplies(req.params.id);
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

router.post('/qa/:id/replies', (req, res) => {
  try {
    const { text, name } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }
    const reply = db.addReply(req.params.id, text.trim(), name);
    if (!reply) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

router.delete('/qa/:id/replies/:replyId', (req, res) => {
  try {
    const ok = db.deleteReply(req.params.id, req.params.replyId);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// ================= Community Plans & Insights =================
router.get('/community-plans', (req, res) => {
  try {
    const plans = db.getCommunityPlans();
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.post('/community-plans', (req, res) => {
  try {
    const entry = db.addCommunityPlan(req.body);
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to share plan' });
  }
});

// ================= Settings & Admin Passcode =================
router.get('/settings', (req, res) => {
  try {
    const s = db.getSettings();
    res.json({
      banner: s.banner || '',
      bannerOn: !!s.bannerOn,
      hasPasscode: !!s.adminPasscodeHash
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings/verify-passcode', (req, res) => {
  try {
    const { passcode } = req.body;
    const s = db.getSettings();
    if (!s.adminPasscodeHash) {
      return res.json({ valid: true, note: 'No passcode currently set' });
    }
    const hashed = sha256(passcode || '');
    const valid = (hashed === s.adminPasscodeHash);
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.post('/settings', (req, res) => {
  try {
    const { banner, bannerOn, newPasscode, clearPasscode } = req.body;
    const update = {};
    if (banner !== undefined) update.banner = banner;
    if (bannerOn !== undefined) update.bannerOn = !!bannerOn;
    if (newPasscode && newPasscode.length >= 4) {
      update.adminPasscodeHash = sha256(newPasscode);
    } else if (clearPasscode) {
      update.adminPasscodeHash = null;
    }
    const saved = db.updateSettings(update);
    res.json({
      success: true,
      settings: {
        banner: saved.banner,
        bannerOn: saved.bannerOn,
        hasPasscode: !!saved.adminPasscodeHash
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ================= User Data (Profile, Active Journey, History) =================
router.get('/user/profile', (req, res) => {
  try {
    const uid = getUserId(req);
    const profile = db.getUserProfile(uid);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.post('/user/farm', (req, res) => {
  try {
    const uid = getUserId(req);
    const farm = db.saveUserFarm(uid, req.body.farm);
    res.json({ success: true, farm });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save farm details' });
  }
});

router.get('/user/journey', (req, res) => {
  try {
    const uid = getUserId(req);
    const journey = db.getUserJourney(uid);
    res.json({ journey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load journey' });
  }
});

router.post('/user/journey', (req, res) => {
  try {
    const uid = getUserId(req);
    const journey = db.saveUserJourney(uid, req.body.journey);
    res.json({ success: true, journey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save journey' });
  }
});

router.delete('/user/journey', (req, res) => {
  try {
    const uid = getUserId(req);
    const ok = db.deleteUserJourney(uid);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete journey' });
  }
});

router.get('/user/past-seasons', (req, res) => {
  try {
    const uid = getUserId(req);
    const seasons = db.getUserPastSeasons(uid);
    res.json({ seasons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load past seasons' });
  }
});

router.post('/user/past-seasons', (req, res) => {
  try {
    const uid = getUserId(req);
    const seasons = db.addUserPastSeason(uid, req.body.season);
    res.json({ success: true, seasons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add completed season' });
  }
});

router.get('/user/scans', (req, res) => {
  try {
    const uid = getUserId(req);
    const scans = db.getUserScans(uid);
    res.json({ scans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load scans' });
  }
});

router.post('/user/scans', (req, res) => {
  try {
    const uid = getUserId(req);
    const scans = db.addUserScan(uid, req.body.scan);
    res.json({ success: true, scans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save scan' });
  }
});

// ================= Google Gemini AI Endpoints =================
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, history, farmContext, language } = req.body;
    if (!message && (!history || !history.length)) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const result = await gemini.chat({ message, history, farmContext, language });
    res.json(result);
  } catch (err) {
    console.error('AI Chat Route Error:', err);
    res.status(500).json({ error: err.message || 'AI Chat failed' });
  }
});

router.post('/ai/diagnose', async (req, res) => {
  try {
    const { images, crop, note, farmContext, language } = req.body;
    if (!images || !images.length) {
      return res.status(400).json({ error: 'At least one image is required for diagnosis' });
    }
    const diagnosis = await gemini.diagnose({ images, crop, note, farmContext, language });
    res.json(diagnosis);
  } catch (err) {
    console.error('AI Diagnose Route Error:', err);
    res.status(500).json({ error: err.message || 'Diagnosis failed' });
  }
});

router.post('/ai/review', async (req, res) => {
  try {
    const { farm, option, language } = req.body;
    if (!farm || !option) {
      return res.status(400).json({ error: 'Farm and option details are required' });
    }
    const review = await gemini.reviewPlan({ farm, option, language });
    res.json(review);
  } catch (err) {
    console.error('AI Review Route Error:', err);
    res.status(500).json({ error: err.message || 'Review failed' });
  }
});

router.post('/ai/translate', async (req, res) => {
  try {
    const { text, toLanguage } = req.body;
    if (!text) return res.json({ text: '' });
    const result = await gemini.translate({ text, toLanguage });
    res.json(result);
  } catch (err) {
    console.error('AI Translate Route Error:', err);
    res.json({ text: req.body.text || '' });
  }
});

// Challenge 2: What-If Simulation AI Evaluation
router.post('/ai/simulate', async (req, res) => {
  try {
    const { baselineCrop, simulatedData, variables, farm, language } = req.body;
    const result = await gemini.explainScenario({
      baselineCrop: baselineCrop || {},
      simulatedData: simulatedData || {},
      variables: variables || {},
      farm: farm || {},
      language: language || 'en'
    });
    res.json(result);
  } catch (err) {
    console.error('AI Simulate Route Error:', err);
    res.status(500).json({ error: err.message || 'Simulation analysis failed' });
  }
});

// Challenge 3: Resource Budget Trade-Off AI Evaluation
router.post('/ai/budget-tradeoffs', async (req, res) => {
  try {
    const { farm, crop, budgetAllocations, metrics, language } = req.body;
    const result = await gemini.analyzeResourceBudget({
      farm: farm || {},
      crop: crop || 'Active Crop',
      budgetAllocations: budgetAllocations || {},
      metrics: metrics || {},
      language: language || 'en'
    });
    res.json(result);
  } catch (err) {
    console.error('AI Budget Trade-offs Route Error:', err);
    res.status(500).json({ error: err.message || 'Trade-off analysis failed' });
  }
});

module.exports = router;
