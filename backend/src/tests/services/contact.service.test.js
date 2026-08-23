'use strict';

jest.mock('../../models', () => ({
    Contact: {
        findOrCreate: jest.fn(),
        findAll:      jest.fn(),
        create:       jest.fn(),
    },
}));

const { upsertContact, normalizePhone, normalizeEmail } = require('../../services/contact.service');
const { Contact } = require('../../models');

beforeEach(() => jest.clearAllMocks());

// ── normalizePhone ─────────────────────────────────────────────────────────────

describe('normalizePhone', () => {
    test('mobile without country code: 9XXXXXXXX → +569XXXXXXXX', () => {
        expect(normalizePhone('912345678')).toBe('+56912345678');
    });

    test('mobile with country code digits: 56912345678 → +56912345678', () => {
        expect(normalizePhone('56912345678')).toBe('+56912345678');
    });

    test('mobile with +56 prefix and spaces', () => {
        expect(normalizePhone('+56 9 1234 5678')).toBe('+56912345678');
    });

    test('mobile with formatting chars', () => {
        expect(normalizePhone('(9) 1234-5678')).toBe('+56912345678');
    });

    test('landline 8 digits: 22123456 → +5622123456', () => {
        expect(normalizePhone('22123456')).toBe('+5622123456');
    });

    test('landline with country code: 5622123456 → +5622123456', () => {
        expect(normalizePhone('5622123456')).toBe('+5622123456');
    });

    test('null returns null', () => {
        expect(normalizePhone(null)).toBeNull();
    });

    test('empty string returns null', () => {
        expect(normalizePhone('')).toBeNull();
    });

    test('short number returns null (ambiguous)', () => {
        expect(normalizePhone('12345')).toBeNull();
    });

    test('non-string returns null', () => {
        expect(normalizePhone(912345678)).toBeNull();
    });
});

// ── normalizeEmail ─────────────────────────────────────────────────────────────

describe('normalizeEmail', () => {
    test('trims whitespace and lowercases', () => {
        expect(normalizeEmail('  HECTOR@TERRABLINDS.CL  ')).toBe('hector@terrablinds.cl');
    });

    test('null returns null', () => {
        expect(normalizeEmail(null)).toBeNull();
    });

    test('empty string returns null', () => {
        expect(normalizeEmail('')).toBeNull();
    });

    test('whitespace-only returns null', () => {
        expect(normalizeEmail('   ')).toBeNull();
    });
});

// ── upsertContact — email (strong identifier) ─────────────────────────────────

describe('upsertContact — email path', () => {
    test('creates new contact when email not found', async () => {
        const newContact = { id: 1, name: 'Héctor', email: 'hector@tb.cl', phone: null, phone_normalized: null, notes: null };
        Contact.findOrCreate.mockResolvedValueOnce([newContact, true]);

        const result = await upsertContact({ name: 'Héctor', email: 'HECTOR@TB.CL' });

        expect(Contact.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'hector@tb.cl' },
        }));
        expect(result.created).toBe(true);
        expect(result.contact).toBe(newContact);
    });

    test('reuses existing contact found by email', async () => {
        const existing = {
            id: 1, name: 'Héctor', email: 'hector@tb.cl',
            phone: null, phone_normalized: null, notes: null,
            update: jest.fn(async () => existing),
        };
        Contact.findOrCreate.mockResolvedValueOnce([existing, false]);

        const result = await upsertContact({ name: 'Héctor', email: 'hector@tb.cl', phone: '912345678' });

        expect(result.created).toBe(false);
        expect(result.contact).toBe(existing);
        // Should fill phone since it was null on existing contact
        expect(existing.update).toHaveBeenCalledWith(
            expect.objectContaining({ phone: '912345678', phone_normalized: '+56912345678' }),
            expect.anything(),
        );
    });

    test('does NOT overwrite existing name or notes with incoming values', async () => {
        const existing = {
            id: 1, name: 'Original', email: 'a@tb.cl',
            phone: '912345678', phone_normalized: '+56912345678', notes: 'old note',
            update: jest.fn(async () => existing),
        };
        Contact.findOrCreate.mockResolvedValueOnce([existing, false]);

        await upsertContact({ name: 'New Name', email: 'a@tb.cl', notes: 'new note' });

        // All fields already set → update should not be called
        expect(existing.update).not.toHaveBeenCalled();
    });

    test('normalizes email to lowercase before lookup', async () => {
        const newContact = { id: 2, email: 'user@example.com', name: null, phone: null, phone_normalized: null, notes: null };
        Contact.findOrCreate.mockResolvedValueOnce([newContact, true]);

        await upsertContact({ email: 'USER@EXAMPLE.COM' });

        expect(Contact.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'user@example.com' },
        }));
    });

    test('sets defaults correctly when creating new contact', async () => {
        const newContact = { id: 3 };
        Contact.findOrCreate.mockResolvedValueOnce([newContact, true]);

        await upsertContact({ name: 'Pedro', email: 'pedro@tb.cl', phone: '912345678' });

        const call = Contact.findOrCreate.mock.calls[0][0];
        expect(call.defaults).toMatchObject({
            name:             'Pedro',
            email:            'pedro@tb.cl',
            phone:            '912345678',
            phone_normalized: '+56912345678',
        });
    });
});

