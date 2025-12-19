import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js'; 
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/project.js';
import portfolioRoutes from './routes/portfolio.js';
import paymentRoutes from './routes/payment.js'; 
import { PrismaClient } from "@prisma/client"// <-- 1. IMPORT NEW ROUTES

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payment', paymentRoutes); // <-- 2. USE NEW ROUTES

// ... (rest of your / and /api/test routes) ...
// ... (existing / and /api/test routes) ...

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the ProjectHub Backend!' });
});

// Test route (you can keep this or remove it)
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


// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
export default app;