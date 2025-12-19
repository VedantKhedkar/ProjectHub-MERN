import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js'; 
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/project.js';
import portfolioRoutes from './routes/portfolio.js';
import paymentRoutes from './routes/payment.js'; 
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// --- CORS Configuration (FIXED) ---
app.use(cors({
    origin: [
        "http://localhost:5173", // Allow your local Vite frontend
        "http://localhost:3000", // Allow local React (if not using Vite)
        "https://projecthub-client.vercel.app" // Production URL (NO trailing slash)
    ],
    credentials: true
}));

// Serve static files
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payment', paymentRoutes);

// --- Base Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the ProjectHub Backend!' });
});

// Test route
app.get('/api/test', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      message: 'Database connection successful!',
      userCount: userCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed!',
      error: error.message,
    });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;