import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import complaintsRouter from './routes/complaints';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CivicPulse AI Municipal Grievance Core',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🏛️  CivicPulse AI Server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: Active (NLP, Vision, Geo-Duplicates)`);
  console.log(`📊 Storage: Persistent JSON DB connected`);
  console.log(`==================================================\n`);
});
