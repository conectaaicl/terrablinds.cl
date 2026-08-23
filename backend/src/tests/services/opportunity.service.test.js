'use strict';

jest.mock('../../models', () => {
    return {
        sequelize: {
            transaction: jest.fn(),
        },
        Opportunity: {
            findOne:  jest.fn(),
            findByPk: jest.fn(),
            create:   jest.fn(),
        },
        OpportunityEvent: {
            create: jest.fn(),
        },
    };
});

const { findOrCreateOpportunity, transitionOpportunity, VALID_TRANSITIONS } = require('../../services/opportunity.service');
const { Opportunity, OpportunityEvent, sequelize } = require('../../models');

const mockTx = { LOCK: { UPDATE: 'UPDATE' } };

beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockImplementation(async (cb) => cb(mockTx));
});

// ── findOrCreateOpportunity ───────────────────────────────────────────────────

describe('findOrCreateOpportunity', () => {
    test('creates new opportunity when no open one exists for the contact', async () => {
        Opportunity.findOne.mockResolvedValueOnce(null);
        const newOpp = { id: 1, contact_id: 10, status: 'new' };
        Opportunity.create.mockResolvedValueOnce(newOpp);

        const result = await findOrCreateOpportunity(10, { productInterest: 'Roller Blackout' });

        expect(Opportunity.create).toHaveBeenCalledWith(
            expect.objectContaining({ contact_id: 10, status: 'new', product_interest: 'Roller Blackout' }),
            expect.anything(),
        );
        expect(result.created).toBe(true);
        expect(result.opportunity).toBe(newOpp);
    });

    test('reuses existing open opportunity (status: contacted)', async () => {
        const existingOpp = { id: 5, contact_id: 10, status: 'contacted' };
        Opportunity.findOne.mockResolvedValueOnce(existingOpp);

        const result = await findOrCreateOpportunity(10);

        expect(Opportunity.create).not.toHaveBeenCalled();
        expect(result.created).toBe(false);
        expect(result.opportunity).toBe(existingOpp);
    });

    test('creates new opportunity after a terminal one (findOne returns null because terminal are excluded)', async () => {
        Opportunity.findOne.mockResolvedValueOnce(null); // query filters out terminal statuses
        const freshOpp = { id: 6, contact_id: 10, status: 'new' };
        Opportunity.create.mockResolvedValueOnce(freshOpp);

        const result = await findOrCreateOpportunity(10);

        expect(result.created).toBe(true);
        expect(result.opportunity).toBe(freshOpp);
    });

    test('queries by contact_id excluding terminal statuses', async () => {
        Opportunity.findOne.mockResolvedValueOnce(null);
        Opportunity.create.mockResolvedValueOnce({ id: 1 });

        await findOrCreateOpportunity(99);

        const call = Opportunity.findOne.mock.calls[0][0];
        expect(call.where.contact_id).toBe(99);
        // Status filter must be an Op (object), not a plain string
        expect(typeof call.where.status).toBe('object');
    });

    test('orders by created_at DESC to get most recent open opportunity', async () => {
        Opportunity.findOne.mockResolvedValueOnce(null);
        Opportunity.create.mockResolvedValueOnce({ id: 1 });

        await findOrCreateOpportunity(5);

        const call = Opportunity.findOne.mock.calls[0][0];
        expect(call.order).toEqual([['created_at', 'DESC']]);
    });
});

// ── VALID_TRANSITIONS structure ───────────────────────────────────────────────

describe('VALID_TRANSITIONS', () => {
    test('all terminal statuses have no outbound transitions', () => {
        const { TERMINAL_STATUSES } = require('../../models/constants');
        for (const status of TERMINAL_STATUSES) {
            expect(VALID_TRANSITIONS[status]).toEqual([]);
        }
    });

    test('new status can transition to all other statuses', () => {
        const { OPPORTUNITY_STATUSES } = require('../../models/constants');
        const otherStatuses = OPPORTUNITY_STATUSES.filter(s => s !== 'new');
        for (const s of otherStatuses) {
            expect(VALID_TRANSITIONS.new).toContain(s);
        }
    });
});

// ── transitionOpportunity ─────────────────────────────────────────────────────

