'use strict';

jest.mock('../../models', () => {
    const mockFU = {
        findAll:   jest.fn(),
        findByPk:  jest.fn(),
        create:    jest.fn(),
    };
    const mockOpp = { findByPk: jest.fn() };
    const mockContact = {};
    return {
        FollowUp:    mockFU,
        Opportunity: mockOpp,
        Contact:     mockContact,
    };
});

const { FollowUp, Opportunity } = require('../../models');
const {
    createFollowUp,
    listFollowUps,
    updateFollowUp,
    deleteFollowUp,
    listAllFollowUps,
} = require('../../controllers/followup.controller');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
}
const next = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
});

// ── createFollowUp ────────────────────────────────────────────────────────────

describe('createFollowUp()', () => {
    test('returns 400 for invalid opp id', async () => {
        const res = mockRes();
        await createFollowUp({ params: { id: 'abc' }, body: {} }, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 if opportunity not found', async () => {
        Opportunity.findByPk.mockResolvedValueOnce(null);
        const res = mockRes();
        await createFollowUp({ params: { id: '1' }, body: { scheduled_at: '2026-09-01' } }, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 400 if scheduled_at missing', async () => {
        Opportunity.findByPk.mockResolvedValueOnce({ id: 1 });
        const res = mockRes();
        await createFollowUp({ params: { id: '1' }, body: {} }, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('scheduled_at') }));
    });

    test('returns 400 for invalid type', async () => {
        Opportunity.findByPk.mockResolvedValueOnce({ id: 1 });
        const res = mockRes();
        await createFollowUp({ params: { id: '1' }, body: { scheduled_at: '2026-09-01', type: 'carrier_pigeon' } }, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('creates follow-up and returns 201', async () => {
        Opportunity.findByPk.mockResolvedValueOnce({ id: 1 });
        const fu = { id: 10, opportunity_id: 1, type: 'call', status: 'pending' };
        FollowUp.create.mockResolvedValueOnce(fu);
        const res = mockRes();
        await createFollowUp(
            { params: { id: '1' }, body: { scheduled_at: '2026-09-01T10:00:00Z', type: 'call', priority: 'high' } },
            res, next
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fu);
    });
});

// ── listFollowUps ─────────────────────────────────────────────────────────────

describe('listFollowUps()', () => {
    test('returns list for valid opp id', async () => {
        const items = [{ id: 1 }, { id: 2 }];
        FollowUp.findAll.mockResolvedValueOnce(items);
        const res = mockRes();
        await listFollowUps({ params: { id: '5' } }, res, next);
        expect(res.json).toHaveBeenCalledWith(items);
    });

    test('returns 400 for invalid opp id', async () => {
        const res = mockRes();
        await listFollowUps({ params: { id: '0' } }, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ── updateFollowUp ────────────────────────────────────────────────────────────

describe('updateFollowUp()', () => {
    test('returns 404 if not found', async () => {
        FollowUp.findByPk.mockResolvedValueOnce(null);
        const res = mockRes();
        await updateFollowUp({ params: { id: '99' }, body: {} }, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('sets completed_at when status → done', async () => {
        const fu = { id: 5, completed_at: null, update: jest.fn().mockResolvedValue(true) };
        FollowUp.findByPk.mockResolvedValueOnce(fu);
        const res = mockRes();
        await updateFollowUp({ params: { id: '5' }, body: { status: 'done' } }, res, next);
        expect(fu.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'done', completed_at: expect.any(Date) })
        );
    });

    test('does not overwrite existing completed_at', async () => {
        const existingDate = new Date('2026-08-01');
        const fu = { id: 5, completed_at: existingDate, update: jest.fn().mockResolvedValue(true) };
        FollowUp.findByPk.mockResolvedValueOnce(fu);
        const res = mockRes();
        await updateFollowUp({ params: { id: '5' }, body: { status: 'done' } }, res, next);
        const updateArg = fu.update.mock.calls[0][0];
        expect(updateArg.completed_at).toBeUndefined();
    });

    test('returns 400 for invalid status', async () => {
        FollowUp.findByPk.mockResolvedValueOnce({ id: 5 });
        const res = mockRes();
        await updateFollowUp({ params: { id: '5' }, body: { status: 'flying' } }, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ── deleteFollowUp ────────────────────────────────────────────────────────────

describe('deleteFollowUp()', () => {
    test('deletes and returns message', async () => {
        const fu = { id: 3, destroy: jest.fn().mockResolvedValue(true) };
        FollowUp.findByPk.mockResolvedValueOnce(fu);
        const res = mockRes();
        await deleteFollowUp({ params: { id: '3' } }, res, next);
        expect(fu.destroy).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('3') }));
    });

    test('returns 404 if not found', async () => {
        FollowUp.findByPk.mockResolvedValueOnce(null);
        const res = mockRes();
        await deleteFollowUp({ params: { id: '3' } }, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ── listAllFollowUps ──────────────────────────────────────────────────────────

describe('listAllFollowUps()', () => {
    test('returns all pending without scope', async () => {
        const items = [{ id: 1 }];
        FollowUp.findAll.mockResolvedValueOnce(items);
        const res = mockRes();
        await listAllFollowUps({ query: {} }, res, next);
        expect(res.json).toHaveBeenCalledWith(items);
    });

    test('passes scope=today date filter', async () => {
        FollowUp.findAll.mockResolvedValueOnce([]);
        const res = mockRes();
        await listAllFollowUps({ query: { scope: 'today' } }, res, next);
        const callArg = FollowUp.findAll.mock.calls[0][0];
        expect(callArg.where.scheduled_at).toBeDefined();
    });

    test('passes scope=overdue date filter', async () => {
        FollowUp.findAll.mockResolvedValueOnce([]);
        const res = mockRes();
        await listAllFollowUps({ query: { scope: 'overdue' } }, res, next);
        const callArg = FollowUp.findAll.mock.calls[0][0];
        expect(callArg.where.scheduled_at).toBeDefined();
    });

    test('passes priority filter when valid', async () => {
        FollowUp.findAll.mockResolvedValueOnce([]);
        const res = mockRes();
        await listAllFollowUps({ query: { priority: 'high' } }, res, next);
        const callArg = FollowUp.findAll.mock.calls[0][0];
        expect(callArg.where.priority).toBe('high');
    });

    test('ignores invalid priority', async () => {
        FollowUp.findAll.mockResolvedValueOnce([]);
        const res = mockRes();
        await listAllFollowUps({ query: { priority: 'extreme' } }, res, next);
        const callArg = FollowUp.findAll.mock.calls[0][0];
        expect(callArg.where.priority).toBeUndefined();
    });
});
