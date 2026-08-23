'use strict';

jest.mock('../../models', () => ({
    sequelize: { transaction: jest.fn() },
    Booking:    { findOne: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    BlockedDay: { findOne: jest.fn() },
    Config:     { findOne: jest.fn() },
}));

// booking.controller.js now uses enqueue() instead of ingestLead() directly
jest.mock('../../services/ge_worker.service', () => ({
    enqueue: jest.fn(),
}));

jest.mock('../../services/ingest.service', () => ({
    ingestLead: jest.fn(),
}));

jest.mock('../../services/email.service', () => ({
    sendBookingConfirmation: jest.fn().mockResolvedValue({}),
}));

jest.mock('axios', () => ({ post: jest.fn() }));

jest.mock('https', () => {
    const { EventEmitter } = require('events');
    return {
        request: jest.fn(() => {
            const req = new EventEmitter();
            req.write      = jest.fn();
            req.end        = jest.fn();
            req.setTimeout = jest.fn();
            return req;
        }),
    };
});

const { createBooking, confirmPayment } = require('../../controllers/booking.controller');
const { sequelize, Booking, BlockedDay, Config } = require('../../models');
const { enqueue }      = require('../../services/ge_worker.service');
const emailService     = require('../../services/email.service');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    r.send   = jest.fn().mockReturnValue(r);
    return r;
};
const mockNext = jest.fn();
const mockTx   = {};

const freeBookingBody = {
    service_type:   'instalacion',
    date:           '2026-09-01',
    time_slot:      '10:00',
    client_name:    'Héctor',
    client_email:   'hector@tb.cl',
    client_phone:   '912345678',
};

beforeEach(() => {
    jest.resetAllMocks();
    sequelize.transaction.mockImplementation(async (cb) => cb(mockTx));
    BlockedDay.findOne.mockResolvedValue(null);
    Booking.findOne.mockResolvedValue(null);
    emailService.sendBookingConfirmation.mockResolvedValue({});
    enqueue.mockResolvedValue(undefined);
});

// ── createBooking — free service ──────────────────────────────────────────────

describe('createBooking — free service Growth Engine integration', () => {
    test('atomic: creates Booking + calls enqueue with booking externalRef', async () => {
        const newBooking = { id: 5, service_type: 'instalacion', status: 'confirmed' };
        Booking.create.mockResolvedValueOnce(newBooking);

        const req = { body: { ...freeBookingBody } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        expect(Booking.create).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'confirmed', amount: 0 }),
            expect.objectContaining({ transaction: mockTx }),
        );
        expect(enqueue).toHaveBeenCalledWith(
            'ingest_lead',
            expect.objectContaining({
                source:      'booking',
                externalRef: 'booking:5',
                contact:     expect.objectContaining({ email: 'hector@tb.cl' }),
            }),
            expect.objectContaining({ transaction: mockTx }),
        );
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ bookingId: 5 }),
        );
    });

    test('confirmation email is sent after GE enqueue (outside transaction)', async () => {
        const newBooking = { id: 6, status: 'confirmed' };
        Booking.create.mockResolvedValueOnce(newBooking);

        const req = { body: { ...freeBookingBody } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        expect(emailService.sendBookingConfirmation).toHaveBeenCalledWith(newBooking);
    });

    test('GE failure propagates to next() — no partial state (transaction rolled back)', async () => {
        sequelize.transaction.mockRejectedValueOnce(new Error('GE DB error'));

        const req = { body: { ...freeBookingBody } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'GE DB error' }),
        );
        expect(res.json).not.toHaveBeenCalled();
    });
});

// ── createBooking — paid service ──────────────────────────────────────────────

