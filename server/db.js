const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'agrinexus.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Schema
const initialData = {
  crops: {},
  advisories: [],
  community_qa: [],
  community_plans: [],
  settings: {
    banner: '',
    bannerOn: false,
    adminPasscodeHash: null,
    updated: Date.now()
  },
  users: {}
};

let db = { ...initialData };

// Load database from disk
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      db = {
        crops: parsed.crops || {},
        advisories: parsed.advisories || [],
        community_qa: parsed.community_qa || [],
        community_plans: parsed.community_plans || [],
        settings: parsed.settings || initialData.settings,
        users: parsed.users || {}
      };
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error loading DB file, initializing fresh:', err);
    db = { ...initialData };
  }
}

// Save database to disk atomically
let saveTimeout = null;
function saveDb() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving DB to disk:', err);
    }
  }, 50);
}

// Initialize on require
loadDb();

module.exports = {
  // --- Crops ---
  getCrops() {
    return db.crops;
  },
  getCrop(id) {
    return db.crops[id] || null;
  },
  saveCrop(id, data) {
    db.crops[id] = { ...data, updated: Date.now() };
    saveDb();
    return db.crops[id];
  },
  deleteCrop(id) {
    if (db.crops[id]) {
      delete db.crops[id];
      saveDb();
      return true;
    }
    return false;
  },
  resetAllCrops() {
    db.crops = {};
    saveDb();
    return true;
  },
  bulkUpdatePrices(priceMap) {
    let count = 0;
    for (const [id, price] of Object.entries(priceMap)) {
      if (price > 0) {
        db.crops[id] = db.crops[id] || {};
        db.crops[id].price = Number(price);
        db.crops[id].priceUpdated = Date.now();
        db.crops[id].updated = Date.now();
        count++;
      }
    }
    saveDb();
    return count;
  },

  // --- Advisories ---
  getAdvisories(filter = {}) {
    const now = Date.now();
    let list = [...db.advisories];
    
    if (filter.activeOnly) {
      list = list.filter(a => !(a.expires && a.expires < now));
    }
    if (filter.state) {
      list = list.filter(a => !a.state || a.state === filter.state);
    }
    if (filter.crop) {
      list = list.filter(a => !a.crop || a.crop === filter.crop);
    }

    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.ts || 0) - (a.ts || 0));
  },
  addAdvisory(doc) {
    const id = 'adv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const advisory = { id, ...doc, ts: Date.now() };
    db.advisories.unshift(advisory);
    saveDb();
    return advisory;
  },
  updateAdvisory(id, doc) {
    const idx = db.advisories.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.advisories[idx] = { ...db.advisories[idx], ...doc, updated: Date.now() };
      saveDb();
      return db.advisories[idx];
    }
    return null;
  },
  deleteAdvisory(id) {
    const initialLen = db.advisories.length;
    db.advisories = db.advisories.filter(a => a.id !== id);
    if (db.advisories.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  },

  // --- Community Q&A ---
  getQuestions() {
    return [...db.community_qa].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  },
  addQuestion(text, name) {
    const id = 'qa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const question = {
      id,
      text,
      name: name || '',
      ts: Date.now(),
      replies: []
    };
    db.community_qa.unshift(question);
    saveDb();
    return question;
  },
  deleteQuestion(id) {
    const initialLen = db.community_qa.length;
    db.community_qa = db.community_qa.filter(q => q.id !== id);
    if (db.community_qa.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  },
  getReplies(questionId) {
    const q = db.community_qa.find(x => x.id === questionId);
    return q ? (q.replies || []).sort((a, b) => (a.ts || 0) - (b.ts || 0)) : [];
  },
  addReply(questionId, text, name) {
    const q = db.community_qa.find(x => x.id === questionId);
    if (!q) return null;
    q.replies = q.replies || [];
    const replyId = 'rep_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const reply = {
      id: replyId,
      text,
      name: name || '',
      ts: Date.now()
    };
    q.replies.push(reply);
    saveDb();
    return reply;
  },
  deleteReply(questionId, replyId) {
    const q = db.community_qa.find(x => x.id === questionId);
    if (!q || !q.replies) return false;
    const initialLen = q.replies.length;
    q.replies = q.replies.filter(r => r.id !== replyId);
    if (q.replies.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  },

  // --- Community Shared Plans ---
  getCommunityPlans() {
    return db.community_plans;
  },
  addCommunityPlan(plan) {
    const id = 'plan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const entry = { id, ...plan, ts: Date.now() };
    db.community_plans.unshift(entry);
    if (db.community_plans.length > 2000) {
      db.community_plans = db.community_plans.slice(0, 2000);
    }
    saveDb();
    return entry;
  },

  // --- App Settings & Admin Passcode ---
  getSettings() {
    return db.settings;
  },
  updateSettings(data) {
    db.settings = { ...db.settings, ...data, updated: Date.now() };
    saveDb();
    return db.settings;
  },

  // --- User Profiles & Journeys ---
  getUserProfile(userId) {
    return db.users[userId] || { farm: null, journey: null, pastSeasons: [], scans: [] };
  },
  saveUserFarm(userId, farm) {
    db.users[userId] = db.users[userId] || { pastSeasons: [], scans: [] };
    db.users[userId].farm = farm;
    db.users[userId].updated = Date.now();
    saveDb();
    return db.users[userId].farm;
  },
  getUserJourney(userId) {
    const u = db.users[userId];
    return u ? u.journey || null : null;
  },
  saveUserJourney(userId, journey) {
    db.users[userId] = db.users[userId] || { pastSeasons: [], scans: [] };
    db.users[userId].journey = journey;
    db.users[userId].updated = Date.now();
    saveDb();
    return db.users[userId].journey;
  },
  deleteUserJourney(userId) {
    if (db.users[userId]) {
      db.users[userId].journey = null;
      saveDb();
      return true;
    }
    return false;
  },
  getUserPastSeasons(userId) {
    const u = db.users[userId];
    return u ? (u.pastSeasons || []) : [];
  },
  addUserPastSeason(userId, season) {
    db.users[userId] = db.users[userId] || { pastSeasons: [], scans: [] };
    db.users[userId].pastSeasons = db.users[userId].pastSeasons || [];
    db.users[userId].pastSeasons.unshift({ ...season, id: 's_' + Date.now(), ts: Date.now() });
    if (db.users[userId].pastSeasons.length > 20) {
      db.users[userId].pastSeasons = db.users[userId].pastSeasons.slice(0, 20);
    }
    saveDb();
    return db.users[userId].pastSeasons;
  },
  getUserScans(userId) {
    const u = db.users[userId];
    return u ? (u.scans || []) : [];
  },
  addUserScan(userId, scan) {
    db.users[userId] = db.users[userId] || { pastSeasons: [], scans: [] };
    db.users[userId].scans = db.users[userId].scans || [];
    db.users[userId].scans.unshift({ ...scan, id: 'scan_' + Date.now(), ts: Date.now() });
    if (db.users[userId].scans.length > 30) {
      db.users[userId].scans = db.users[userId].scans.slice(0, 30);
    }
    saveDb();
    return db.users[userId].scans;
  }
};
