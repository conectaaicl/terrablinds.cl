'use strict';

jest.mock('../../models', () => ({
    Config:  { findOne: jest.fn().mockResolvedValue(null) },
    Contact: { create: jest.fn() },
}));
jest.mock('../../services/email.service', () => ({
    sendContactEmail: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../services/ge_worker.service', () => ({
    enqueue: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('axios', () => ({ post: jest.fn().mockResolvedValue({ status: 200 }) }));

const { submitContact } = require('../../controllers/contact.controller');
const { Contact } = require('../../models');
const { enqueue } = require('../../services/ge_worker.service');
const { sendContactEmail } = require('../../services/email.service');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};

const body = { name: 'Pedro', email: 'Pedro@Mail.cl', phone: '+56 9 8765 4321', subject: 'Toldo', message: 'Quiero cotizar un toldo retráctil' };

beforeEach(() => jest.clearAllMocks());

describe('submitContact', () => {
    test('sends the lead to the Growth Engine instead of inserting a Contact directly', async () => {
        const res = mockRes();
        await submitContact({ body }, res);
        expect(Contact.create).not.toHaveBeenCalled();
        expect(enqueue).toHaveBeenCalledWith('ingest_lead', expect.objectContaining({
            source: 'website_form',
            externalRef: expect.stringMatching(/^contacto:/),
            contact: expect.objectContaining({ email: 'pedro@mail.cl', name: 'Pedro' }),
        }));
        expect(res.json).toHaveBeenCalledWith({ message: 'Mensaje enviado correctamente.' });
    });

    test('a returning customer (GE failure) still gets 200 and the email notification', async () => {
        enqueue.mockRejectedValueOnce(new Error('duplicate key value violates unique constraint'));
        const res = mockRes();
        await submitContact({ body }, res);
        expect(res.status).not.toHaveBeenCalledWith(500);
        expect(sendContactEmail).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Mensaje enviado correctamente.' });
    });

    test('rejects an invalid email', async () => {
        const res = mockRes();
        await submitContact({ body: { ...body, email: 'no-es-email' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(enqueue).not.toHaveBeenCalled();
    });
});
