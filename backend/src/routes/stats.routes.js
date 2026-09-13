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
        const [rows] = await sequelize.query(`
            SELECT
                COUNT(*) FILTER (WHERE visited_at >= NOW() AT TIME ZONE 'America/Santiago' - INTERVAL '0' DAY
                                   AND visited_at <  NOW() AT TIME ZONE 'America/Santiago' + INTERVAL '1' DAY)
                    AS today_approx,
                COUNT(*) FILTER (WHERE DATE(visited_at AT TIME ZONE 'America/Santiago') = CURRENT_DATE AT TIME ZONE 'America/Santiago')
                    AS today,
                COUNT(*) FILTER (WHERE DATE(visited_at AT TIME ZONE 'America/Santiago') = (CURRENT_DATE AT TIME ZONE 'America/Santiago') - 1)
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
        const record = await Config.findOne({ where: { key: 'visit_count' } }).catch(() => null);
        res.json({ visits: parseInt(record?.value) || 0, today: 0, yesterday: 0, week: 0 });
    }
});

module.exports = router;
