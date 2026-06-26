import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth.js';
import shopRouter from './routes/shop.js';
import dropshipperRouter from './routes/dropshipper.js';
import aiRouter from './routes/ai.js';
import matchesRouter from './routes/matches.js';

// Resolve paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all for serverless development, configure specifically if needed
  credentials: true
}));
app.use(express.json());

// Request logger (simple)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/shop', shopRouter);
app.use('/api/dropshipper', dropshipperRouter);
app.use('/api/ai', aiRouter);
app.use('/api/matches', matchesRouter);

// Serve static assets in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all non-API GET requests to React Router frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  res.status(500).json({ error: err.message || 'Internal server error occurred' });
});

// Start listening if not running under serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
