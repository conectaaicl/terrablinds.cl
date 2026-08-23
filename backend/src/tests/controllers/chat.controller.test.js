'use strict';

// Minimal https mock: Groq call succeeds; Telegram fire-and-forget is ignored.
jest.mock('https', () => {
    const { EventEmitter } = require('events');
    return {
        request: jest.fn((opts, cb) => {
            const req = new EventEmitter();
            req.write     = jest.fn();
            req.setTimeout = jest.fn();
            req.destroy   = jest.fn();
            req.end = jest.fn(() => {
                if (typeof cb !== 'function') return; // Telegram: no response needed
                const res = new EventEmitter();
                setImmediate(() => {
                    cb(res);
                    setImmediate(() => {
                        res.emit('data', JSON.stringify({
                            choices: [{ message: { content: 'AI reply' } }],
                        }));
                        res.emit('end');
                    });
                });
            });
            return req;
        }),
    };
});

jest.mock('../../models', () => ({
    Config: {
        findAll: jest.fn(),
    },
}));

jest.mock('../../services/ingest.service', () => ({
    ingestLead: jest.fn(),
}));

const { chat } = require('../../controllers/chat.controller');
const { Config } = require('../../models');
const { ingestLead } = require('../../services/ingest.service');

const mockRes = () => {
    const r = {};
    r.status = jest.fn().mockReturnValue(r);
    r.json   = jest.fn().mockReturnValue(r);
    return r;
};

// Config returns groq key so Groq call proceeds
const validGroqConfig = [{ key: 'groq_api_key', value: 'gsk_test_key_123456789' }];

beforeEach(() => {
    jest.clearAllMocks();
    Config.findAll.mockResolvedValue(validGroqConfig);
    ingestLead.mockResolvedValue({ duplicate: false, contact: { id: 1 }, opportunity: { id: 10 } });
});

// ── Growth Engine integration ─────────────────────────────────────────────────

describe('chat — Growth Engine integration', () => {
    test('calls ingestLead with correct params when sessionId + email provided', async () => {
        const req = {
            body: {
                messages:  [{ role: 'user', content: 'Hola' }],
                sessionId: 'sess-abc-123',
                contact:   { name: 'María', email: 'maria@tb.cl' },
            },
        };
        const res = mockRes();
        await chat(req, res);

        expect(ingestLead).toHaveBeenCalledWith(
            expect.objectContaining({
                source:      'chat_widget',
                externalRef: 'chat:sess-abc-123',
                contact:     expect.objectContaining({ email: 'maria@tb.cl' }),
                metadata:    expect.objectContaining({ trigger: 'chat_contact_capture' }),
            }),
        );
        expect(res.json).toHaveBeenCalledWith({ reply: 'AI reply' });
    });

    test('calls ingestLead when sessionId + phone provided (no email)', async () => {
        const req = {
            body: {
                messages:  [{ role: 'user', content: 'Hola' }],
                sessionId: 'sess-phone-456',
                contact:   { name: 'Juan', phone: '912345678' },
            },
        };
        const res = mockRes();
        await chat(req, res);

        expect(ingestLead).toHaveBeenCalledWith(
            expect.objectContaining({ externalRef: 'chat:sess-phone-456' }),
        );
    });

    test('does NOT call ingestLead when sessionId is missing', async () => {
        const req = {
            body: {
                messages: [{ role: 'user', content: 'Hola' }],
                contact:  { email: 'test@tb.cl' },
                // no sessionId
            },
        };
        const res = mockRes();
        await chat(req, res);

        expect(ingestLead).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ reply: 'AI reply' });
    });

    test('does NOT call ingestLead when contact has no email or phone', async () => {
        const req = {
            body: {
                messages:  [{ role: 'user', content: 'Hola' }],
                sessionId: 'sess-xyz',
                contact:   { name: 'Anónimo' }, // name only, no email/phone
            },
        };
        const res = mockRes();
        await chat(req, res);

        expect(ingestLead).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ reply: 'AI reply' });
    });
});
