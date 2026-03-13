const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { cacheMiddleware } = require('./middleware/cacheMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ─── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Add your Firebase domains to ALLOWED_ORIGINS in .env (comma-separated)
// e.g. ALLOWED_ORIGINS=https://your-app.web.app,https://your-admin.web.app
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://physical-education-with-ravina.web.app',
    'https://physical-education-with-ravina.firebaseapp.com',
    'https://physical-education-with-ravina-admin.web.app',
    'https://physical-education-with-ravina-admin.firebaseapp.com',
    'https://learning-app-4xa9.onrender.com', // Added this as it's the domain from logs
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testRoutes = require('./routes/testRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Public cached routes (2 min TTL)
app.use('/api/courses', cacheMiddleware(120), courseRoutes);
app.use('/api/announcements', cacheMiddleware(120), announcementRoutes);
// Leaderboard cached 30s
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tests', cacheMiddleware(120), testRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);

const __dirname_path = path.resolve();
app.use('/uploads', express.static(path.join(__dirname_path, '/uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Physical Education API is running', status: 'ok' });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
