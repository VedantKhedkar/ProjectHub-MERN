import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js'; 
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/project.js';
import portfolioRoutes from './routes/portfolio.js';
import paymentRoutes from './routes/payment.js'; 

dotenv.config(); 

const app = express();

app.use(express.json());

// --- CORS Configuration (UPDATED FIX) ---
// This allows Localhost + ANY Vercel deployment (Production or Preview)
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://project-hub-mern-ct8u.vercel.app" // Your main production domain
        ];

        // Check if origin is in the allowed list OR if it is a Vercel preview/production URL
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// --- Vercel Serverless Export ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

export default app;