const { Quote } = require('../models');
const { sendQuoteEmail } = require('../services/email.service');

// Create quote (public, rate-limited)
exports.createQuote = async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, notes, items } = req.body;

        // Validation
        if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
            return res.status(400).json({ error: 'Valid customer name is required (min 2 characters)' });
        }

        if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
            return res.status(400).json({ error: 'Valid email address is required' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'At least one item is required' });
        }

        if (items.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 items per quote' });
        }

        // Sanitize items
        const sanitizedItems = items.map(item => ({
            productId: item.productId ? parseInt(item.productId) : null,
            productName: String(item.productName || item.product || '').substring(0, 200),
            category: String(item.category || '').substring(0, 100),
            width: parseFloat(item.width) || 0,
            height: parseFloat(item.height) || 0,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
        }));

        const total_amount = sanitizedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        const quote = await Quote.create({
            customer_name: customer_name.trim().substring(0, 200),
            customer_email: customer_email.trim().toLowerCase(),
            customer_phone: customer_phone ? String(customer_phone).substring(0, 20) : null,
            notes: notes ? String(notes).substring(0, 1000) : null,
            items: sanitizedItems,
            total_amount,
            status: 'pending'
        });

        // Send email notification (non-blocking - don't fail the quote if email fails)
        sendQuoteEmail(customer_email, quote).catch(err => {
            console.error('Email send failed (non-blocking):', err.message);
        });

        res.status(201).json(quote);
    } catch (error) {
        console.error('Error creating quote:', error.message);
        res.status(500).json({ error: 'Error creating quote' });
    }
};

// Get all quotes (admin only)
exports.getAllQuotes = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};

        if (status && ['pending', 'sent', 'accepted', 'rejected', 'completed'].includes(status)) {
            where.status = status;
        }

        const quotes = await Quote.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error.message);
        res.status(500).json({ error: 'Error fetching quotes' });
    }
};

// Get quote by ID (admin only)
exports.getQuoteById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid quote ID' });
        }

        const quote = await Quote.findByPk(id);
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error.message);
        res.status(500).json({ error: 'Error fetching quote' });
    }
};

// Update quote status (admin only)
exports.updateQuoteStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid quote ID' });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'contacted', 'sent', 'accepted', 'rejected', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const quote = await Quote.findByPk(id);
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        await quote.update({ status });
        res.json(quote);
    } catch (error) {
        console.error('Error updating quote:', error.message);
        res.status(500).json({ error: 'Error updating quote' });
    }
};
