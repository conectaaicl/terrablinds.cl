'use strict';

jest.mock('../../models', () => ({
    Contact:          { findAll: jest.fn(), count: jest.fn(), findOne: jest.fn(), findAndCountAll: jest.fn() },
    Opportunity:      { findAll: jest.fn(), count: jest.fn(), findOne: jest.fn(), findAndCountAll: jest.fn() },
    Lead:             { count: jest.fn() },
    Touchpoint:       { findAll: jest.fn(), count: jest.fn() },
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
    enqueue:    jest.fn(),
}));

const { getLeadStats } = require('../../controllers/growth.controller');
const { Contact, Lead } = require('../../models');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};
const mockNext = jest.fn();

beforeEach(() => jest.resetAllMocks());

// ── getLeadStats ──────────────────────────────────────────────────────────────

describe('getLeadStats', () => {
    function setupMocks({
        contactsToday = 0, contacts7d = 0, contacts30d = 0, totalContacts = 0, lastContact = null,
        totalLeads = 0, leadsToday = 0, leads7d = 0, leads30d = 0, converted = 0,
    } = {}) {
        // Contact.count called for: today, 7d, 30d, total, distinct (converted)
        Contact.count
            .mockResolvedValueOnce(contactsToday)
            .mockResolvedValueOnce(contacts7d)
            .mockResolvedValueOnce(contacts30d)
            .mockResolvedValueOnce(totalContacts)
            .mockResolvedValueOnce(converted);
        Contact.findOne.mockResolvedValueOnce(lastContact);
        // Lead.count called for: total, today, 7d, 30d
        Lead.count
            .mockResolvedValueOnce(totalLeads)
            .mockResolvedValueOnce(leadsToday)
            .mockResolvedValueOnce(leads7d)
            .mockResolvedValueOnce(leads30d);
    }

    test('returns zero counts when tables are empty', async () => {
        setupMocks();
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            contacts: expect.objectContaining({ today: 0, last_7d: 0, last_30d: 0, total: 0 }),
            leads:    expect.objectContaining({ today: 0, last_7d: 0, total: 0 }),
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('returns correct counts when data exists', async () => {
        setupMocks({ contactsToday: 2, contacts7d: 5, contacts30d: 12, totalContacts: 20, converted: 18, totalLeads: 3, leadsToday: 1, leads7d: 3, leads30d: 10 });
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.contacts.today).toBe(2);
        expect(body.contacts.last_7d).toBe(5);
        expect(body.contacts.last_30d).toBe(12);
        expect(body.contacts.total).toBe(20);
        expect(body.contacts.converted_to_opportunity).toBe(18);
        expect(body.leads.today).toBe(1);
        expect(body.leads.last_7d).toBe(3);
        expect(body.leads.total).toBe(3);
    });

    test('last_at is null when no contacts exist', async () => {
        setupMocks({ lastContact: null });
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.contacts.last_at).toBeNull();
    });

    test('last_at reflects the most recent contact created_at', async () => {
        const ts = '2026-08-23T10:00:00.000Z';
        setupMocks({ lastContact: { created_at: ts } });
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.contacts.last_at).toBe(ts);
    });

    test('calls next on DB error', async () => {
        Contact.count.mockRejectedValueOnce(new Error('DB error'));
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(res.json).not.toHaveBeenCalled();
    });

    test('response structure contains required top-level keys', async () => {
        setupMocks({ contactsToday: 1, contacts7d: 2, contacts30d: 3, totalContacts: 4 });
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body).toHaveProperty('contacts');
        expect(body).toHaveProperty('leads');
        expect(body.contacts).toHaveProperty('today');
        expect(body.contacts).toHaveProperty('last_7d');
        expect(body.contacts).toHaveProperty('last_30d');
        expect(body.contacts).toHaveProperty('total');
        expect(body.contacts).toHaveProperty('last_at');
        expect(body.contacts).toHaveProperty('converted_to_opportunity');
        expect(body.leads).toHaveProperty('total');
        expect(body.leads).toHaveProperty('today');
        expect(body.leads).toHaveProperty('last_7d');
        expect(body.leads).toHaveProperty('last_30d');
    });

    test('leads counts are independent of contacts counts', async () => {
        // Different data: many contacts, few leads (some leads may have been deleted)
        setupMocks({ contactsToday: 5, contacts7d: 10, totalContacts: 100, totalLeads: 2, leadsToday: 0, leads7d: 1, leads30d: 2, converted: 80 });
        const req = {};
        const res = mockRes();
        await getLeadStats(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.contacts.total).toBe(100);
        expect(body.leads.total).toBe(2);
    });
});
