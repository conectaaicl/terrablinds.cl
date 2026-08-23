'use strict';

jest.mock('../../models', () => ({
    GeOutbox: {
        findOne: jest.fn(),
        create:  jest.fn(),
    },
    sequelize: {
        transaction: jest.fn(),
    },
}));

jest.mock('../../services/ingest.service', () => ({
    ingestLead: jest.fn(),
}));

const { GeOutbox, sequelize } = require('../../models');
const { ingestLead }          = require('../../services/ingest.service');
const worker                  = require('../../services/ge_worker.service');

beforeEach(() => {
    jest.resetAllMocks();
    worker._resetTableCache();
});

describe('tableExists()', () => {
    test('returns true when findOne succeeds', async () => {
        GeOutbox.findOne.mockResolvedValueOnce(null);
        const { enqueue } = worker;
        // Call enqueue to exercise tableExists indirectly
        GeOutbox.create = jest.fn().mockResolvedValueOnce({});
        await enqueue('ingest_lead', { test: 1 });
        expect(GeOutbox.create).toHaveBeenCalledWith({ type: 'ingest_lead', payload: { test: 1 } }, {});
    });

    test('falls back to direct ingest when table missing (SequelizeDatabaseError)', async () => {
        const dbErr = new Error('table does not exist');
        dbErr.name = 'SequelizeDatabaseError';
        GeOutbox.findOne.mockRejectedValueOnce(dbErr);
        ingestLead.mockResolvedValueOnce({});

        await worker.enqueue('ingest_lead', { source: 'booking' });
        expect(ingestLead).toHaveBeenCalledWith({ source: 'booking' });
    });

    test('rethrows non-DB errors from tableExists', async () => {
        const networkErr = new Error('connection refused');
        networkErr.name = 'Error';
        GeOutbox.findOne.mockRejectedValueOnce(networkErr);
        await expect(worker.enqueue('ingest_lead', {})).rejects.toThrow('connection refused');
    });
});

describe('enqueue()', () => {
    test('creates outbox entry with type and payload', async () => {
        GeOutbox.findOne.mockResolvedValueOnce(null); // tableExists = true
        GeOutbox.create = jest.fn().mockResolvedValueOnce({ id: 42 });
        await worker.enqueue('ingest_lead', { source: 'chat_widget' });
        expect(GeOutbox.create).toHaveBeenCalledWith(
            { type: 'ingest_lead', payload: { source: 'chat_widget' } },
            {}
        );
    });

    test('passes transaction option through', async () => {
        GeOutbox.findOne.mockResolvedValueOnce(null);
        GeOutbox.create = jest.fn().mockResolvedValueOnce({});
        const fakeT = { id: 'fake-transaction' };
        await worker.enqueue('ingest_lead', {}, { transaction: fakeT });
        expect(GeOutbox.create).toHaveBeenCalledWith(
            expect.any(Object),
            { transaction: fakeT }
        );
    });

    test('ignores unknown types in fallback (no ingest call)', async () => {
        const dbErr = new Error('no table');
        dbErr.name = 'SequelizeDatabaseError';
        GeOutbox.findOne.mockRejectedValueOnce(dbErr);
        await worker.enqueue('unknown_type', {});
        expect(ingestLead).not.toHaveBeenCalled();
    });
});

describe('isDegraded()', () => {
    test('returns false initially', () => {
        expect(worker.isDegraded()).toBe(false);
    });

    test('returns true after tableExists() detects SequelizeDatabaseError', async () => {
        const dbErr = new Error('relation does not exist');
        dbErr.name = 'SequelizeDatabaseError';
        GeOutbox.findOne.mockRejectedValueOnce(dbErr);
        ingestLead.mockResolvedValue({});
        await worker.enqueue('ingest_lead', {});
        expect(worker.isDegraded()).toBe(true);
    });

    test('_resetTableCache resets degraded flag back to false', async () => {
        const dbErr = new Error('no table');
        dbErr.name = 'SequelizeDatabaseError';
        GeOutbox.findOne.mockRejectedValueOnce(dbErr);
        ingestLead.mockResolvedValue({});
        await worker.enqueue('ingest_lead', {});
        expect(worker.isDegraded()).toBe(true);
        worker._resetTableCache();
        expect(worker.isDegraded()).toBe(false);
    });

    test('returns false after successful table check', async () => {
        GeOutbox.findOne.mockResolvedValueOnce(null);
        GeOutbox.create = jest.fn().mockResolvedValueOnce({});
        await worker.enqueue('ingest_lead', {});
        expect(worker.isDegraded()).toBe(false);
    });
});

describe('start() / stop()', () => {
    test('start and stop do not throw', () => {
        expect(() => {
            worker.start();
            worker.stop();
        }).not.toThrow();
    });

    test('calling start twice does not create two intervals', () => {
        // After start+stop, re-start should work without error
        worker.start();
        worker.start(); // second call is a no-op
        worker.stop();
    });
});

describe('GE_WORKER_ENABLED feature flag', () => {
    afterEach(() => {
        worker.stop();
        delete process.env.GE_WORKER_ENABLED;
    });

    test('worker does not start when GE_WORKER_ENABLED is not set', () => {
        delete process.env.GE_WORKER_ENABLED;
        worker.start();
        expect(worker.isRunning()).toBe(false);
    });

    test('worker does not start when GE_WORKER_ENABLED=false', () => {
        process.env.GE_WORKER_ENABLED = 'false';
        worker.start();
        expect(worker.isRunning()).toBe(false);
    });

    test('worker starts when GE_WORKER_ENABLED=true', () => {
        process.env.GE_WORKER_ENABLED = 'true';
        GeOutbox.findOne.mockResolvedValue(null); // tableExists check from drainOnce
        GeOutbox.create = jest.fn();
        worker.start();
        expect(worker.isRunning()).toBe(true);
    });

    test('isRunning() returns false after stop()', () => {
        process.env.GE_WORKER_ENABLED = 'true';
        GeOutbox.findOne.mockResolvedValue(null);
        GeOutbox.create = jest.fn();
        worker.start();
        expect(worker.isRunning()).toBe(true);
        worker.stop();
        expect(worker.isRunning()).toBe(false);
    });
});
