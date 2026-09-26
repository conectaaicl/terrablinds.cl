'use strict';

jest.mock('../../models', () => ({
    Quote: {
        create:      jest.fn(),
        findByPk:    jest.fn(),
        findAll:     jest.fn(),
        findAndCountAll: jest.fn(),
    },
    Opportunity: {
        findByPk: jest.fn(),
    },
    Config: {
        findOne: jest.fn(),
    },
}));

jest.mock('../../services/email.service', () => ({
    sendQuoteEmail:            jest.fn().mockResolvedValue({}),
    sendAdminQuoteNotification: jest.fn().mockResolvedValue({}),
    sendStatusUpdateEmail:     jest.fn().mockResolvedValue({}),
    resendQuoteEmail:          jest.fn().mockResolvedValue({}),
}));

jest.mock('axios', () => ({ post: jest.fn().mockResolvedValue({ status: 200 }) }));

jest.mock('../../services/ge_worker.service', () => ({
    enqueue: jest.fn().mockResolvedValue(undefined),
}));

const { createQuote, createQuoteRapida } = require('../../controllers/quote.controller');
const { enqueue } = require('../../services/ge_worker.service');
const { Quote, Opportunity } = require('../../models');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};

const validQuoteBody = {
    customer_name:  'Héctor Test',
    customer_email: 'hector@tb.cl',
    items: [{ productName: 'Roller Blackout', quantity: 1, price: 50000, width: 120, height: 200 }],
};

beforeEach(() => jest.clearAllMocks());

// ── createQuote — opportunity_id integration ──────────────────────────────────

describe('createQuote — opportunity_id', () => {
    test('creates quote without opportunity_id when not provided', async () => {
        const newQuote = { id: 1, status: 'pending', customer_email: 'hector@tb.cl' };
        Quote.create.mockResolvedValueOnce(newQuote);

        const req = { body: { ...validQuoteBody } };
        const res = mockRes();
        await createQuote(req, res);

        expect(Quote.create).toHaveBeenCalledWith(
            expect.objectContaining({ opportunity_id: null }),
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('links quote to existing opportunity when valid opportunity_id provided', async () => {
        const opp = { id: 5, status: 'qualified' };
        Opportunity.findByPk.mockResolvedValueOnce(opp);
        const newQuote = { id: 2, opportunity_id: 5 };
        Quote.create.mockResolvedValueOnce(newQuote);

        const req = { body: { ...validQuoteBody, opportunity_id: 5 } };
        const res = mockRes();
        await createQuote(req, res);

        expect(Opportunity.findByPk).toHaveBeenCalledWith(5);
        expect(Quote.create).toHaveBeenCalledWith(
            expect.objectContaining({ opportunity_id: 5 }),
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('returns 400 when opportunity_id references non-existent opportunity', async () => {
        Opportunity.findByPk.mockResolvedValueOnce(null);

        const req = { body: { ...validQuoteBody, opportunity_id: 999 } };
        const res = mockRes();
        await createQuote(req, res);

        expect(Quote.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('999') }),
        );
    });

    test('returns 400 when opportunity_id is not a valid integer', async () => {
        const req = { body: { ...validQuoteBody, opportunity_id: 'abc' } };
        const res = mockRes();
        await createQuote(req, res);

        expect(Opportunity.findByPk).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('multiple quotes can reference the same opportunity (Quote ≠ won sale)', async () => {
        const opp = { id: 3, status: 'qualified' };
        Opportunity.findByPk.mockResolvedValue(opp);
        Quote.create
            .mockResolvedValueOnce({ id: 10, opportunity_id: 3 })
            .mockResolvedValueOnce({ id: 11, opportunity_id: 3 });

        const req1 = { body: { ...validQuoteBody, customer_email: 'a@tb.cl', opportunity_id: 3 } };
        const req2 = { body: { ...validQuoteBody, customer_email: 'b@tb.cl', opportunity_id: 3 } };
        const res1 = mockRes();
        const res2 = mockRes();

        await createQuote(req1, res1);
        await createQuote(req2, res2);

        expect(Quote.create).toHaveBeenCalledTimes(2);
        expect(res1.status).toHaveBeenCalledWith(201);
        expect(res2.status).toHaveBeenCalledWith(201);
    });
});

// ── createQuote — total_amount ────────────────────────────────────────────────

describe('createQuote — total_amount', () => {
    test('sums line totals without multiplying by quantity again', async () => {
        Quote.create.mockResolvedValueOnce({ id: 9 });
        const req = { body: {
            ...validQuoteBody,
            items: [
                // price is the line total sent by the cart (3 × 100.000)
                { productName: 'Motor', quantity: 3, price: 300000 },
                { productName: 'Roller Blackout', quantity: 1, price: 50000, width: 120, height: 200 },
            ],
        } };
        await createQuote(req, mockRes());
        expect(Quote.create).toHaveBeenCalledWith(expect.objectContaining({ total_amount: 350000 }));
    });
});

// ── Growth Engine ingest ──────────────────────────────────────────────────────

describe('createQuote — Growth Engine', () => {
    test('enqueues a website_form lead for a new web quote', async () => {
        Quote.create.mockResolvedValueOnce({ id: 12, customer_name: 'Héctor Test', customer_email: 'hector@tb.cl', customer_phone: null });
        await createQuote({ body: { ...validQuoteBody } }, mockRes());
        expect(enqueue).toHaveBeenCalledWith('ingest_lead', expect.objectContaining({
            source: 'website_form',
            externalRef: 'quote:12',
            contact: expect.objectContaining({ email: 'hector@tb.cl' }),
        }));
    });

    test('does not enqueue when the quote is linked to an existing opportunity', async () => {
        Opportunity.findByPk.mockResolvedValueOnce({ id: 5 });
        Quote.create.mockResolvedValueOnce({ id: 13 });
        await createQuote({ body: { ...validQuoteBody, opportunity_id: 5 } }, mockRes());
        expect(enqueue).not.toHaveBeenCalled();
    });

    test('a GE enqueue failure does not fail the quote', async () => {
        enqueue.mockRejectedValueOnce(new Error('db down'));
        Quote.create.mockResolvedValueOnce({ id: 14, customer_email: 'hector@tb.cl' });
        const res = mockRes();
        await createQuote({ body: { ...validQuoteBody } }, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('createQuoteRapida — Growth Engine', () => {
    const body = { nombre: 'Ana', telefono: '+56 9 1234 5678', producto: 'Roller Blackout', comuna: 'Maipú', ventanas: '3' };

    test('enqueues a website_form lead with product interest (no bare Contact)', async () => {
        const res = mockRes();
        await createQuoteRapida({ body }, res, jest.fn());
        expect(enqueue).toHaveBeenCalledWith('ingest_lead', expect.objectContaining({
            source: 'website_form',
            externalRef: expect.stringMatching(/^cotizador:/),
            productInterest: 'Roller Blackout',
            contact: expect.objectContaining({ name: 'Ana', phone: '+56 9 1234 5678' }),
            metadata: expect.objectContaining({ form: 'cotizador', comuna: 'Maipú' }),
        }));
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    test('still answers success if the GE enqueue fails', async () => {
        enqueue.mockRejectedValueOnce(new Error('db down'));
        const res = mockRes();
        await createQuoteRapida({ body }, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });
});
