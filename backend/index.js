import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Added for environment variable management
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js'; 
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/project.js';
import portfolioRoutes from './routes/portfolio.js';
import paymentRoutes from './routes/payment.js'; 

dotenv.config(); // Initialize dotenv to read your .env file

const app = express();

// Use express.json() before routes
app.use(express.json());

// --- CORS Configuration (Production Ready) ---
// Ensure "https://projecthub-client.vercel.app" matches your actual frontend Vercel URL exactly
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://projecthub-client.vercel.app" 
    ],
    credentials: true
}));

// Serve static files (Note: Vercel is stateless; local 'uploads' will not persist)
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

// Test route to verify Database connection in production
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

// --- Vercel Serverless Export ---
// Standard app.listen is ignored by Vercel; the export is what matters
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

export default app;