import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getGroqApiKey = () => process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Simple heuristic fallback for mock analysis when Groq is not configured or fails
const generateHeuristicProducts = (rawText) => {
  const text = rawText.toLowerCase();
  const categories = new Set();
  const tags = new Set(['b2b', 'wholesale']);

  // Simple category heuristics
  if (text.includes('wallet') || text.includes('bag') || text.includes('case') || text.includes('leather') || text.includes('belt')) {
    categories.add('Accessories');
  }
  if (text.includes('shirt') || text.includes('clothing') || text.includes('apparel') || text.includes('hoodie') || text.includes('jacket')) {
    categories.add('Apparel & Fashion');
  }
  if (text.includes('phone') || text.includes('electronic') || text.includes('cable') || text.includes('charger') || text.includes('earbud')) {
    categories.add('Electronics');
  }
  if (text.includes('bottle') || text.includes('mug') || text.includes('cup') || text.includes('drink') || text.includes('kitchen')) {
    categories.add('Drinkware & Kitchen');
  }
  if (text.includes('eco') || text.includes('green') || text.includes('bamboo') || text.includes('recycle')) {
    categories.add('Eco-Friendly');
    tags.add('eco-friendly');
  }
  if (categories.size === 0) {
    categories.add('General Merchandise');
  }

  // Tag extraction helper
  const words = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !['have', 'want', 'with', 'from', 'this', 'that', 'they', 'them', 'your', 'some'].includes(w));

  words.slice(0, 6).forEach(w => tags.add(w));

  return {
    categories: Array.from(categories),
    tags: Array.from(tags).slice(0, 8),
    description: `A quality collection featuring product ranges including ${words.slice(0, 3).join(', ')}. Perfect for dropshippers seeking reliable supply chains.`
  };
};

const generateHeuristicIntent = (rawText) => {
  const products = generateHeuristicProducts(rawText);
  return {
    categories: products.categories,
    tags: products.tags
  };
};

// Helper function to query Groq
export async function analyzeProductsHelper(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return { categories: [], tags: [], description: 'No product information supplied.' };
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    console.warn('[AI Service] GROQ_API_KEY is not defined. Using heuristic fallback.');
    return generateHeuristicProducts(rawText);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a B2B product taxonomy expert. Analyze the raw text of products a merchant wants to offload or source. Return a JSON object with:
1. "categories": string[] (1-3 general categories like "Drinkware", "Home Decor", "Electronics")
2. "tags": string[] (3-8 descriptive lowercase search tags like "eco-friendly", "leather", "minimalist", "wireless")
3. "description": string (A clean, engaging, 2-sentence marketing description of the shop's product selection)
Only return valid JSON. Do not include markdown code block formatting (e.g. \`\`\`json).`
          },
          {
            role: 'user',
            content: `Analyze this raw product description: "${rawText}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status: ${response.status}`);
    }

    const data = await response.json();
    const resultString = data.choices[0].message.content;
    const result = JSON.parse(resultString);

    return {
      categories: Array.isArray(result.categories) ? result.categories : [],
      tags: Array.isArray(result.tags) ? result.tags.map(t => t.toLowerCase()) : [],
      description: result.description || 'Merchant listing analyzed.'
    };
  } catch (error) {
    console.error('[AI Service] Error analyzing products with Groq:', error);
    console.warn('[AI Service] Falling back to heuristics.');
    return generateHeuristicProducts(rawText);
  }
}

export async function analyzeIntentHelper(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return { categories: [], tags: [] };
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    console.warn('[AI Service] GROQ_API_KEY is not defined. Using heuristic fallback.');
    return generateHeuristicIntent(rawText);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a B2B dropshipper sourcing analyst. Analyze the raw text of what products a dropshipper wants to find and sell. Return a JSON object with:
1. "categories": string[] (1-3 general categories matching standard e-commerce taxonomies)
2. "tags": string[] (3-8 descriptive lowercase search tags outlining target audience or materials, e.g. "gen-z", "bamboo", "smart-home")
Only return valid JSON. Do not include markdown code block formatting (e.g. \`\`\`json).`
          },
          {
            role: 'user',
            content: `Analyze this raw intent/sourcing text: "${rawText}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status: ${response.status}`);
    }

    const data = await response.json();
    const resultString = data.choices[0].message.content;
    const result = JSON.parse(resultString);

    return {
      categories: Array.isArray(result.categories) ? result.categories : [],
      tags: Array.isArray(result.tags) ? result.tags.map(t => t.toLowerCase()) : []
    };
  } catch (error) {
    console.error('[AI Service] Error analyzing intent with Groq:', error);
    console.warn('[AI Service] Falling back to heuristics.');
    return generateHeuristicIntent(rawText);
  }
}

// POST /api/ai/analyze-products
router.post('/analyze-products', authenticateToken, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'rawText field is required' });
  }

  const analysis = await analyzeProductsHelper(rawText);
  res.json(analysis);
});

// POST /api/ai/analyze-intent
router.post('/analyze-intent', authenticateToken, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'rawText field is required' });
  }

  const analysis = await analyzeIntentHelper(rawText);
  res.json(analysis);
});

// GET /api/ai/generate-mock-data
router.get('/generate-mock-data', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    if (role !== 'shop' && role !== 'dropshipper') {
      return res.status(400).json({ error: 'role parameter must be "shop" or "dropshipper"' });
    }

    // Dynamic import to read mockProfiles.json file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mockFilePath = path.join(__dirname, '../mockProfiles.json');
    
    const mockRaw = fs.readFileSync(mockFilePath, 'utf-8');
    const mockPool = JSON.parse(mockRaw);

    // Pick a random item from the array
    const randomIndex = Math.floor(Math.random() * mockPool.length);
    const selected = mockPool[randomIndex];

    if (role === 'shop') {
      res.json({
        shopName: selected.shop.shopName,
        location: selected.shop.location,
        rawProductText: selected.shop.rawProductText
      });
    } else {
      res.json({
        rawIntentText: selected.dropshipper.rawIntentText
      });
    }
  } catch (error) {
    console.error('Error generating mock data:', error);
    res.status(500).json({ error: 'Failed to generate mock data' });
  }
});

export default router;
