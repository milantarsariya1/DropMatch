import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/matches/directory - Get count and list directory of all active entities
router.get('/directory', authenticateToken, async (req, res) => {
  try {
    const shops = await prisma.shopListing.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const dropshippers = await prisma.dropshipperIntent.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.json({
      counts: {
        shops: shops.length,
        dropshippers: dropshippers.length
      },
      shops: shops.map(s => ({
        id: s.id,
        shopName: s.shopName,
        location: s.location,
        description: s.description,
        categories: s.categories,
        tags: s.tags,
        ownerName: s.user.name,
        ownerEmail: s.user.email
      })),
      dropshippers: dropshippers.map(d => ({
        id: d.id,
        rawIntentText: d.rawIntentText,
        categories: d.categories,
        tags: d.tags,
        ownerName: d.user.name,
        ownerEmail: d.user.email
      }))
    });
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({ error: 'Failed to fetch directory data' });
  }
});

// GET /api/matches/:targetId
router.get('/:targetId', authenticateToken, async (req, res) => {
  try {
    const { targetId } = req.params;
    const userRole = req.user.role;

    if (userRole === 'dropshipper') {
      // Current user is a dropshipper. Target is a shop listing ID.
      // 1. Get the dropshipper's intent
      const intent = await prisma.dropshipperIntent.findUnique({
        where: { userId: req.user.id }
      });
      if (!intent) {
        return res.status(400).json({ error: 'Please submit your sourcing intent first' });
      }

      // 2. Find the target shop listing
      const shopListing = await prisma.shopListing.findUnique({
        where: { id: targetId },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!shopListing) {
        return res.status(404).json({ error: 'Shop listing not found' });
      }

      // 3. Compute overlap
      const intentCategories = intent.categories.map(c => c.toLowerCase());
      const intentTags = intent.tags.map(t => t.toLowerCase());

      const sharedCategories = shopListing.categories.filter(c =>
        intentCategories.includes(c.toLowerCase())
      );
      const sharedTags = shopListing.tags.filter(t =>
        intentTags.includes(t.toLowerCase())
      );
      const score = (sharedCategories.length * 2) + sharedTags.length;

      return res.json({
        type: 'shop',
        id: shopListing.id,
        shopName: shopListing.shopName,
        location: shopListing.location,
        description: shopListing.description,
        rawProductText: shopListing.rawProductText,
        categories: shopListing.categories,
        tags: shopListing.tags,
        ownerName: shopListing.user.name,
        ownerEmail: shopListing.user.email,
        score,
        sharedCategories,
        sharedTags
      });
    } else {
      // Current user is a shop. Target is a dropshipper intent ID.
      // 1. Get the shop's listing
      const shopListing = await prisma.shopListing.findUnique({
        where: { userId: req.user.id }
      });
      if (!shopListing) {
        return res.status(400).json({ error: 'Please create your shop listing first' });
      }

      // 2. Find target dropshipper intent
      const intent = await prisma.dropshipperIntent.findUnique({
        where: { id: targetId },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!intent) {
        return res.status(404).json({ error: 'Dropshipper intent not found' });
      }

      // 3. Compute overlap
      const shopCategories = shopListing.categories.map(c => c.toLowerCase());
      const shopTags = shopListing.tags.map(t => t.toLowerCase());

      const sharedCategories = intent.categories.filter(c =>
        shopCategories.includes(c.toLowerCase())
      );
      const sharedTags = intent.tags.filter(t =>
        shopTags.includes(t.toLowerCase())
      );
      const score = (sharedCategories.length * 2) + sharedTags.length;

      return res.json({
        type: 'dropshipper',
        id: intent.id,
        rawIntentText: intent.rawIntentText,
        categories: intent.categories,
        tags: intent.tags,
        ownerName: intent.user.name,
        ownerEmail: intent.user.email,
        score,
        sharedCategories,
        sharedTags
      });
    }
  } catch (error) {
    console.error('Error fetching match details:', error);
    res.status(500).json({ error: 'Internal server error fetching match details' });
  }
});

export default router;
