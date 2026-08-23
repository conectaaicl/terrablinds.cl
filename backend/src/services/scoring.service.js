'use strict';

const { STALE_DAYS, SCORE_WEIGHTS: W } = require('../models/constants');

/**
 * Computes a deterministic 0–100 opportunity score with per-factor explanation.
 *
 * @param {object} opp     Plain opportunity object with `.status`
 * @param {object} ctx
 * @param {Array}  ctx.touchpoints  sorted by occurred_at DESC
 * @param {Array}  ctx.quotes
 * @param {Array}  ctx.events
 * @returns {{ score: number, factors: Array<{ label: string, delta: number }> }}
 */
function computeScore(opp, { touchpoints = [], quotes = [], events = [] } = {}) {
    const factors = [];
    let raw = 0;

    // ── 1. Stage ──────────────────────────────────────────────────────────────
    const stageScore = W.stage[opp.status];
    if (stageScore != null) {
        raw += stageScore;
        factors.push({ label: `Etapa: ${opp.status}`, delta: stageScore });
    }

    // ── 2. Touchpoints (capped) ───────────────────────────────────────────────
    if (touchpoints.length > 0) {
        const tpDelta = Math.min(touchpoints.length * W.touchpoint, W.maxTouchpoints);
        raw += tpDelta;
        factors.push({
            label: `${touchpoints.length} interacción${touchpoints.length > 1 ? 'es' : ''}`,
            delta: tpDelta,
        });
    }

    // ── 3. Has quote ──────────────────────────────────────────────────────────
    if (quotes.length > 0) {
        raw += W.hasQuote;
        factors.push({ label: 'Cotización creada', delta: W.hasQuote });
    }

    // ── 4. Has booking touchpoint ─────────────────────────────────────────────
    const bookingTp = touchpoints.find(tp => tp.source === 'booking');
    if (bookingTp) {
        raw += W.hasBooking;
        factors.push({ label: 'Reserva de servicio', delta: W.hasBooking });
    }

    // ── 5. Source bonus (on latest touchpoint) ────────────────────────────────
    const latestTp = touchpoints[0];
    if (latestTp && !bookingTp) {
        const srcBonus = W.source[latestTp.source] || 0;
        if (srcBonus > 0) {
            raw += srcBonus;
            factors.push({
                label: `Fuente: ${latestTp.source.replace(/_/g, ' ')}`,
                delta: srcBonus,
            });
        }
    }

    // ── 6. Stale penalty (days without activity) ──────────────────────────────
    const lastActivityDate = latestTp?.occurred_at || opp.updated_at || opp.created_at;
    const daysSinceActivity = Math.floor(
        (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity >= STALE_DAYS) {
        const penalty = Math.max(
            W.maxStalePenalty,
            W.stale * (daysSinceActivity - STALE_DAYS + 1)
        );
        raw += penalty;
        factors.push({ label: `${daysSinceActivity} días sin actividad`, delta: penalty });
    }

    const score = Math.max(0, Math.min(100, Math.round(raw)));
    return { score, factors };
}

module.exports = { computeScore };
