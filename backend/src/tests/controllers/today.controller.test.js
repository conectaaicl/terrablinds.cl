'use strict';

jest.mock('../../models', () => ({
    FollowUp:    { findAll: jest.fn() },
    Opportunity: { findAll: jest.fn() },
    Contact:     { findAll: jest.fn() },
    Touchpoint:  { findAll: jest.fn() },
}));

jest.mock('../../services/scoring.service', () => ({
    computeScore: jest.fn().mockReturnValue({ score: 42, factors: [] }),
}));

const { FollowUp, Opportunity, Contact, Touchpoint } = require('../../models');
const { getToday } = require('../../controllers/today.controller');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
}
const next = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
    // Default: all findAll return empty arrays
    FollowUp.findAll.mockResolvedValue([]);
    Opportunity.findAll.mockResolvedValue([]);
    Contact.findAll.mockResolvedValue([]);
    Touchpoint.findAll.mockResolvedValue([]);
    // Restore computeScore default (jest.resetAllMocks clears implementations from jest.mock factory)
    const { computeScore } = require('../../services/scoring.service');
    computeScore.mockReturnValue({ score: 42, factors: [] });
});

describe('getToday()', () => {
    test('returns expected keys in response', async () => {
        const res = mockRes();
        await getToday({}, res, next);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                summary:             expect.any(Object),
                overdue_follow_ups:  expect.any(Array),
                today_follow_ups:    expect.any(Array),
                stale_opportunities: expect.any(Array),
                new_uncontacted:     expect.any(Array),
                recent_activity:     expect.any(Array),
            })
        );
    });

    test('summary counts match data lengths', async () => {
        FollowUp.findAll
            .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // overdue
            .mockResolvedValueOnce([{ id: 3 }]);             // today
        const staleOpp = { get: (opts) => opts?.plain ? { id: 10, status: 'new', updated_at: new Date() } : { id: 10 } };
        Opportunity.findAll.mockResolvedValueOnce([staleOpp]);
        Contact.findAll.mockResolvedValueOnce([]);
        Touchpoint.findAll.mockResolvedValueOnce([]);

        const res = mockRes();
        await getToday({}, res, next);

        const call = res.json.mock.calls[0][0];
        expect(call.summary.overdue_follow_ups).toBe(2);
        expect(call.summary.today_follow_ups).toBe(1);
    });

    test('summary.stale_days is the STALE_DAYS constant', async () => {
        const res = mockRes();
        await getToday({}, res, next);
        const call = res.json.mock.calls[0][0];
        expect(typeof call.summary.stale_days).toBe('number');
        expect(call.summary.stale_days).toBeGreaterThan(0);
    });

    test('calls next(err) on unexpected error', async () => {
        FollowUp.findAll.mockRejectedValueOnce(new Error('DB gone'));
        const res = mockRes();
        await getToday({}, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('adds score to each stale opportunity', async () => {
        const staleOpp = { get: () => ({ id: 5, status: 'contacted', updated_at: new Date() }) };
        FollowUp.findAll.mockResolvedValue([]);
        Opportunity.findAll.mockResolvedValueOnce([staleOpp]);
        Contact.findAll.mockResolvedValueOnce([]);
        Touchpoint.findAll.mockResolvedValueOnce([]);

        const { computeScore } = require('../../services/scoring.service');
        computeScore.mockReturnValueOnce({ score: 77, factors: [{ label: 'Etapa', delta: 15 }] });

        const res = mockRes();
        await getToday({}, res, next);
        const call = res.json.mock.calls[0][0];
        expect(call.stale_opportunities[0].score).toBe(77);
    });
});
