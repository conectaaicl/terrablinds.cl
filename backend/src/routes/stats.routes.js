const express = require('express');
const router = express.Router();
const { Config } = require('../models');

const ADMIN_KEY = process.env.STATS_KEY || 'tb-stats-2026';

// ── Helpers ──────────────────────────────────────────────────────────────────
function todayKey() {
    return 'visits_day_' + new Date().toISOString().slice(0, 10); // visits_day_2026-07-31
}

async function incrementDay() {
    const key = todayKey();
    const rec = await Config.findOne({ where: { key } });
    if (rec) {
        await rec.update({ value: String((parseInt(rec.value) || 0) + 1) });
    } else {
        await Config.create({ key, value: '1', type: 'number' });
    }
}

async function getTotal() {
    const rec = await Config.findOne({ where: { key: 'visit_count' } });
    return parseInt(rec?.value) || 0;
}

async function getDailyBreakdown() {
    const { Op } = require('sequelize');
    const rows = await Config.findAll({
        where: { key: { [Op.like]: 'visits_day_%' } },
        order: [['key', 'DESC']],
        limit: 30,
    });
    return rows.map(r => ({ date: r.key.replace('visits_day_', ''), count: parseInt(r.value) || 0 }));
}

// ── POST /api/stats/visit — incrementa contador ───────────────────────────────
router.post('/visit', async (req, res) => {
    try {
        const rec = await Config.findOne({ where: { key: 'visit_count' } });
        let newCount;
        if (rec) {
            newCount = (parseInt(rec.value) || 0) + 1;
            await rec.update({ value: String(newCount) });
        } else {
            newCount = 1;
            await Config.create({ key: 'visit_count', value: '1', type: 'number' });
        }
        await incrementDay();
        res.json({ visits: newCount });
    } catch (error) {
        res.json({ visits: 0 });
    }
});

// ── GET /api/stats/visits — total público ─────────────────────────────────────
router.get('/visits', async (req, res) => {
    try {
        res.json({ visits: await getTotal() });
    } catch {
        res.json({ visits: 0 });
    }
});

// ── GET /api/stats/panel?key=... — panel HTML privado ────────────────────────
router.get('/panel', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).send('Acceso denegado');
    try {
        const total = await getTotal();
        const daily = await getDailyBreakdown();
        const maxDay = Math.max(...daily.map(d => d.count), 1);
        const rows = daily.map(d => {
            const pct = Math.round((d.count / maxDay) * 100);
            const isToday = d.date === new Date().toISOString().slice(0, 10);
            return `<tr${isToday ? ' style="background:#0a2a0a"' : ''}>
                <td style="padding:8px 14px;color:#aaa;font-size:13px">${d.date}${isToday ? ' <b style="color:#4ade80">HOY</b>' : ''}</td>
                <td style="padding:8px 14px">
                    <div style="background:#1a1a1a;border-radius:4px;height:16px;width:200px;overflow:hidden">
                        <div style="background:#2e7d32;height:100%;width:${pct}%;transition:width .3s"></div>
                    </div>
                </td>
                <td style="padding:8px 14px;color:#e0e0e0;font-weight:600;text-align:right">${d.count.toLocaleString('es-CL')}</td>
            </tr>`;
        }).join('');

        res.send(`<!DOCTYPE html><html lang="es"><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Visitas — TerraBlinds</title>
        <meta name="robots" content="noindex">
        <style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0d0d;color:#e0e0e0;font-family:system-ui,sans-serif;padding:32px 20px;max-width:700px;margin:0 auto}</style>
        </head><body>
        <p style="color:#666;font-size:12px;margin-bottom:24px">terrablinds.cl — panel privado</p>
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:32px">
            <span style="font-size:64px;font-weight:800;color:#4ade80;line-height:1">${total.toLocaleString('es-CL')}</span>
            <span style="color:#888;font-size:16px">visitas totales<br><span style="font-size:12px">desde el reset</span></span>
        </div>
        <h2 style="font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Últimos 30 días</h2>
        <table style="width:100%;border-collapse:collapse">${rows || '<tr><td colspan="3" style="padding:20px;color:#666;text-align:center">Sin datos aún — las visitas aparecerán aquí</td></tr>'}</table>
        <p style="margin-top:24px;color:#444;font-size:11px">Actualización automática cada carga de página · <a href="?key=${ADMIN_KEY}" style="color:#555">Refrescar</a></p>
        </body></html>`);
    } catch (e) {
        res.status(500).send('Error: ' + e.message);
    }
});

module.exports = router;
