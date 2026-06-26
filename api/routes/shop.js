import express from 'express';
import prisma from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { analyzeProductsHelper } from './ai.js';

const router = express.Router();

// GET /api/shop/listing - Fetch self listing
router.get('/listing', authenticateToken, requireRole('shop'), async (req, res) => {
  try {
    const listing = await prisma.shopListing.findUnique({
      where: { userId: req.user.id }
    });
    res.json(listing);
  } catch (error) {
    console.error('Error fetching shop listing:', error);
    res.status(500).json({ error: 'Internal server error fetching listing' });
  }
});

// POST /api/shop/listing - Create or Update listing
router.post('/listing', authenticateToken, requireRole('shop'), async (req, res) => {
  try {
    const { userName, shopName, location, rawProductText } = req.body;

    if (!shopName || !location || !rawProductText) {
      return res.status(400).json({ error: 'shopName, location, and rawProductText are required' });
    }

    // Call AI helper to analyze products
    const aiResult = await analyzeProductsHelper(rawProductText);

    // Update user name if supplied
    if (userName) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: userName.trim() }
      });
    }

    // Upsert shop listing
    const listing = await prisma.shopListing.upsert({
      where: { userId: req.user.id },
      update: {
        shopName: shopName.trim(),
        location: location.trim(),
        rawProductText: rawProductText.trim(),
        description: aiResult.description,
        categories: aiResult.categories,
        tags: aiResult.tags
      },
      create: {
        userId: req.user.id,
        shopName: shopName.trim(),
        location: location.trim(),
        rawProductText: rawProductText.trim(),
        description: aiResult.description,
        categories: aiResult.categories,
        tags: aiResult.tags
      }
    });

    res.json(listing);
  } catch (error) {
    console.error('Error saving shop listing:', error);
    res.status(500).json({ error: 'Internal server error saving listing' });
  }
});

// GET /api/shop/matches - Browse matched dropshippers
router.get('/matches', authenticateToken, requireRole('shop'), async (req, res) => {
  try {
    // 1. Get the shop's listing
    const shopListing = await prisma.shopListing.findUnique({
      where: { userId: req.user.id }
    });

    if (!shopListing) {
      return res.status(200).json({ matches: [], hasListing: false });
    }

    // 2. Fetch all dropshippers intents
    const intents = await prisma.dropshipperIntent.findMany({
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
    const shopCategories = shopListing.categories.map(c => c.toLowerCase());
    const shopTags = shopListing.tags.map(t => t.toLowerCase());

    const matches = intents.map(intent => {
      const intentCategories = intent.categories.map(c => c.toLowerCase());
      const intentTags = intent.tags.map(t => t.toLowerCase());

      // Overlaps
      const sharedCategories = intent.categories.filter(c => 
        shopCategories.includes(c.toLowerCase())
      );
      const sharedTags = intent.tags.filter(t => 
        shopTags.includes(t.toLowerCase())
      );

      // Score = (categories * 2) + tags
      const score = (sharedCategories.length * 2) + sharedTags.length;

      return {
        id: intent.id,
        userId: intent.userId,
        name: intent.user.name,
        email: intent.user.email,
        rawIntentText: intent.rawIntentText,
        categories: intent.categories,
        tags: intent.tags,
        score,
        sharedCategories,
        sharedTags
      };
    })
    .filter(m => m.score > 0) // Only return dropshippers with at least one overlap
    .sort((a, b) => b.score - a.score); // Rank descending by score

    res.json({ matches, hasListing: true });
  } catch (error) {
    console.error('Error fetching matching dropshippers:', error);
    res.status(500).json({ error: 'Internal server error fetching matches' });
  }
});

// GET /api/shop/profile/:id - Fetch any shop's public profile
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await prisma.shopListing.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    if (!listing) return res.status(404).json({ error: 'Shop profile not found' });
    res.json({
      id: listing.id,
      type: 'shop',
      shopName: listing.shopName,
      location: listing.location,
      description: listing.description,
      rawProductText: listing.rawProductText,
      categories: listing.categories,
      tags: listing.tags,
      ownerName: listing.user.name,
      ownerEmail: listing.user.email,
    });
  } catch (error) {
    console.error('Error fetching shop profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
