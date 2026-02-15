const { Quote } = require('../models');

// Create quote
exports.createQuote = async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, notes, items } = req.body;

        // Calculate total
        const total_amount = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

        const quote = await Quote.create({
            customer_name,
            customer_email,
            customer_phone,
            notes,
            items,
            total_amount,
            status: 'pending'
        });

        // TODO: Send email notification

        res.status(201).json(quote);
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Error creating quote' });
    }
};

// Get all quotes
exports.getAllQuotes = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const quotes = await Quote.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Error fetching quotes' });
    }
};

// Get quote by ID
exports.getQuoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findByPk(id);

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Error fetching quote' });
    }
};

// Update quote status
exports.updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const quote = await Quote.findByPk(id);

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        await quote.update({ status });
        res.json(quote);
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: 'Error updating quote' });
    }
};
