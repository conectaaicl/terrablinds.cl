'use strict';

// ── Model mocks ───────────────────────────────────────────────────────────────

jest.mock('../../models', () => {
    const mockFn = () => jest.fn();
    const model = () => ({
        findAll:         mockFn(),
        findOne:         mockFn(),
        findByPk:        mockFn(),
        findAndCountAll: mockFn(),
        count:           mockFn(),
        create:          mockFn(),
    });

    const seq = {
        fn:  jest.fn((...args) => ({ fn: args[0], args: args.slice(1) })),
        col: jest.fn(c => c),
        transaction: jest.fn(),
    };

    return {
        Contact:           model(),
        Opportunity:       model(),
        Touchpoint:        model(),
        OpportunityEvent:  model(),
        Quote:             model(),
        GeOutbox:          model(),
        FollowUp:          model(),
        sequelize:         seq,
    };
});

jest.mock('../../services/opportunity.service', () => ({
    transitionOpportunity: jest.fn(),
    VALID_TRANSITIONS: {
        new:       ['contacted', 'qualified', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
        contacted: ['qualified', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
        qualified: ['contacted', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
        quoted:    ['contacted', 'qualified', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
        won: [], lost: [], spam: [], duplicate: [], out_of_coverage: [],
    },
}));

jest.mock('../../models/constants', () => ({
    OPPORTUNITY_STATUSES: [
        'new', 'contacted', 'qualified', 'quoted',
        'won', 'lost', 'spam', 'duplicate', 'out_of_coverage',
    ],
    TERMINAL_STATUSES: ['won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
    STALE_DAYS: 7,
    SOURCES: ['chat_widget', 'booking', 'form', 'manual'],
}));

jest.mock('../../services/scoring.service', () => ({
    computeScore: jest.fn().mockReturnValue({ score: 50, factors: [] }),
}));

jest.mock('../../services/ge_worker.service', () => ({
    isDegraded: jest.fn().mockReturnValue(false),
}));

const {
    getDashboard, getPipeline,
    listOpportunities, getOpportunity, transitionOpp,
    listContacts, getContact,
    listActivity,
} = require('../../controllers/growth.controller');

const { Contact, Opportunity, Touchpoint, OpportunityEvent, Quote } = require('../../models');
const { transitionOpportunity } = require('../../services/opportunity.service');
const { computeScore } = require('../../services/scoring.service');

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};
const mockNext = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
    mockNext.mockReset();
    // Restore default returns cleared by resetAllMocks
    computeScore.mockReturnValue({ score: 50, factors: [] });
});

// ── getDashboard ──────────────────────────────────────────────────────────────

describe('getDashboard', () => {
    test('returns aggregated dashboard shape on success', async () => {
        Opportunity.findAll.mockResolvedValueOnce([
            { status: 'new', cnt: '3' },
            { status: 'won', cnt: '2' },
            { status: 'lost', cnt: '1' },
        ]);
        Opportunity.findOne.mockResolvedValueOnce({ total: '4500.00' });
        Contact.findAll.mockResolvedValueOnce([{ id: 1, name: 'Ana' }]);
        Opportunity.count.mockResolvedValueOnce(1);
        Touchpoint.findAll.mockResolvedValueOnce([
            { source: 'chat_widget', cnt: '5' },
        ]);

        const req = { query: {} };
        const res = mockRes();
        await getDashboard(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            opportunities: expect.objectContaining({
                new: 3,
                won: 2,
                open: expect.any(Number),
            }),
            revenue: { won: 4500 },
            stale_count: 1,
            source_distribution: expect.arrayContaining([
                expect.objectContaining({ source: 'chat_widget', count: 5 }),
            ]),
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('propagates DB errors to next()', async () => {
        Opportunity.findAll.mockRejectedValueOnce(new Error('DB timeout'));
        const req = { query: {} };
        const res = mockRes();
        await getDashboard(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ message: 'DB timeout' }));
        expect(res.json).not.toHaveBeenCalled();
    });
});

// ── getPipeline ───────────────────────────────────────────────────────────────

describe('getPipeline', () => {
    function makeOpp(id, status) {
        return {
            id, status,
            get: jest.fn(() => ({
                id, status,
                touchpoints: [{ id: 99, source: 'chat_widget', occurred_at: new Date() }],
                quotes:      [{ id: 1 }, { id: 2 }],
                events:      [],
            })),
        };
    }

    test('groups open opportunities by status, excludes terminal', async () => {
        Opportunity.findAll.mockResolvedValueOnce([
            makeOpp(1, 'new'),
            makeOpp(2, 'quoted'),
            makeOpp(3, 'new'),
        ]);

        const req = { query: {} };
        const res = mockRes();
        await getPipeline(req, res, mockNext);

        const pipeline = res.json.mock.calls[0][0];
        expect(pipeline).toHaveProperty('new');
        expect(pipeline).toHaveProperty('contacted');
        expect(pipeline).toHaveProperty('qualified');
        expect(pipeline).toHaveProperty('quoted');
        expect(pipeline.new).toHaveLength(2);
        expect(pipeline.quoted).toHaveLength(1);
        expect(pipeline).not.toHaveProperty('won');
        expect(pipeline).not.toHaveProperty('lost');
    });

    test('maps last_touchpoint + quote_count, strips raw arrays', async () => {
        Opportunity.findAll.mockResolvedValueOnce([makeOpp(5, 'new')]);

        const req = { query: {} };
        const res = mockRes();
        await getPipeline(req, res, mockNext);

        const opp = res.json.mock.calls[0][0].new[0];
        expect(opp.last_touchpoint).toBeTruthy();
        expect(opp.quote_count).toBe(2);
        expect(opp.touchpoints).toBeUndefined();
        expect(opp.quotes).toBeUndefined();
        expect(opp.valid_transitions).toEqual(
            expect.arrayContaining(['contacted', 'qualified']),
        );
    });
});

// ── listOpportunities ─────────────────────────────────────────────────────────

describe('listOpportunities', () => {
    // Helper: setup the three bulk-score queries that listOpportunities now issues
    function setupScoreMocks() {
        Touchpoint.findAll.mockResolvedValueOnce([]);
        Quote.findAll.mockResolvedValueOnce([]);
        OpportunityEvent.findAll.mockResolvedValueOnce([]);
    }

    function makeRow(id) {
        return { id, get: jest.fn(() => ({ id, status: 'new', created_at: new Date() })) };
    }

    test('returns paginated result with default page/limit', async () => {
        Opportunity.findAndCountAll.mockResolvedValueOnce({ count: 5, rows: [makeRow(1), makeRow(2)] });
        setupScoreMocks();

        const req = { query: {} };
        const res = mockRes();
        await listOpportunities(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total: 5, page: 1, limit: 20,
            data: expect.any(Array),
        }));
    });

    test('applies status filter when status is valid', async () => {
        Opportunity.findAndCountAll.mockResolvedValueOnce({ count: 2, rows: [] });

        const req = { query: { status: 'won' } };
        const res = mockRes();
        await listOpportunities(req, res, mockNext);

        const call = Opportunity.findAndCountAll.mock.calls[0][0];
        expect(call.where).toMatchObject({ status: 'won' });
    });

    test('ignores invalid status filter', async () => {
        Opportunity.findAndCountAll.mockResolvedValueOnce({ count: 0, rows: [] });

        const req = { query: { status: 'INVALID_STATUS' } };
        const res = mockRes();
        await listOpportunities(req, res, mockNext);

        const call = Opportunity.findAndCountAll.mock.calls[0][0];
        expect(call.where).not.toHaveProperty('status');
    });

    test('passes q to contact include filter and sets required:true', async () => {
        Opportunity.findAndCountAll.mockResolvedValueOnce({ count: 1, rows: [] });

        const req = { query: { q: 'Ana' } };
        const res = mockRes();
        await listOpportunities(req, res, mockNext);

        const call  = Opportunity.findAndCountAll.mock.calls[0][0];
        const inc   = call.include[0];
        expect(inc.required).toBe(true);
        expect(inc.where).toBeDefined();
    });

    test('includes score field in each row', async () => {
        Opportunity.findAndCountAll.mockResolvedValueOnce({ count: 1, rows: [makeRow(7)] });
        setupScoreMocks();
        computeScore.mockReturnValueOnce({ score: 73, factors: [] });

        const req = { query: {} };
        const res = mockRes();
        await listOpportunities(req, res, mockNext);

        const data = res.json.mock.calls[0][0].data;
        expect(data[0]).toHaveProperty('score', 73);
    });
});

// ── getOpportunity ────────────────────────────────────────────────────────────

describe('getOpportunity', () => {
    test('returns 360° view with valid_transitions', async () => {
        const opp = {
            status: 'new',
            get: jest.fn(() => ({ id: 1, status: 'new', touchpoints: [], events: [], quotes: [], contact: null })),
        };
        Opportunity.findByPk.mockResolvedValueOnce(opp);

        const req = { params: { id: '1' } };
        const res = mockRes();
        await getOpportunity(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.valid_transitions).toEqual(
            expect.arrayContaining(['contacted', 'won']),
        );
    });

    test('returns 404 when opportunity not found', async () => {
        Opportunity.findByPk.mockResolvedValueOnce(null);

        const req = { params: { id: '999' } };
        const res = mockRes();
        await getOpportunity(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });

    test('returns 400 for non-numeric id', async () => {
        const req = { params: { id: 'abc' } };
        const res = mockRes();
        await getOpportunity(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('valid_transitions for terminal status is empty array', async () => {
        const opp = {
            status: 'won',
            get: jest.fn(() => ({ id: 2, status: 'won', touchpoints: [], events: [], quotes: [], contact: null })),
        };
        Opportunity.findByPk.mockResolvedValueOnce(opp);

        const req = { params: { id: '2' } };
        const res = mockRes();
        await getOpportunity(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.valid_transitions).toEqual([]);
    });
});

// ── transitionOpp ─────────────────────────────────────────────────────────────

describe('transitionOpp', () => {
    test('calls transitionOpportunity with correct actor and returns updated opp', async () => {
        const updatedOpp = { id: 5, status: 'contacted', won_amount: null, won_at: null, updated_at: new Date() };
        transitionOpportunity.mockResolvedValueOnce(updatedOpp);

        const req = {
            params: { id: '5' },
            body:   { to_status: 'contacted', note: 'First call done' },
            user:   { email: 'admin@terrablinds.cl' },
        };
        const res = mockRes();
        await transitionOpp(req, res, mockNext);

        expect(transitionOpportunity).toHaveBeenCalledWith(
            5, 'contacted', 'admin@terrablinds.cl', 'First call done', expect.any(Object),
        );
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: 5, status: 'contacted',
        }));
    });

    test('returns 400 for invalid to_status', async () => {
        const req = {
            params: { id: '5' },
            body:   { to_status: 'not_a_status' },
            user:   { email: 'admin@terrablinds.cl' },
        };
        const res = mockRes();
        await transitionOpp(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(transitionOpportunity).not.toHaveBeenCalled();
    });

    test('returns 400 when service throws "Invalid transition"', async () => {
        transitionOpportunity.mockRejectedValueOnce(new Error('Invalid transition: new → contacted'));

        const req = {
            params: { id: '5' },
            body:   { to_status: 'contacted' },
            user:   { id: 42 },
        };
        const res = mockRes();
        await transitionOpp(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('uses req.user.email as actor; falls back to id.toString()', async () => {
        transitionOpportunity.mockResolvedValueOnce({
            id: 6, status: 'won', won_amount: 1500, won_at: new Date(), updated_at: new Date(),
        });

        const req = {
            params: { id: '6' },
            body:   { to_status: 'won', won_amount: 1500 },
            user:   { id: 99 },  // no email
        };
        const res = mockRes();
        await transitionOpp(req, res, mockNext);

        expect(transitionOpportunity).toHaveBeenCalledWith(
            6, 'won', '99', null, expect.objectContaining({ wonAmount: 1500 }),
        );
    });
});

// ── listContacts ──────────────────────────────────────────────────────────────

describe('listContacts', () => {
    test('returns paginated contacts list', async () => {
        Contact.findAndCountAll.mockResolvedValueOnce({
            count: 10,
            rows: [{ id: 1, name: 'Ana' }, { id: 2, name: 'Luis' }],
        });

        const req = { query: { page: '2', limit: '5' } };
        const res = mockRes();
        await listContacts(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total: 10, page: 2, limit: 5, pages: 2,
        }));
    });

    test('applies q filter on name/email/phone', async () => {
        Contact.findAndCountAll.mockResolvedValueOnce({ count: 1, rows: [] });

        const req = { query: { q: 'maria' } };
        const res = mockRes();
        await listContacts(req, res, mockNext);

        const call = Contact.findAndCountAll.mock.calls[0][0];
        expect(call.where).toBeDefined();
    });
});

// ── getContact ────────────────────────────────────────────────────────────────

describe('getContact', () => {
    test('returns contact with opportunities + phone_match_count', async () => {
        const contact = {
            phone_normalized: '+56912345678',
            get: jest.fn(() => ({
                id: 1, name: 'Ana', phone_normalized: '+56912345678',
                opportunities: [],
            })),
        };
        Contact.findByPk.mockResolvedValueOnce(contact);
        Contact.count.mockResolvedValueOnce(2);

        const req = { params: { id: '1' } };
        const res = mockRes();
        await getContact(req, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            phone_match_count: 2,
        }));
    });

    test('returns 404 when contact not found', async () => {
        Contact.findByPk.mockResolvedValueOnce(null);

        const req = { params: { id: '999' } };
        const res = mockRes();
        await getContact(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ── listActivity ──────────────────────────────────────────────────────────────

describe('listActivity', () => {
    const makeTp = (id, at) => ({
        occurred_at: at,
        toJSON: () => ({ id, source: 'chat_widget', occurred_at: at }),
    });
    const makeEv = (id, at) => ({
        created_at: at,
        toJSON: () => ({ id, from_status: 'new', to_status: 'contacted', created_at: at }),
    });

    test('merges touchpoints + events sorted by date DESC', async () => {
        const older = new Date('2026-08-01T10:00:00Z');
        const newer = new Date('2026-08-15T10:00:00Z');

        Touchpoint.findAll.mockResolvedValueOnce([makeTp(10, older)]);
        OpportunityEvent.findAll.mockResolvedValueOnce([makeEv(20, newer)]);

        const req = { query: {} };
        const res = mockRes();
        await listActivity(req, res, mockNext);

        const body = res.json.mock.calls[0][0];
        expect(body.data[0].type).toBe('event');   // newer first
        expect(body.data[1].type).toBe('touchpoint');
    });

    test('type=touchpoint excludes events', async () => {
        Touchpoint.findAll.mockResolvedValueOnce([makeTp(1, new Date())]);

        const req = { query: { type: 'touchpoint' } };
        const res = mockRes();
        await listActivity(req, res, mockNext);

        expect(OpportunityEvent.findAll).not.toHaveBeenCalled();
        const body = res.json.mock.calls[0][0];
        expect(body.data.every(d => d.type === 'touchpoint')).toBe(true);
    });

    test('type=event excludes touchpoints', async () => {
        OpportunityEvent.findAll.mockResolvedValueOnce([makeEv(1, new Date())]);

        const req = { query: { type: 'event' } };
        const res = mockRes();
        await listActivity(req, res, mockNext);

        expect(Touchpoint.findAll).not.toHaveBeenCalled();
        const body = res.json.mock.calls[0][0];
        expect(body.data.every(d => d.type === 'event')).toBe(true);
    });
});
