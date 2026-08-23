'use strict';

jest.mock('../../models', () => ({
    sequelize: {
        transaction: jest.fn(),
    },
    Contact: {
        findOrCreate: jest.fn(),
        findAll:      jest.fn(),
        create:       jest.fn(),
    },
    Opportunity: {
        findOne:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
    },
    Touchpoint: {
        findOne: jest.fn(),
        create:  jest.fn(),
    },
    OpportunityEvent: {
        create: jest.fn(),
    },
}));

const { ingestLead } = require('../../services/ingest.service');
const { sequelize, Contact, Opportunity, Touchpoint } = require('../../models');

const mockTx      = { LOCK: { UPDATE: 'UPDATE' } };
const mockContact = { id: 1, email: 'test@tb.cl', name: 'Test', phone: null, phone_normalized: null, notes: null };
const mockOpp     = { id: 10, contact_id: 1, status: 'new' };
const mockTp      = { id: 100, source: 'website_form', external_ref: null, opportunity_id: 10 };

beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockImplementation(async (cb) => cb(mockTx));
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe('ingestLead — successful ingest', () => {
    beforeEach(() => {
        Touchpoint.findOne.mockResolvedValue(null);
        Contact.findOrCreate.mockResolvedValue([mockContact, true]);
        Opportunity.findOne.mockResolvedValue(null);
        Opportunity.create.mockResolvedValue(mockOpp);
        Touchpoint.create.mockResolvedValue(mockTp);
    });

    test('returns contact, opportunity, touchpoint and correct flags', async () => {
        const result = await ingestLead({
            source:  'website_form',
            contact: { name: 'Test', email: 'test@tb.cl' },
        });

        expect(result.contact).toBe(mockContact);
        expect(result.opportunity).toBe(mockOpp);
        expect(result.touchpoint).toBe(mockTp);
        expect(result.contactCreated).toBe(true);
        expect(result.opportunityCreated).toBe(true);
        expect(result.duplicate).toBe(false);
    });

    test('passes metadata and channelDetail to Touchpoint.create', async () => {
        await ingestLead({
            source:        'meta_ads',
            contact:       { email: 'a@b.cl' },
            metadata:      { campaign: 'summer_2026', utm_source: 'facebook' },
            channelDetail: 'FB-CTA-001',
        });

        expect(Touchpoint.create).toHaveBeenCalledWith(
            expect.objectContaining({
                source:         'meta_ads',
                channel_detail: 'FB-CTA-001',
                metadata:       expect.objectContaining({ campaign: 'summer_2026' }),
            }),
            expect.anything(),
        );
    });

    test('reuses existing open opportunity for same contact', async () => {
        const existingOpp = { id: 5, contact_id: 1, status: 'contacted' };
        Opportunity.findOne.mockResolvedValueOnce(existingOpp);

        const result = await ingestLead({
            source:  'chat_widget',
            contact: { email: 'test@tb.cl' },
        });

        expect(Opportunity.create).not.toHaveBeenCalled();
        expect(result.opportunityCreated).toBe(false);
        expect(result.opportunity).toBe(existingOpp);
    });

    test('passes occurredAt as Date to Touchpoint.create', async () => {
        const dt = new Date('2026-01-15T10:30:00Z');
        await ingestLead({
            source:     'booking',
            contact:    { email: 'x@tb.cl' },
            occurredAt: dt,
        });

        expect(Touchpoint.create).toHaveBeenCalledWith(
            expect.objectContaining({ occurred_at: dt }),
            expect.anything(),
        );
    });

    test('converts string occurredAt to Date', async () => {
        await ingestLead({
            source:     'website_form',
            contact:    { email: 'x@tb.cl' },
            occurredAt: '2026-06-01T09:00:00Z',
        });

        const call = Touchpoint.create.mock.calls[0][0];
        expect(call.occurred_at).toBeInstanceOf(Date);
    });
});

// ── Idempotency ───────────────────────────────────────────────────────────────

