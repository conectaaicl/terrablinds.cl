'use strict';

const { computeScore } = require('../../services/scoring.service');
const { STALE_DAYS } = require('../../models/constants');

const freshDate = () => new Date(Date.now() - 1 * 24 * 3600 * 1000); // yesterday

describe('computeScore()', () => {
    const baseOpp = { status: 'new', updated_at: freshDate(), created_at: freshDate() };

    test('returns score and factors', () => {
        const { score, factors } = computeScore(baseOpp);
        expect(typeof score).toBe('number');
        expect(Array.isArray(factors)).toBe(true);
    });

    test('score is clamped between 0 and 100', () => {
        const { score } = computeScore(baseOpp);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('stage score increases from new → quoted', () => {
        const stages = ['new', 'contacted', 'qualified', 'quoted'];
        let prev = -1;
        for (const status of stages) {
            const { score } = computeScore({ ...baseOpp, status });
            expect(score).toBeGreaterThan(prev);
            prev = score;
        }
    });

    test('touchpoints add score up to cap', () => {
        const { score: s0 } = computeScore(baseOpp, { touchpoints: [] });
        const { score: s5 } = computeScore(baseOpp, { touchpoints: Array(5).fill({ source: 'manual', occurred_at: freshDate() }) });
        const { score: s100 } = computeScore(baseOpp, { touchpoints: Array(100).fill({ source: 'manual', occurred_at: freshDate() }) });
        expect(s5).toBeGreaterThan(s0);
        // score at 100 touchpoints should equal score at 4 touchpoints (cap = 20 pts / 5 per tp = 4 tps)
        const { score: s4 } = computeScore(baseOpp, { touchpoints: Array(4).fill({ source: 'manual', occurred_at: freshDate() }) });
        expect(s100).toBe(s4);
    });

    test('quote adds score', () => {
        const { score: s0 } = computeScore(baseOpp);
        const { score: sQ } = computeScore(baseOpp, { quotes: [{ id: 1 }] });
        expect(sQ).toBeGreaterThan(s0);
    });

    test('booking touchpoint adds score (not double-counted with source)', () => {
        const tpBooking = { source: 'booking', occurred_at: freshDate() };
        const { score, factors } = computeScore(baseOpp, { touchpoints: [tpBooking] });
        const bookingFactor = factors.find(f => f.label === 'Reserva de servicio');
        expect(bookingFactor).toBeTruthy();
        expect(bookingFactor.delta).toBeGreaterThan(0);
        // Source bonus should NOT appear when booking touchpoint exists
        const sourceFactor = factors.find(f => f.label?.startsWith('Fuente:'));
        expect(sourceFactor).toBeUndefined();
    });

    test('stale penalty fires after STALE_DAYS days', () => {
        const staleDate = new Date(Date.now() - (STALE_DAYS + 2) * 24 * 3600 * 1000);
        const { score: fresh } = computeScore({ ...baseOpp, updated_at: freshDate() });
        const { score: stale, factors } = computeScore({ ...baseOpp, updated_at: staleDate });
        expect(stale).toBeLessThan(fresh);
        const staleFactor = factors.find(f => f.delta < 0);
        expect(staleFactor).toBeTruthy();
    });

    test('stale penalty is capped at maxStalePenalty', () => {
        const veryStale = new Date(Date.now() - 500 * 24 * 3600 * 1000);
        const { factors } = computeScore({ ...baseOpp, updated_at: veryStale });
        const staleFactor = factors.find(f => f.delta < 0);
        expect(staleFactor.delta).toBeGreaterThanOrEqual(-30);
    });

    test('no stale factor within STALE_DAYS', () => {
        const justInTime = new Date(Date.now() - (STALE_DAYS - 1) * 24 * 3600 * 1000);
        const { factors } = computeScore({ ...baseOpp, updated_at: justInTime });
        const staleFactor = factors.find(f => f.delta < 0);
        expect(staleFactor).toBeUndefined();
    });

    test('score is deterministic for same input', () => {
        const tp = [{ source: 'instagram', occurred_at: freshDate() }];
        const r1 = computeScore({ ...baseOpp, status: 'qualified' }, { touchpoints: tp });
        const r2 = computeScore({ ...baseOpp, status: 'qualified' }, { touchpoints: tp });
        expect(r1.score).toBe(r2.score);
    });
});
