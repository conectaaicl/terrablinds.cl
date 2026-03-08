const express = require('express');
const router = express.Router();
const { Config } = require('../models');

// Increment visit counter (called on every page load)
router.post('/visit', async (req, res) => {
    try {
        const record = await Config.findOne({ where: { key: 'visit_count' } });
        if (record) {
            const newCount = (parseInt(record.value) || 0) + 1;
            await record.update({ value: String(newCount) });
            res.json({ visits: newCount });
        } else {
            await Config.create({ key: 'visit_count', value: '1', type: 'number' });
            res.json({ visits: 1 });
        }
    } catch (error) {
        res.json({ visits: 0 }); // non-critical, always return 200
    }
});

// Get visit counter (public)
router.get('/visits', async (req, res) => {
    try {
        const record = await Config.findOne({ where: { key: 'visit_count' } });
        res.json({ visits: parseInt(record?.value) || 0 });
    } catch (error) {
        res.json({ visits: 0 });
    }
});

module.exports = router;