describe('ingestLead — idempotency', () => {
    test('returns existing data without creating anything on duplicate source+externalRef', async () => {
        const existingTp = { id: 55, source: 'meta_ads', external_ref: 'lead_abc123', opportunity_id: 10 };
        Touchpoint.findOne.mockResolvedValueOnce(existingTp);
        Opportunity.findByPk.mockResolvedValueOnce(mockOpp);

        const result = await ingestLead({
            source:      'meta_ads',
            externalRef: 'lead_abc123',
            contact:     { email: 'test@tb.cl' },
        });

        expect(result.duplicate).toBe(true);
        expect(result.touchpoint).toBe(existingTp);
        expect(Contact.findOrCreate).not.toHaveBeenCalled();
        expect(Opportunity.create).not.toHaveBeenCalled();
        expect(Touchpoint.create).not.toHaveBeenCalled();
    });

    test('does NOT perform idempotency check when externalRef is null', async () => {
        Contact.findOrCreate.mockResolvedValueOnce([mockContact, false]);
        Opportunity.findOne.mockResolvedValueOnce(null);
        Opportunity.create.mockResolvedValueOnce(mockOpp);
        Touchpoint.create.mockResolvedValueOnce(mockTp);

        await ingestLead({
            source:  'website_form',
            contact: { email: 'test@tb.cl' },
            // no externalRef
        });

        expect(Touchpoint.findOne).not.toHaveBeenCalled();
    });

    test('accepts all valid SOURCES from constants', async () => {
        const { SOURCES } = require('../../models/constants');

        for (const source of SOURCES) {
            Contact.findOrCreate.mockResolvedValueOnce([{ id: 1, email: 'a@b.cl' }, true]);
            Opportunity.findOne.mockResolvedValueOnce(null);
            Opportunity.create.mockResolvedValueOnce({ id: 1, contact_id: 1, status: 'new' });
            Touchpoint.create.mockResolvedValueOnce({ id: 1 });

            const result = await ingestLead({ source, contact: { email: 'a@b.cl' } });
            expect(result.duplicate).toBe(false);
        }
    });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('ingestLead — validation', () => {
    test('throws immediately on unknown source (no DB calls)', async () => {
        await expect(
            ingestLead({ source: 'invalid_channel', contact: { email: 'a@b.cl' } }),
        ).rejects.toThrow(/Invalid source/);

        expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('error message lists valid sources', async () => {
        let msg = '';
        try {
            await ingestLead({ source: 'bad_source' });
        } catch (e) {
            msg = e.message;
        }
        expect(msg).toContain('website_form');
    });
});

// ── External transaction support ──────────────────────────────────────────────

describe('ingestLead — external transaction', () => {
    test('joins an external transaction instead of creating its own', async () => {
        const externalTx = { LOCK: { UPDATE: 'UPDATE_EXT' } };
        Touchpoint.findOne.mockResolvedValue(null);
        Contact.findOrCreate.mockResolvedValue([mockContact, true]);
        Opportunity.findOne.mockResolvedValue(null);
        Opportunity.create.mockResolvedValue(mockOpp);
        Touchpoint.create.mockResolvedValue(mockTp);

        const result = await ingestLead(
            { source: 'website_form', contact: { email: 'x@tb.cl' } },
            { transaction: externalTx },
        );

        expect(sequelize.transaction).not.toHaveBeenCalled();
        expect(result.duplicate).toBe(false);
        expect(result.contact).toBe(mockContact);
    });
});

// ── Transactional rollback ─────────────────────────────────────────────────────

describe('ingestLead — transaction atomicity', () => {
    test('rejects when Contact resolution fails — Opportunity and Touchpoint not created', async () => {
        Touchpoint.findOne.mockResolvedValueOnce(null);
        Contact.findOrCreate.mockRejectedValueOnce(new Error('DB connection lost'));

        await expect(
            ingestLead({ source: 'website_form', contact: { email: 'x@tb.cl' } }),
        ).rejects.toThrow('DB connection lost');

        expect(Opportunity.create).not.toHaveBeenCalled();
        expect(Touchpoint.create).not.toHaveBeenCalled();
    });

    test('rejects when Opportunity creation fails — Touchpoint not created', async () => {
        Touchpoint.findOne.mockResolvedValueOnce(null);
        Contact.findOrCreate.mockResolvedValueOnce([mockContact, true]);
        Opportunity.findOne.mockResolvedValueOnce(null);
        Opportunity.create.mockRejectedValueOnce(new Error('FK constraint violation'));

        await expect(
            ingestLead({ source: 'booking', contact: { email: 'y@tb.cl' } }),
        ).rejects.toThrow('FK constraint violation');

        expect(Touchpoint.create).not.toHaveBeenCalled();
    });

    test('rejects when Touchpoint creation fails', async () => {
        Touchpoint.findOne.mockResolvedValueOnce(null);
        Contact.findOrCreate.mockResolvedValueOnce([mockContact, false]);
        Opportunity.findOne.mockResolvedValueOnce(mockOpp);
        Touchpoint.create.mockRejectedValueOnce(new Error('Unique constraint (source, external_ref)'));

        await expect(
            ingestLead({
                source:      'meta_ads',
                externalRef: 'dup_ref',
                contact:     { email: 'test@tb.cl' },
            }),
        ).rejects.toThrow('Unique constraint');
    });
});
