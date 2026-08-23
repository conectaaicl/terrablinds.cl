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

const { createQuote } = require('../../controllers/quote.controller');
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
