'use strict';

jest.mock('../../models', () => ({
    ApiKey: {
        findOne:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
    },
}));

const { createApiKey, verifyApiKey, revokeApiKey, hashKey } = require('../../services/api_key.service');
const { ApiKey } = require('../../models');

beforeEach(() => jest.clearAllMocks());

// ── createApiKey ──────────────────────────────────────────────────────────────

describe('createApiKey', () => {
    test('returns a raw key with tb_ prefix and 64-char hex suffix', async () => {
        ApiKey.create.mockResolvedValueOnce({ id: 1, label: 'test', scopes: ['ingest'], is_active: true });

        const { rawKey } = await createApiKey('test');

        expect(rawKey).toMatch(/^tb_[0-9a-f]{64}$/);
    });

    test('stores the SHA-256 hash, not the raw key', async () => {
        ApiKey.create.mockResolvedValueOnce({ id: 2 });

        const { rawKey } = await createApiKey('integration', ['ingest', 'read']);

        const call = ApiKey.create.mock.calls[0][0];
        expect(call.key_hash).toHaveLength(64);                // SHA-256 hex is 64 chars
        expect(call.key_hash).toBe(hashKey(rawKey));           // hash matches
        expect(call.key_hash).not.toBe(rawKey);                // raw key never stored
    });

    test('returns the ApiKey record from the DB', async () => {
        const record = { id: 3, label: 'prod', scopes: ['ingest'], is_active: true };
        ApiKey.create.mockResolvedValueOnce(record);

        const { apiKey } = await createApiKey('prod');

        expect(apiKey).toBe(record);
    });

    test('each call generates a unique raw key', async () => {
        ApiKey.create.mockResolvedValue({ id: 1 });

        const { rawKey: k1 } = await createApiKey('key-a');
        const { rawKey: k2 } = await createApiKey('key-b');

        expect(k1).not.toBe(k2);
    });

    test('throws when label is empty string', async () => {
        await expect(createApiKey('')).rejects.toThrow('label is required');
    });

    test('throws when label is null', async () => {
        await expect(createApiKey(null)).rejects.toThrow('label is required');
    });

    test('throws when scopes is empty array', async () => {
        await expect(createApiKey('valid', [])).rejects.toThrow('scopes');
    });

    test('trims whitespace from label before storing', async () => {
        ApiKey.create.mockResolvedValueOnce({ id: 5 });

        await createApiKey('  n8n-prod  ');

        expect(ApiKey.create).toHaveBeenCalledWith(
            expect.objectContaining({ label: 'n8n-prod' }),
        );
    });

    test('default scopes is ["ingest"]', async () => {
        ApiKey.create.mockResolvedValueOnce({ id: 6 });

        await createApiKey('default-scope-key');

        expect(ApiKey.create).toHaveBeenCalledWith(
            expect.objectContaining({ scopes: ['ingest'] }),
        );
    });
});

// ── verifyApiKey ──────────────────────────────────────────────────────────────

describe('verifyApiKey', () => {
    function makeRecord(overrides = {}) {
        return {
            id:          1,
            scopes:      ['ingest'],
            is_active:   true,
            update:      jest.fn(async () => {}),
            ...overrides,
        };
    }

    test('returns the record for a valid active key', async () => {
        const record = makeRecord();
        ApiKey.findOne.mockResolvedValueOnce(record);

        const result = await verifyApiKey('tb_somevalidkey');

        expect(result).toBe(record);
    });

    test('returns null for an unknown key (not in DB)', async () => {
        ApiKey.findOne.mockResolvedValueOnce(null);

        expect(await verifyApiKey('tb_unknown')).toBeNull();
    });

    test('returns null for an inactive key', async () => {
        ApiKey.findOne.mockResolvedValueOnce(makeRecord({ is_active: false }));

        expect(await verifyApiKey('tb_inactive')).toBeNull();
    });

    test('returns null when required scope is not in key scopes', async () => {
        ApiKey.findOne.mockResolvedValueOnce(makeRecord({ scopes: ['ingest'] }));

        expect(await verifyApiKey('tb_key', 'admin')).toBeNull();
    });

    test('allows access when required scope IS in key scopes', async () => {
        const record = makeRecord({ scopes: ['ingest', 'read'] });
        ApiKey.findOne.mockResolvedValueOnce(record);

        expect(await verifyApiKey('tb_key', 'read')).toBe(record);
    });

    test('allows access when no requiredScope given', async () => {
        const record = makeRecord({ scopes: ['ingest'] });
        ApiKey.findOne.mockResolvedValueOnce(record);

        expect(await verifyApiKey('tb_key')).toBe(record);
    });

    test('returns null for null input', async () => {
        expect(await verifyApiKey(null)).toBeNull();
        expect(ApiKey.findOne).not.toHaveBeenCalled();
    });

    test('returns null for empty string input', async () => {
        expect(await verifyApiKey('')).toBeNull();
    });

    test('calls update on last_used_at after successful verification', async () => {
        const record = makeRecord();
        ApiKey.findOne.mockResolvedValueOnce(record);

        await verifyApiKey('tb_key');

        expect(record.update).toHaveBeenCalledWith(
            expect.objectContaining({ last_used_at: expect.any(Date) }),
        );
    });

    test('logs a warning (does not throw) when last_used_at update fails', async () => {
        const record = makeRecord();
        record.update = jest.fn().mockRejectedValueOnce(new Error('DB timeout'));
        ApiKey.findOne.mockResolvedValueOnce(record);

        const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            // verifyApiKey must still return the record even when update fails
            await expect(verifyApiKey('tb_key')).resolves.toBe(record);
            // Wait a tick for the fire-and-forget rejection to be handled
            await new Promise(resolve => setImmediate(resolve));
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('last_used_at update failed'),
            );
        } finally {
            spy.mockRestore();
        }
    });

    test('verifies using SHA-256 hash match', async () => {
        const rawKey = 'tb_' + 'a'.repeat(64);
        const record = makeRecord();
        ApiKey.findOne.mockResolvedValueOnce(record);

        await verifyApiKey(rawKey);

        expect(ApiKey.findOne).toHaveBeenCalledWith({
            where: { key_hash: hashKey(rawKey) },
        });
    });
});

// ── revokeApiKey ──────────────────────────────────────────────────────────────

describe('revokeApiKey', () => {
    test('sets is_active to false on the found key', async () => {
        const record = { id: 1, is_active: true, update: jest.fn(async () => {}) };
        ApiKey.findByPk.mockResolvedValueOnce(record);

        await revokeApiKey(1);

        expect(record.update).toHaveBeenCalledWith({ is_active: false });
    });

    test('returns the updated record', async () => {
        const record = { id: 1, update: jest.fn(async () => {}) };
        ApiKey.findByPk.mockResolvedValueOnce(record);

        const result = await revokeApiKey(1);

        expect(result).toBe(record);
    });

    test('throws when key not found', async () => {
        ApiKey.findByPk.mockResolvedValueOnce(null);

        await expect(revokeApiKey(999)).rejects.toThrow('not found');
    });
});