describe('createBooking — paid service', () => {
    function setupPaidMocks(axiosMockData) {
        Config.findOne
            .mockResolvedValueOnce({ value: 'test_key' })
            .mockResolvedValueOnce({ value: 'test_secret' })
            .mockResolvedValueOnce({ value: 'https://flow.test' });
        const axios = require('axios');
        axiosMockData
            ? axios.post.mockResolvedValueOnce({ data: axiosMockData })
            : axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    }

    test('does NOT call enqueue at booking creation (GE deferred to payment confirmation)', async () => {
        const paidBooking = { id: 10, status: 'pending_payment', update: jest.fn().mockResolvedValue({}) };
        Booking.create.mockResolvedValueOnce(paidBooking);
        setupPaidMocks({ url: 'https://flow.test/pay', token: 'tok123' });

        const req = { body: { ...freeBookingBody, service_type: 'visita_medidas' } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        expect(enqueue).not.toHaveBeenCalled();
    });

    test('stores Flow token on booking and returns redirect URL', async () => {
        const paidBooking = { id: 10, status: 'pending_payment', update: jest.fn().mockResolvedValue({}) };
        Booking.create.mockResolvedValueOnce(paidBooking);
        setupPaidMocks({ url: 'https://flow.test/pay', token: 'tok123' });

        const req = { body: { ...freeBookingBody, service_type: 'visita_medidas' } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(paidBooking.update).toHaveBeenCalledWith(
            expect.objectContaining({ flow_token: 'tok123' }),
        );
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                bookingId:   10,
                redirectUrl: expect.stringContaining('tok123'),
            }),
        );
    });

    test('sets payment_failed status and returns 502 when Flow API is unreachable', async () => {
        const paidBooking = { id: 11, status: 'pending_payment', update: jest.fn().mockResolvedValue({}) };
        Booking.create.mockResolvedValueOnce(paidBooking);
        setupPaidMocks(null); // triggers mockRejectedValueOnce('ECONNREFUSED')

        const req = { body: { ...freeBookingBody, service_type: 'visita_medidas' } };
        const res = mockRes();
        await createBooking(req, res, mockNext);

        // PRE-CHECK 2: booking must be marked payment_failed (not cancelled) for technical errors
        expect(paidBooking.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'payment_failed' }),
        );
        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) }),
        );
        expect(mockNext).not.toHaveBeenCalled();
    });
});

// ── confirmPayment ────────────────────────────────────────────────────────────

describe('confirmPayment — Growth Engine integration', () => {
    afterEach(async () => {
        await new Promise(resolve => setImmediate(resolve));
        await new Promise(resolve => setImmediate(resolve));
    });

    function setupConfirmPaymentMocks(commerceOrder, flowStatus) {
        Config.findOne
            .mockResolvedValueOnce({ value: 'test_key' })
            .mockResolvedValueOnce({ value: 'test_secret' })
            .mockResolvedValueOnce({ value: 'https://flow.test' });
        const axios = require('axios');
        axios.post.mockResolvedValueOnce({ data: { status: flowStatus, commerceOrder } });
    }

    test('calls enqueue fire-and-forget after booking status is confirmed', async () => {
        setupConfirmPaymentMocks('TB-B20-1234567890', 2);

        const booking = {
            id: 20, status: 'pending_payment',
            client_name:  'Ana', client_email: 'ana@tb.cl', client_phone: null,
            service_type: 'visita_medidas', date: '2026-09-05', time_slot: '09:00', amount: 15000,
            paid_at:      null,
            update: jest.fn(async function(updates) { Object.assign(this, updates); return this; }),
        };
        Booking.findByPk.mockResolvedValueOnce(booking);

        const req = { body: { token: 'flow_tok_20' } };
        const res = mockRes();
        await confirmPayment(req, res);

        expect(res.send).toHaveBeenCalledWith('OK');
        expect(emailService.sendBookingConfirmation).toHaveBeenCalledWith(booking);
        expect(enqueue).toHaveBeenCalledWith(
            'ingest_lead',
            expect.objectContaining({ source: 'booking', externalRef: 'booking:20' }),
        );
    });

    test('always returns OK even when enqueue rejects (webhook must be idempotent)', async () => {
        setupConfirmPaymentMocks('TB-B21-9999999999', 2);

        const booking = {
            id: 21, status: 'pending_payment',
            client_name: 'X', client_email: 'x@tb.cl', client_phone: null,
            service_type: 'visita_medidas', date: '2026-09-10', time_slot: '11:00', amount: 15000,
            paid_at: null,
            update: jest.fn(async function(updates) { Object.assign(this, updates); return this; }),
        };
        Booking.findByPk.mockResolvedValueOnce(booking);
        enqueue.mockRejectedValueOnce(new Error('GE transient failure'));

        const req = { body: { token: 'flow_tok_21' } };
        const res = mockRes();
        await confirmPayment(req, res);

        expect(res.send).toHaveBeenCalledWith('OK');
    });

    test('does NOT call enqueue when Flow status is not 2 (payment not confirmed)', async () => {
        setupConfirmPaymentMocks('TB-B22-1111111111', 1);

        const booking = {
            id: 22, status: 'pending_payment',
            update: jest.fn(),
        };
        Booking.findByPk.mockResolvedValueOnce(booking);

        const req = { body: { token: 'flow_tok_22' } };
        const res = mockRes();
        await confirmPayment(req, res);

        expect(enqueue).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith('OK');
    });
});
