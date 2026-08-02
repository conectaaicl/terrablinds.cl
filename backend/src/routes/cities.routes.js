const express = require('express');
const router = express.Router();
const { Config } = require('../models');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const KEY = 'ciudad_pages';

router.get('/', async (req, res) => {
  try {
    const row = await Config.findOne({ where: { key: KEY } });
    if (!row) return res.json([]);
    res.json(JSON.parse(row.value));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const row = await Config.findOne({ where: { key: KEY } });
    if (!row) return res.status(404).json({ error: 'Not found' });
    const cities = JSON.parse(row.value);
    const city = cities.find(c => c.slug === req.params.slug);
    if (!city) return res.status(404).json({ error: 'Not found' });
    res.json(city);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const cities = req.body;
    if (!Array.isArray(cities)) return res.status(400).json({ error: 'Expected array' });
    await Config.upsert({ key: KEY, value: JSON.stringify(cities), type: 'json' });
    res.json({ ok: true, count: cities.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
