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

// 1. JSON Middleware
app.use(express.json());

// 2. Optimized CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://project-hub-mern-ct8u.vercel.app",
    // Adding the specific preview URL that was blocked
    "https://projecthub-frontend-a42vuwbkd-vedantkhedkars-projects.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Check if origin is in our list OR is a Vercel deployment
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// 3. Static Files (For uploads)
app.use('/uploads', express.static('uploads'));

// 4. API Routes
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payment', paymentRoutes);

// 5. Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the ProjectHub Backend! Status: Active' });
});

// 6. Database Connection Test
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

// 7. Local Server Start (Ignored by Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

// 8. Export for Vercel
export default app;