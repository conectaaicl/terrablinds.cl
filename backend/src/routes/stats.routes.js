const express = require('express');
const router = express.Router();
const { Config, sequelize } = require('../models');

// Increment visit — inserts a timestamped row AND updates legacy counter
router.post('/visit', async (req, res) => {
    try {
        const page = req.body?.page || req.query?.page || '/';
        await sequelize.query(
            'INSERT INTO page_visits (visited_at, page) VALUES (NOW(), :page)',
            { replacements: { page }, type: sequelize.QueryTypes.INSERT }
        );

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
        res.json({ visits: 0 });
    }
});

// GET /api/stats/visits — total + today + yesterday
router.get('/visits', async (req, res) => {
    try {
        // "Hoy" en hora de Chile: pasar NOW() a esa zona y quedarse con la fecha.
        // Comparar date con date; la versión anterior mezclaba timestamp e integer y reventaba.
        const [rows] = await sequelize.query(`
            SELECT
                COUNT(*) FILTER (WHERE (visited_at AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date)
                    AS today,
                COUNT(*) FILTER (WHERE (visited_at AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date - 1)
                    AS yesterday,
                COUNT(*) FILTER (WHERE visited_at >= NOW() - INTERVAL '7 days')
                    AS week,
                COUNT(*) AS total_table
            FROM page_visits
        `);

        const legacy = await Config.findOne({ where: { key: 'visit_count' } });
        const legacyTotal = parseInt(legacy?.value) || 0;

        res.json({
            visits: legacyTotal,
            today: parseInt(rows[0]?.today) || 0,
            yesterday: parseInt(rows[0]?.yesterday) || 0,
            week: parseInt(rows[0]?.week) || 0,
            total_table: parseInt(rows[0]?.total_table) || 0,
        });
    } catch (error) {
        console.error('[stats] /visits query failed, returning legacy total only:', error.message);
        const record = await Config.findOne({ where: { key: 'visit_count' } }).catch(() => null);
        res.json({ visits: parseInt(record?.value) || 0, today: 0, yesterday: 0, week: 0, degraded: true });
    }
});

// POST /api/stats/wa-click — registra un click a WhatsApp (position + page)
router.post('/wa-click', async (req, res) => {
    try {
        const position = String(req.body?.position || 'unknown').substring(0, 40);
        const page = String(req.body?.page || '/').substring(0, 300);
        await sequelize.query(
            'INSERT INTO wa_clicks (position, page) VALUES (:position, :page)',
            { replacements: { position, page }, type: sequelize.QueryTypes.INSERT }
        );
        res.json({ ok: true });
    } catch (error) {
        res.json({ ok: false });
    }
});

// GET /api/stats/wa-clicks — agregados para el admin
router.get('/wa-clicks', async (req, res) => {
    try {
        const [tot] = await sequelize.query(`
            SELECT
                COUNT(*) FILTER (WHERE (created_at AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date) AS today,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS week,
                COUNT(*) AS total
            FROM wa_clicks
        `);
        const [byPage] = await sequelize.query(`
            SELECT page, COUNT(*) AS n FROM wa_clicks
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY page ORDER BY n DESC LIMIT 8
        `);
        const [byPos] = await sequelize.query(`
            SELECT position, COUNT(*) AS n FROM wa_clicks
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY position ORDER BY n DESC LIMIT 8
        `);
        res.json({
            today: parseInt(tot[0]?.today) || 0,
            week: parseInt(tot[0]?.week) || 0,
            total: parseInt(tot[0]?.total) || 0,
            byPage: byPage.map(r => ({ page: r.page, n: parseInt(r.n) })),
            byPosition: byPos.map(r => ({ position: r.position, n: parseInt(r.n) })),
        });
    } catch (error) {
        console.error('[stats] /wa-clicks failed:', error.message);
        res.json({ today: 0, week: 0, total: 0, byPage: [], byPosition: [], degraded: true });
    }
});

module.exports = router;
