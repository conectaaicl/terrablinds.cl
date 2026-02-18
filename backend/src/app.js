const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Trust proxy (behind nginx in Docker)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compression
app.use(compression());

// CORS - restrict to allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check with uptime and version
const startedAt = new Date();
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'TerraBlinds API',
        uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    etag: true
}));

// Routes
const productRoutes = require('./routes/product.routes');
const quoteRoutes = require('./routes/quote.routes');
const authRoutes = require('./routes/auth.routes');
const configRoutes = require('./routes/config.routes');
const uploadRoutes = require('./routes/upload.routes');
const flowRoutes = require('./routes/flow.routes');
const contactRoutes = require('./routes/contact.routes');
const seoRoutes = require('./routes/seo.routes');

app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', flowRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', seoRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

module.exports = app;
