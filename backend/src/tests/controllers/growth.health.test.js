'use strict';

jest.mock('../../models', () => ({
    Contact:          { findAll: jest.fn(), count: jest.fn() },
    Opportunity:      { findAll: jest.fn(), count: jest.fn(), findOne: jest.fn(), findAndCountAll: jest.fn() },
    Touchpoint:       { findAll: jest.fn() },
    OpportunityEvent: { findAll: jest.fn() },
    Quote:            { findAll: jest.fn() },
    GeOutbox:         { count: jest.fn(), findOne: jest.fn() },
    FollowUp:         { count: jest.fn() },
    sequelize:        { fn: jest.fn(), col: jest.fn() },
}));

jest.mock('../../services/opportunity.service', () => ({
    transitionOpportunity: jest.fn(),
    VALID_TRANSITIONS:     {},
}));

jest.mock('../../services/scoring.service', () => ({
    computeScore: jest.fn().mockReturnValue({ score: 50, factors: [] }),
}));

jest.mock('../../services/ge_worker.service', () => ({
    isDegraded: jest.fn().mockReturnValue(false),
}));

const { getHealth, getAlerts } = require('../../controllers/growth.controller');
const { GeOutbox, FollowUp, Opportunity } = require('../../models');
const geWorker = require('../../services/ge_worker.service');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};
const mockNext = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
    geWorker.isDegraded.mockReturnValue(false);
});

// ── getHealth ─────────────────────────────────────────────────────────────────

describe('getHealth', () => {
    function setupHealthMocks({ pendingCount = 0, failedCount = 0, overdueCount = 0, staleCount = 0, oldestItem = null } = {}) {
        GeOutbox.count
            .mockResolvedValueOnce(pendingCount)
            .mockResolvedValueOnce(failedCount);
        GeOutbox.findOne.mockResolvedValueOnce(oldestItem);
        FollowUp.count.mockResolvedValueOnce(overdueCount);
        Opportunity.count.mockResolvedValueOnce(staleCount);
    }

    test('returns operational status when not degraded', async () => {
        setupHealthMocks({ pendingCount: 2, failedCount: 0, overdueCount: 1, staleCount: 3 });
        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ge_status:          'operational',
            overdue_follow_ups: 1,
            stale_opportunities: 3,
        }));
    });

    test('returns degraded status when isDegraded is true', async () => {
        geWorker.isDegraded.mockReturnValue(true);
        // When degraded, GeOutbox queries fail — simulate table not existing
        GeOutbox.count.mockRejectedValueOnce(new Error('table not found'));
        FollowUp.count.mockResolvedValueOnce(0);
        Opportunity.count.mockResolvedValueOnce(0);

        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ge_status: 'degraded',
            outbox:    null, // table unavailable
        }));
    });

    test('includes outbox pending count', async () => {
        setupHealthMocks({ pendingCount: 5, failedCount: 2 });
        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.outbox.pending).toBe(5);
        expect(call.outbox.failed).toBe(2);
    });

    test('oldest_pending_age_min is null when no pending items', async () => {
        setupHealthMocks({ pendingCount: 0, failedCount: 0, oldestItem: null });
        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.outbox.oldest_pending_age_min).toBeNull();
    });

    test('calls next on unexpected error', async () => {
        FollowUp.count.mockRejectedValueOnce(new Error('DB gone'));
        Opportunity.count.mockRejectedValueOnce(new Error('DB gone'));
        GeOutbox.count.mockRejectedValueOnce(new Error('no table'));
        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);
        // Either json was called (handled internally) or next was called
        // Since GeOutbox errors are caught internally, but FollowUp/Opp errors go to next:
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('returns ge_severity critical when degraded', async () => {
        geWorker.isDegraded.mockReturnValue(true);
        GeOutbox.count.mockRejectedValueOnce(new Error('no table'));
        FollowUp.count.mockResolvedValueOnce(0);
        Opportunity.count.mockResolvedValueOnce(0);

        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ge_status:   'degraded',
            ge_severity: 'critical',
        }));
    });

    test('returns ge_severity ok when operational', async () => {
        setupHealthMocks({ pendingCount: 0, failedCount: 0 });
        const req = {};
        const res = mockRes();
        await getHealth(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ge_status:   'operational',
            ge_severity: 'ok',
        }));
    });
});

// ── getAlerts ─────────────────────────────────────────────────────────────────

describe('getAlerts', () => {
    test('returns empty alerts when everything is healthy', async () => {
        FollowUp.count.mockResolvedValueOnce(0);
        Opportunity.count.mockResolvedValueOnce(0);
        geWorker.isDegraded.mockReturnValue(false);

        const req = {};
        const res = mockRes();
        await getAlerts(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total:  0,
            alerts: [],
        }));
    });

    test('includes overdue follow-up alert', async () => {
        FollowUp.count.mockResolvedValueOnce(3);
        Opportunity.count.mockResolvedValueOnce(0);

        const req = {};
        const res = mockRes();
        await getAlerts(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.total).toBe(3);
        expect(call.alerts).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'overdue_follow_ups', count: 3 }),
        ]));
    });

    test('includes stale opportunities alert', async () => {
        FollowUp.count.mockResolvedValueOnce(0);
        Opportunity.count.mockResolvedValueOnce(2);

        const req = {};
        const res = mockRes();
        await getAlerts(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.total).toBe(2);
        expect(call.alerts).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'stale_opportunities', count: 2 }),
        ]));
    });

    test('includes ge_degraded alert', async () => {
        FollowUp.count.mockResolvedValueOnce(0);
        Opportunity.count.mockResolvedValueOnce(0);
        geWorker.isDegraded.mockReturnValue(true);

        const req = {};
        const res = mockRes();
        await getAlerts(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.alerts).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'ge_degraded' }),
        ]));
    });

    test('sums all alert counts', async () => {
        FollowUp.count.mockResolvedValueOnce(2);
        Opportunity.count.mockResolvedValueOnce(4);
        geWorker.isDegraded.mockReturnValue(true);

        const req = {};
        const res = mockRes();
        await getAlerts(req, res, mockNext);

        const call = res.json.mock.calls[0][0];
        expect(call.total).toBe(7); // 2 + 4 + 1(degraded)
    });
});
