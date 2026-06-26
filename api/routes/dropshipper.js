import express from 'express';
import prisma from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { analyzeIntentHelper } from './ai.js';

const router = express.Router();

// GET /api/dropshipper/intent - Fetch self intent
router.get('/intent', authenticateToken, requireRole('dropshipper'), async (req, res) => {
  try {
    const intent = await prisma.dropshipperIntent.findUnique({
      where: { userId: req.user.id }
    });
    res.json(intent);
  } catch (error) {
    console.error('Error fetching dropshipper intent:', error);
    res.status(500).json({ error: 'Internal server error fetching intent' });
  }
});

// POST /api/dropshipper/intent - Create or Update intent
router.post('/intent', authenticateToken, requireRole('dropshipper'), async (req, res) => {
  try {
    const { userName, rawIntentText } = req.body;

    if (!rawIntentText) {
      return res.status(400).json({ error: 'rawIntentText is required' });
    }

    // Call AI helper to analyze intent
    const aiResult = await analyzeIntentHelper(rawIntentText);

    // Update user name if supplied
    if (userName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: userName.trim() }
      });
    }

    // Upsert intent
    const intent = await prisma.dropshipperIntent.upsert({
      where: { userId: req.user.id },
      update: {
        rawIntentText: rawIntentText.trim(),
        categories: aiResult.categories,
        tags: aiResult.tags
      },
      create: {
        userId: req.user.id,
        rawIntentText: rawIntentText.trim(),
        categories: aiResult.categories,
        tags: aiResult.tags
      }
    });

    res.json(intent);
  } catch (error) {
    console.error('Error saving dropshipper intent:', error);
    res.status(500).json({ error: 'Internal server error saving intent' });
  }
});

// GET /api/dropshipper/matches - Browse matched shops
router.get('/matches', authenticateToken, requireRole('dropshipper'), async (req, res) => {
  try {
    // 1. Get the dropshipper's intent
    const intent = await prisma.dropshipperIntent.findUnique({
      where: { userId: req.user.id }
    });

    if (!intent) {
      return res.status(200).json({ matches: [], hasIntent: false });
    }

    // 2. Fetch all shop listings
    const shops = await prisma.shopListing.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // 3. Compute matching scores
    const intentCategories = intent.categories.map(c => c.toLowerCase());
    const intentTags = intent.tags.map(t => t.toLowerCase());

    const matches = shops.map(shop => {
      const shopCategories = shop.categories.map(c => c.toLowerCase());
      const shopTags = shop.tags.map(t => t.toLowerCase());

      // Overlaps
      const sharedCategories = shop.categories.filter(c => 
        intentCategories.includes(c.toLowerCase())
      );
      const sharedTags = shop.tags.filter(t => 
        intentTags.includes(t.toLowerCase())
      );

      // Score = (categories * 2) + tags
      const score = (sharedCategories.length * 2) + sharedTags.length;

      return {
        id: shop.id,
        userId: shop.userId,
        name: shop.user.name,
        email: shop.user.email,
        shopName: shop.shopName,
        location: shop.location,
        description: shop.description,
        rawProductText: shop.rawProductText,
        categories: shop.categories,
        tags: shop.tags,
        score,
        sharedCategories,
        sharedTags
      };
    })
    .filter(m => m.score > 0) // Only return shops with at least one overlap
    .sort((a, b) => b.score - a.score); // Rank descending by score

    res.json({ matches, hasIntent: true });
  } catch (error) {
    console.error('Error fetching matching shops:', error);
    res.status(500).json({ error: 'Internal server error fetching matches' });
  }
});

// GET /api/dropshipper/profile/:id - Fetch any dropshipper's public profile
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const intent = await prisma.dropshipperIntent.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    if (!intent) return res.status(404).json({ error: 'Dropshipper profile not found' });
    res.json({
      id: intent.id,
      type: 'dropshipper',
      ownerName: intent.user.name,
      ownerEmail: intent.user.email,
      rawIntentText: intent.rawIntentText,
      categories: intent.categories,
      tags: intent.tags,
    });
  } catch (error) {
    console.error('Error fetching dropshipper profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