describe('transitionOpportunity', () => {
    function makeMockOpp(status) {
        const opp = {
            id:         1,
            status,
            won_at:     null,
            won_amount: null,
            update:     jest.fn(async (updates) => { Object.assign(opp, updates); return opp; }),
        };
        return opp;
    }

    test('valid transition: new → contacted', async () => {
        const opp = makeMockOpp('new');
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        OpportunityEvent.create.mockResolvedValueOnce({ id: 1 });

        await transitionOpportunity(1, 'contacted', 'admin@tb.cl', 'Primera llamada');

        expect(opp.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'contacted' }),
            expect.anything(),
        );
        expect(OpportunityEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                from_status: 'new',
                to_status:   'contacted',
                actor:       'admin@tb.cl',
                note:        'Primera llamada',
            }),
            expect.anything(),
        );
    });

    test('valid transition: quoted → won — sets won_at and won_amount', async () => {
        const opp = makeMockOpp('quoted');
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        OpportunityEvent.create.mockResolvedValueOnce({ id: 2 });

        await transitionOpportunity(1, 'won', 'admin@tb.cl', 'Cerrado', { wonAmount: 350000 });

        expect(opp.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'won', won_amount: 350000, won_at: expect.any(Date) }),
            expect.anything(),
        );
    });

    test('won_amount is NOT set when not provided in options', async () => {
        const opp = makeMockOpp('quoted');
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        OpportunityEvent.create.mockResolvedValueOnce({ id: 3 });

        await transitionOpportunity(1, 'won', null, null); // no wonAmount

        const updateArg = opp.update.mock.calls[0][0];
        expect(updateArg).toHaveProperty('won_at');
        expect(updateArg).not.toHaveProperty('won_amount');
    });

    test('invalid transition: won → contacted throws (terminal → open blocked)', async () => {
        const opp = makeMockOpp('won');
        Opportunity.findByPk.mockResolvedValueOnce(opp);

        await expect(
            transitionOpportunity(1, 'contacted'),
        ).rejects.toThrow(/Invalid transition/);

        expect(OpportunityEvent.create).not.toHaveBeenCalled();
        expect(opp.update).not.toHaveBeenCalled();
    });

    test('invalid transition: lost → quoted throws', async () => {
        const opp = makeMockOpp('lost');
        Opportunity.findByPk.mockResolvedValueOnce(opp);

        await expect(
            transitionOpportunity(1, 'quoted'),
        ).rejects.toThrow(/Invalid transition/);
    });

    test('invalid transition: spam → new throws', async () => {
        const opp = makeMockOpp('spam');
        Opportunity.findByPk.mockResolvedValueOnce(opp);

        await expect(
            transitionOpportunity(1, 'new'),
        ).rejects.toThrow(/Invalid transition/);
    });

    test('throws when opportunity not found', async () => {
        Opportunity.findByPk.mockResolvedValueOnce(null);

        await expect(
            transitionOpportunity(999, 'contacted'),
        ).rejects.toThrow('not found');
    });

    test('throws on completely unknown target status', async () => {
        await expect(
            transitionOpportunity(1, 'pending_review'),
        ).rejects.toThrow(/Unknown status/);
    });

    test('records OpportunityEvent with correct from/to statuses', async () => {
        const opp = makeMockOpp('contacted');
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        OpportunityEvent.create.mockResolvedValueOnce({ id: 4 });

        await transitionOpportunity(1, 'qualified', null, 'Calificado por formulario');

        expect(OpportunityEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                from_status:    'contacted',
                to_status:      'qualified',
                note:           'Calificado por formulario',
                actor:          null,
            }),
            expect.anything(),
        );
    });

    test('uses supplied external transaction when provided', async () => {
        const externalTx = { LOCK: { UPDATE: 'UPDATE_EXT' } };
        const opp = makeMockOpp('new');
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        OpportunityEvent.create.mockResolvedValueOnce({ id: 5 });

        await transitionOpportunity(1, 'contacted', null, null, { transaction: externalTx });

        // sequelize.transaction should NOT have been called (external tx reused)
        expect(sequelize.transaction).not.toHaveBeenCalled();
        // findByPk should have received the external transaction
        expect(Opportunity.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
            transaction: externalTx,
        }));
    });
});
