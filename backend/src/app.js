const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic config endpoint (handled by config.routes.js)

app.get('/', (req, res) => {
    res.json({ message: 'TerraBlinds API is running' });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes - with error handling
try {
    const productRoutes = require('./routes/product.routes');
    app.use('/api/products', productRoutes);
} catch (e) { console.log('Product routes not loaded:', e.message); }

try {
    const quoteRoutes = require('./routes/quote.routes');
    app.use('/api/quotes', quoteRoutes);
} catch (e) { console.log('Quote routes not loaded:', e.message); }

try {
    const authRoutes = require('./routes/auth.routes');
    app.use('/api/auth', authRoutes);
} catch (e) { console.log('Auth routes not loaded:', e.message); }

try {
    const configRoutes = require('./routes/config.routes');
    app.use('/api/config', configRoutes);
} catch (e) { console.log('Config routes not loaded:', e.message); }

try {
    const uploadRoutes = require('./routes/upload.routes');
    app.use('/api/upload', uploadRoutes);
} catch (e) { console.log('Upload routes not loaded:', e.message); }

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
