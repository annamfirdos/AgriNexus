const fs = require('fs');
const path = require('path');

let GoogleGenerativeAI = null;
try {
  const genAiModule = require('@google/generative-ai');
  GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (e) {
  // Graceful fallback to native fetch
}

const DEFAULT_MODEL = 'gemini-1.5-flash';

// Enhanced Farm Advisor AI System Prompt (Challenge 1 & Platform Intelligence)
const SYSTEM_AGRONOMIST_PROMPT = `You are the AgriNexus Farm Advisor AI, an expert digital agronomist and decision-support intelligence for Indian agriculture.
You possess complete understanding of the AgriNexus agricultural platform data, features, and calculations:
1. Multi-factor crop suitability algorithms (soil type matching, rainfall & irrigation adequacy, budget fit, market risk profiles).
2. What-If Farm Simulations (testing moisture stress, fertilizer input variance, labor bottlenecks, market price shocks).
3. Farm Resource Budgeting (multi-stage water allocation, N-P-K nutrient balancing, person-day labor constraints, machinery energy).
4. Stage-by-stage crop lifecycle journeys and multimodal Crop Doctor diagnostics.

Guidelines for your responses:
- Ground all explanations in available project data (farm district, soil, water source, budget, active crop profiles, and active advisories).
- Explain HOW specific factors affect the platform's recommendations (e.g., explaining why clay soil retains moisture better for paddy but creates root rot risk for groundnut during unseasonal rains).
- Always explicitly communicate uncertainty and confidence levels when appropriate (e.g., distinguishing between well-established agronomic constants vs weather/market price volatility).
- Make trade-offs visible (e.g., high yield variety vs higher water/fertilizer investment risk).
- Keep responses clear, actionable, and structured with concise bullet points.
- Never give exact toxic chemical or unverified pesticide dosages — advise consulting product labels or local Krishi Vigyan Kendra (KVK) officers.`;

function getApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (_) {}
  return '';
}

let activeWorkingModel = null;
let discoveredModels = null;

const DEFAULT_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
  'gemini-pro'
];

async function discoverAvailableModels(apiKey) {
  if (discoveredModels && discoveredModels.length > 0) {
    return discoveredModels;
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));
        if (supported.length > 0) {
          discoveredModels = supported;
          return discoveredModels;
        }
      }
    }
  } catch (_) {}
  return DEFAULT_CANDIDATES;
}

// Native REST fallback for Gemini API with dynamic multi-model discovery
async function callGeminiRest({ contents, systemInstruction, responseMimeType, temperature = 0.5 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const availableModels = await discoverAvailableModels(apiKey);
  const modelsToTry = activeWorkingModel
    ? [activeWorkingModel, ...availableModels.filter(m => m !== activeWorkingModel)]
    : [...availableModels, ...DEFAULT_CANDIDATES.filter(m => !availableModels.includes(m))];

  let lastError = null;

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: contents,
      generationConfig: {
        temperature: temperature
      }
    };

    if (responseMimeType) {
      body.generationConfig.responseMimeType = responseMimeType;
    }

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        activeWorkingModel = model; // Cache the verified working model
        return text;
      } else {
        const errText = await response.text();
        lastError = new Error(`Gemini API error (${response.status} on model ${model}): ${errText}`);
        // If 404 (model not found), continue loop to try next model candidate
        if (response.status === 404) {
          continue;
        }
        // If other error, still try fallback candidate if quota/version issue
        if (response.status === 400 || response.status === 429) {
          continue;
        }
        throw lastError;
      }
    } catch (netErr) {
      lastError = netErr;
      if (netErr.message && (netErr.message.includes('404') || netErr.message.includes('400') || netErr.message.includes('429'))) {
        continue;
      }
      throw netErr;
    }
  }

  throw lastError || new Error('No compatible Gemini model found for this API key.');
}

