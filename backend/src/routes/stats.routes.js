const express = require('express');
const router = express.Router();
const { Config, sequelize } = require('../models');

// UA patterns that identify bots (case-insensitive)
const BOT_UA_RE = /bot|spider|crawler|dataprovider|adwords|chatglm|searchbot|duckassist|grokbot|baiduspider|yandex|prerender|pingdom|uptimerobot|semrush|ahrefsbot|mj12bot|petalbot/i;

// Google bot IP prefixes (crawlers that disguise UA as Chrome)
const BOT_IP_PREFIXES = ['66.249.', '74.125.', '66.102.'];

function isBot(ua, ip) {
    if (!ua) return false;
    if (BOT_UA_RE.test(ua)) return true;
    if (ip && BOT_IP_PREFIXES.some(p => ip.startsWith(p))) return true;
    return false;
}

function getClientIp(req) {
    // Cloudflare sets CF-Connecting-IP; fallback to first XFF entry
    return (
        req.headers['cf-connecting-ip'] ||
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.ip ||
        ''
    ).substring(0, 100);
}

// SQL condition to filter human visits (ua and ip stored from v2 onwards)
const HUMAN_WHERE = `
  (ua !~* 'bot|spider|crawler|dataprovider|adwords|chatglm|searchbot|duckassist|grokbot|baiduspider|yandex|prerender|pingdom|uptimerobot|semrush|ahrefsbot|mj12bot|petalbot')
  AND (ip IS NULL OR (ip NOT LIKE '66.249.%' AND ip NOT LIKE '74.125.%' AND ip NOT LIKE '66.102.%'))
`;

// POST /api/stats/visit
router.post('/visit', async (req, res) => {
    try {
        const page = String(req.body?.page || req.query?.page || '/').substring(0, 255);
        const ua   = String(req.headers['user-agent'] || '').substring(0, 500);
        const ip   = getClientIp(req);

        await sequelize.query(
            'INSERT INTO page_visits (visited_at, page, ip, ua) VALUES (NOW(), :page, :ip, :ua)',
            { replacements: { page, ip, ua }, type: sequelize.QueryTypes.INSERT }
        );

        // Only count humans toward the legacy total
        if (!isBot(ua, ip)) {
            const record = await Config.findOne({ where: { key: 'visit_count' } });
            if (record) {
                await record.update({ value: String((parseInt(record.value) || 0) + 1) });
                res.json({ visits: parseInt(record.value) });
            } else {
                await Config.create({ key: 'visit_count', value: '1', type: 'number' });
                res.json({ visits: 1 });
            }
        } else {
            const record = await Config.findOne({ where: { key: 'visit_count' } }).catch(() => null);
            res.json({ visits: parseInt(record?.value) || 0 });
        }
    } catch (error) {
        console.error('[stats] /visit failed:', error.message);
        res.json({ visits: 0 });
    }
});

// GET /api/stats/visits
router.get('/visits', async (req, res) => {
    try {
        const [rows] = await sequelize.query(`
            SELECT
                COUNT(*) FILTER (WHERE
                    (visited_at AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date
                    AND ${HUMAN_WHERE}) AS today,
                COUNT(*) FILTER (WHERE
                    (visited_at AT TIME ZONE 'America/Santiago')::date = (NOW() AT TIME ZONE 'America/Santiago')::date - 1
                    AND ${HUMAN_WHERE}) AS yesterday,
                COUNT(*) FILTER (WHERE
                    visited_at >= NOW() - INTERVAL '7 days'
                    AND ${HUMAN_WHERE}) AS week,
                COUNT(*) FILTER (WHERE ${HUMAN_WHERE}) AS total_human
            FROM page_visits
        `);

        const legacy = await Config.findOne({ where: { key: 'visit_count' } });
        const legacyTotal = parseInt(legacy?.value) || 0;

        res.json({
            visits:     legacyTotal,
            today:      parseInt(rows[0]?.today)        || 0,
            yesterday:  parseInt(rows[0]?.yesterday)    || 0,
            week:       parseInt(rows[0]?.week)         || 0,
            total_table: parseInt(rows[0]?.total_human) || 0,
        });
    } catch (error) {
        console.error('[stats] /visits query failed:', error.message);
        const record = await Config.findOne({ where: { key: 'visit_count' } }).catch(() => null);
        res.json({ visits: parseInt(record?.value) || 0, today: 0, yesterday: 0, week: 0, degraded: true });
    }
});

// POST /api/stats/wa-click
router.post('/wa-click', async (req, res) => {
    try {
        const position = String(req.body?.position || 'unknown').substring(0, 40);
        const page     = String(req.body?.page || '/').substring(0, 300);
        await sequelize.query(
            'INSERT INTO wa_clicks (position, page) VALUES (:position, :page)',
            { replacements: { position, page }, type: sequelize.QueryTypes.INSERT }
        );
        res.json({ ok: true });
    } catch (error) {
        res.json({ ok: false });
    }
});

// GET /api/stats/wa-clicks
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
            today:      parseInt(tot[0]?.today)  || 0,
            week:       parseInt(tot[0]?.week)   || 0,
            total:      parseInt(tot[0]?.total)  || 0,
            byPage:     byPage.map(r => ({ page: r.page, n: parseInt(r.n) })),
            byPosition: byPos.map(r => ({ position: r.position, n: parseInt(r.n) })),
        });
    } catch (error) {
        console.error('[stats] /wa-clicks failed:', error.message);
        res.json({ today: 0, week: 0, total: 0, byPage: [], byPosition: [], degraded: true });
    }
});

module.exports = router;