// ── upsertContact — phone only (weak identifier) ──────────────────────────────
// Phone is NOT a strong identifier: shared phones are common in Chile
// (family, empresa, reception, pareja). Auto-merge is never performed on phone alone.

describe('upsertContact — phone-only path', () => {
    test('creates new contact even when a single candidate with no email exists (no auto-merge)', async () => {
        Contact.create.mockResolvedValueOnce({ id: 10, name: 'María', phone_normalized: '+56912345678' });

        const result = await upsertContact({ name: 'María', phone: '912345678' });

        expect(result.created).toBe(true);
        expect(Contact.create).toHaveBeenCalledWith(
            expect.objectContaining({ phone_normalized: '+56912345678', email: null }),
            expect.anything(),
        );
        expect(Contact.findAll).not.toHaveBeenCalled();
    });

    test('two people sharing the same phone number get independent Contact records', async () => {
        Contact.create
            .mockResolvedValueOnce({ id: 20, name: 'María', phone_normalized: '+56912345678' })
            .mockResolvedValueOnce({ id: 21, name: 'Juan',  phone_normalized: '+56912345678' });

        const r1 = await upsertContact({ name: 'María', phone: '912345678' });
        const r2 = await upsertContact({ name: 'Juan',  phone: '912345678' });

        expect(r1.created).toBe(true);
        expect(r2.created).toBe(true);
        expect(r1.contact.id).not.toBe(r2.contact.id);
        expect(Contact.create).toHaveBeenCalledTimes(2);
        expect(Contact.findAll).not.toHaveBeenCalled();
    });

    test('does not query Contact.findAll in the phone-only path', async () => {
        Contact.create.mockResolvedValueOnce({ id: 30, phone_normalized: '+56912345678' });

        await upsertContact({ phone: '912345678' });

        expect(Contact.findAll).not.toHaveBeenCalled();
    });

    test('phone is normalized and stored when creating new contact', async () => {
        Contact.create.mockResolvedValueOnce({ id: 31 });

        await upsertContact({ name: 'Ana', phone: '+56 9 8765 4321' });

        expect(Contact.create).toHaveBeenCalledWith(
            expect.objectContaining({ phone_normalized: '+56987654321', name: 'Ana' }),
            expect.anything(),
        );
    });
});

// ── upsertContact — no identifiers (fallback) ─────────────────────────────────

describe('upsertContact — no identifiers', () => {
    test('always creates a new contact', async () => {
        Contact.create.mockResolvedValueOnce({ id: 99, name: 'Anónimo', email: null });

        const result = await upsertContact({ name: 'Anónimo' });

        expect(result.created).toBe(true);
        expect(Contact.findOrCreate).not.toHaveBeenCalled();
        expect(Contact.findAll).not.toHaveBeenCalled();
    });

    test('creates contact with only name when nothing else provided', async () => {
        Contact.create.mockResolvedValueOnce({ id: 100 });

        await upsertContact({ name: 'Sin Datos' });

        expect(Contact.create).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Sin Datos', email: null, phone: null }),
            expect.anything(),
        );
    });
});
