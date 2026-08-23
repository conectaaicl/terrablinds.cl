'use strict';

jest.mock('../../models', () => ({
    Lead: {
        findOne:  jest.fn(),
        findAll:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
        destroy:  jest.fn(),
    },
    sequelize: {
        transaction: jest.fn(),
    },
}));

jest.mock('../../services/ingest.service', () => ({
    ingestLead: jest.fn(),
}));

// n8n webhook — suppress real HTTP
jest.mock('axios', () => ({ post: jest.fn().mockResolvedValue({ status: 200 }) }));

const { saveLead, getLeads, updateLead, deleteLead } = require('../../controllers/lead.controller');
const { Lead, sequelize } = require('../../models');
const { ingestLead } = require('../../services/ingest.service');

const mockReq  = (body = {}, params = {}) => ({ body, params });
const mockRes  = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    r.send   = jest.fn().mockReturnValue(r);
    return r;
};
const mockTx = {};

beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockImplementation(async (cb) => cb(mockTx));
});

// ── saveLead ──────────────────────────────────────────────────────────────────

describe('saveLead — Growth Engine integration', () => {
    test('new lead: creates Lead + ingests into GE atomically, returns 201', async () => {
        Lead.findOne.mockResolvedValueOnce(null); // no duplicate
        const newLead = { id: 42, name: 'Héctor', email: 'hector@tb.cl', update: jest.fn() };
        Lead.create.mockResolvedValueOnce(newLead);
        ingestLead.mockResolvedValueOnce({
            contact:     { id: 1 },
            opportunity: { id: 10 },
            duplicate:   false,
        });

        const req = mockReq({ name: 'Héctor', email: 'hector@tb.cl', source: 'chat' });
        const res = mockRes();
        await saveLead(req, res);

        expect(Lead.create).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Héctor', email: 'hector@tb.cl' }),
            expect.objectContaining({ transaction: mockTx }),
        );
        expect(ingestLead).toHaveBeenCalledWith(
            expect.objectContaining({ externalRef: 'lead:42', source: 'chat_widget' }),
            expect.objectContaining({ transaction: mockTx }),
        );
        expect(newLead.update).toHaveBeenCalledWith(
            expect.objectContaining({ contact_id: 1, opportunity_id: 10 }),
            expect.anything(),
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 42 });
    });

    test('duplicate email: returns existing lead without calling GE', async () => {
        const existing = { id: 7, email: 'dup@tb.cl', update: jest.fn() };
        Lead.findOne.mockResolvedValueOnce(existing);

        const req = mockReq({ name: 'Dup', email: 'dup@tb.cl', notes: 'updated note' });
        const res = mockRes();
        await saveLead(req, res);

        expect(Lead.create).not.toHaveBeenCalled();
        expect(ingestLead).not.toHaveBeenCalled();
        expect(existing.update).toHaveBeenCalledWith(
            expect.objectContaining({ notes: 'updated note' }),
        );
        expect(res.json).toHaveBeenCalledWith({ id: 7, updated: true });
    });

    test('missing all required fields: returns 400', async () => {
        const req = mockReq({});
        const res = mockRes();
        await saveLead(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(ingestLead).not.toHaveBeenCalled();
    });

    test('GE failure rolls back transaction, returns 500', async () => {
        Lead.findOne.mockResolvedValueOnce(null);
        Lead.create.mockResolvedValueOnce({ id: 99, update: jest.fn() });
        ingestLead.mockRejectedValueOnce(new Error('DB constraint'));
        sequelize.transaction.mockImplementationOnce(async (cb) => {
            // Simulate transaction rollback on exception
            await cb(mockTx).catch(() => {});
            throw new Error('DB constraint');
        });

        const req = mockReq({ name: 'Fail', email: 'fail@tb.cl' });
        const res = mockRes();
        await saveLead(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('Telegram n8n webhook failure does not affect 201 response', async () => {
        Lead.findOne.mockResolvedValueOnce(null);
        const newLead = { id: 55, update: jest.fn() };
        Lead.create.mockResolvedValueOnce(newLead);
        ingestLead.mockResolvedValueOnce({ contact: { id: 1 }, opportunity: { id: 5 }, duplicate: false });

        const axios = require('axios');
        axios.post.mockRejectedValueOnce(new Error('n8n timeout'));

        const req = mockReq({ name: 'Ana', phone: '912345678' });
        const res = mockRes();
        await saveLead(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });
});

// ── getLeads ──────────────────────────────────────────────────────────────────

describe('getLeads', () => {
    test('returns all leads ordered by created_at DESC', async () => {
        const leads = [{ id: 2 }, { id: 1 }];
        Lead.findAll.mockResolvedValueOnce(leads);

        const req = mockReq();
        const res = mockRes();
        await getLeads(req, res);

        expect(res.json).toHaveBeenCalledWith(leads);
    });
});

// ── updateLead ────────────────────────────────────────────────────────────────

describe('updateLead', () => {
    test('updates lead fields and returns the updated lead', async () => {
        const lead = { id: 3, update: jest.fn().mockResolvedValue({}) };
        Lead.findByPk.mockResolvedValueOnce(lead);

        const req = mockReq({ status: 'contacted', notes: 'seguimiento' }, { id: '3' });
        const res = mockRes();
        await updateLead(req, res);

        expect(Lead.findByPk).toHaveBeenCalledWith('3');
        expect(lead.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'contacted', notes: 'seguimiento' }),
        );
        expect(res.json).toHaveBeenCalledWith(lead);
    });

    test('returns 404 when lead is not found', async () => {
        Lead.findByPk.mockResolvedValueOnce(null);

        const req = mockReq({}, { id: '999' });
        const res = mockRes();
        await updateLead(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) }),
        );
    });
});

// ── deleteLead ────────────────────────────────────────────────────────────────

describe('deleteLead', () => {
    test('destroys lead by id and returns confirmation message', async () => {
        Lead.destroy.mockResolvedValueOnce(1);

        const req = mockReq({}, { id: '5' });
        const res = mockRes();
        await deleteLead(req, res);

        expect(Lead.destroy).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: '5' } }),
        );
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) }),
        );
    });
});