module.exports = {
  isConfigured() {
    return !!getApiKey();
  },

  // 1. Agronomist AI Chat
  async chat({ message, history = [], farmContext = '', language = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        text: "AI service is running in local mode. Set your GEMINI_API_KEY in the .env file to enable live Google Gemini agronomist intelligence.",
        offline: true
      };
    }

    const langInstruction = language === 'ta'
      ? 'Reply in simple, natural Tamil.'
      : language === 'hi'
      ? 'Reply in simple, natural Hindi.'
      : 'Reply in simple English.';

    const systemInstruction = `${SYSTEM_AGRONOMIST_PROMPT}\n${langInstruction}\n\nFarmer's saved details:\n${farmContext || 'No specific farm details saved.'}`;

    const contents = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role && turn.content) {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.content }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    try {
      const text = await callGeminiRest({ contents, systemInstruction, temperature: 0.7 });
      return { text, offline: false };
    } catch (err) {
      console.error('Gemini Chat Error:', err);
      return {
        text: `⚠️ Gemini AI Notice: ${err.message}`,
        offline: true
      };
    }
  },

  // 2. Crop Doctor (Vision Diagnosis with Structured JSON)
  async diagnose({ images = [], crop = '', note = '', farmContext = '', language = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const langLine = language === 'ta'
      ? 'Write every text value in simple Tamil.'
      : language === 'hi'
      ? 'Write every text value in simple Hindi.'
      : 'Write every text value in simple English.';

    const promptText = `You are the AgriNexus Crop Doctor, helping a smallholder farmer in India.
Look carefully at the ${images.length} attached photo(s) of ${crop ? 'a ' + crop + ' crop' : 'a crop (identify the crop if you can)'}.
Farmer's note: ${note || 'none'}.
Farm context: ${farmContext || 'none'}.

Return ONLY a valid JSON object matching this schema:
{
  "crop": "string (name of identified crop)",
  "healthy": true|false,
  "issue": "string (the most likely problem or 'Looks healthy')",
  "confidence": "low"|"medium"|"high",
  "severity": "none"|"mild"|"moderate"|"severe",
  "whatISee": "string (2-3 short sentences on visible symptoms)",
  "doNow": ["3-5 practical immediate cultural/organic steps"],
  "prevent": ["2-4 prevention steps for next time"],
  "askExpertIf": "string (one sentence on when to contact local KVK/extension officer)",
  "retakeTip": "string (guidance if photo is blurry/unclear, else empty)"
}

Rules:
- Never give exact chemical dosages, dangerous mixing ratios, or brand names.
- If photos are unclear, set issue to "Photo unclear", confidence to "low", and explain how to retake clearly in retakeTip.
${langLine}`;

    const parts = [];
    for (const img of images) {
      if (img.data && img.mimeType) {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      }
    }
    parts.push({ text: promptText });

    try {
      const rawJson = await callGeminiRest({
        contents: [{ role: 'user', parts }],
        responseMimeType: 'application/json',
        temperature: 0.3
      });
      return JSON.parse(rawJson);
    } catch (err) {
      console.error('Gemini Diagnose Error:', err);
      throw err;
    }
  },

  // 3. Plan Review
  async reviewPlan({ farm, option, language = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const langLine = language === 'ta'
      ? 'Reply in simple Tamil.'
      : language === 'hi'
      ? 'Reply in simple Hindi.'
      : 'Reply in simple English.';

    const prompt = `You are an experienced Indian agronomist advising a small farmer. Review this crop plan in under 170 words, in 4 short sections with plain headings: "Good varieties to ask for", "Local timing", "Biggest risk here", "One way to earn more". Do not give chemical doses or brand names. Be honest if the plan looks weak.
Farm: ${farm.acres} acres, ${farm.soil || 'soil not specified'}, ${farm.district || 'district not given'}, ${farm.state || ''}. Season: ${farm.season || ''}. Water source: ${farm.src || ''}. Budget: ₹${farm.budget || 0}.
Plan: ${option.name || option.crop}, investment ₹${option.invest || 0}, expected profit ₹${option.profit || 0}, bad-year result ₹${option.badProfit || 0}, water coverage ${option.waterCoverage || option.r || ''}%.
${langLine}`;

    try {
      const text = await callGeminiRest({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        temperature: 0.6
      });
      return { text };
    } catch (err) {
      console.error('Gemini Plan Review Error:', err);
      throw err;
    }
  },

  // 4. UGC Translation
  async translate({ text, toLanguage = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) return { text };

    const targetLangName = { ta: 'Tamil', hi: 'Hindi', en: 'English' }[toLanguage] || 'English';
    const prompt = `Translate this farming message into simple ${targetLangName} that a farmer in India can read easily. Keep numbers, units, dates and product names as they are. Reply with only the translation.\n\n${text}`;

    try {
      const resultText = (await callGeminiRest({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        temperature: 0.2
      })).trim();
      return { text: resultText || text };
    } catch (err) {
      console.error('Gemini Translation Error:', err);
      return { text };
    }
  },

  // 5. What-If Scenario AI Explanation (Challenge 2)
  async explainScenario({ baselineCrop, simulatedData, variables, farm, language = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        text: "AI service running in local calculation mode. The What-If simulation metrics above are calculated using standard Jensen-Hanks and Cobb-Douglas response models."
      };
    }

    const langLine = language === 'ta'
      ? 'Reply in simple Tamil.'
      : language === 'hi'
      ? 'Reply in simple Hindi.'
      : 'Reply in simple English.';

    const prompt = `You are the AgriNexus Farm Advisor AI. A farmer is running a What-If Scenario Simulation for their farm.
Farm Context: ${farm.acres || 2} acres in ${farm.district || 'India'}, soil: ${farm.soil || 'loam'}, water source: ${farm.src || 'borewell'}.
Baseline Crop: ${baselineCrop.name || 'Selected Crop'}, Normal Yield: ${baselineCrop.yieldPerAcre || 18} quintals/acre, Normal Net Profit: ₹${baselineCrop.profit || 45000}.
Simulated Variables:
- Water Availability: ${variables.waterPercent > 0 ? '+' : ''}${variables.waterPercent}%
- Fertilizer / Nutrient Input: ${variables.fertilizerPercent > 0 ? '+' : ''}${variables.fertilizerPercent}%
- Labor Availability / Cost: ${variables.laborPercent > 0 ? '+' : ''}${variables.laborPercent}%
- Market Price Shock: ${variables.pricePercent > 0 ? '+' : ''}${variables.pricePercent}%
- Climate Condition: ${variables.climateShock || 'Normal season'}

Simulated Outcomes:
- Projected Yield: ${simulatedData.projectedYield} quintals/acre (${simulatedData.yieldChangePercent > 0 ? '+' : ''}${simulatedData.yieldChangePercent}%)
- Estimated Net Profit: ₹${simulatedData.simulatedProfit} (${simulatedData.profitChangePercent > 0 ? '+' : ''}${simulatedData.profitChangePercent}%)
- Crop Water Stress Level: ${simulatedData.stressLevel || 'Moderate'}
- Risk Assessment: ${simulatedData.riskRating || 'Medium'}

Provide a concise 3-part advisory (under 160 words):
1. **Key Driver Analysis**: Explain the primary physiological/economic factor causing this outcome.
2. **Visible Trade-Offs & Actionable Mitigation**: What can the farmer adjust to buffer downside risk?
3. **Uncertainty & Stated Assumptions**: State the confidence level and key assumptions (e.g., weather volatility, pest response).
${langLine}`;

    try {
      const text = await callGeminiRest({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        temperature: 0.5
      });
      return { text };
    } catch (err) {
      console.error('Gemini Scenario Explanation Error:', err);
      throw err;
    }
  },

  // 6. Resource Budget Trade-off Analysis (Challenge 3)
  async analyzeResourceBudget({ farm, crop, budgetAllocations, metrics, language = 'en' }) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        text: "AI service running in offline mode. Review the resource trade-off indicators and constraint meters above."
      };
    }

    const langLine = language === 'ta'
      ? 'Reply in simple Tamil.'
      : language === 'hi'
      ? 'Reply in simple Hindi.'
      : 'Reply in simple English.';

    const prompt = `You are the AgriNexus Farm Advisor AI. Analyze this farmer's Multi-Resource Allocation Plan for ${crop || 'the active crop'}.
Farm: ${farm.acres || 2} acres, soil: ${farm.soil || 'loam'}, water: ${farm.src || 'canal'}.
Resource Allocations:
- Water Allocation: ${budgetAllocations.waterSowing}% sowing, ${budgetAllocations.waterVeg}% vegetative, ${budgetAllocations.waterFlower}% flowering, ${budgetAllocations.waterGrain}% grain fill. (Total Water: ${budgetAllocations.totalWaterLiters} Liters/acre)
- Fertilizer N-P-K Split: ${budgetAllocations.fertBasal}% Basal, ${budgetAllocations.fertTop1}% 1st Top Dressing, ${budgetAllocations.fertTop2}% 2nd Top Dressing.
- Labor Days Allocated: ${budgetAllocations.totalLaborDays} person-days (Tillage: ${budgetAllocations.laborTill}d, Weeding: ${budgetAllocations.laborWeed}d, Harvest: ${budgetAllocations.laborHarvest}d).
- Energy / Machinery: ${budgetAllocations.machineryHours} tractor/pump hours.

Platform Metrics & Constraints:
- Water Stress Index: ${metrics.waterStress || 'Low'}
- Labor Bottleneck Risk: ${metrics.laborBottleneck || 'None'}
- Nutrient Uptake Efficiency: ${metrics.nutrientEfficiency || '82%'}

Deliver a sharp agronomic trade-off evaluation (under 160 words):
1. **Trade-Off Assessment**: Highlight any critical imbalances (e.g. moisture stress during flowering vs saved pumping cost; reduced weeding labor vs weed competition).
2. **Optimization Recommendation**: 2 specific allocation shifts to maximize resource productivity.
3. **Certainty / Assumptions**: State the agronomic confidence level based on soil and crop stage biology.
${langLine}`;

    try {
      const text = await callGeminiRest({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        temperature: 0.5
      });
      return { text };
    } catch (err) {
      console.error('Gemini Resource Budget Analysis Error:', err);
      throw err;
    }
  }
};
