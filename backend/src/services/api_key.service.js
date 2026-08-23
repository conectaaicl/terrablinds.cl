'use strict';

const crypto = require('crypto');
const { ApiKey } = require('../models');

const KEY_PREFIX = 'tb_';

// ── Crypto primitives ─────────────────────────────────────────────────────────

function generateRawKey() {
    return `${KEY_PREFIX}${crypto.randomBytes(32).toString('hex')}`;
}

function hashKey(rawKey) {
    if (!rawKey || typeof rawKey !== 'string') {
        throw new Error('rawKey must be a non-empty string');
    }
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

// ── Key management ────────────────────────────────────────────────────────────

/**
 * Create a new API key.
 * Returns the raw key ONCE — never stored, never logged.
 * Only the SHA-256 hash is persisted.
 */
async function createApiKey(label, scopes = ['ingest']) {
    if (!label || typeof label !== 'string' || !label.trim()) {
        throw new Error('label is required');
    }
    if (!Array.isArray(scopes) || scopes.length === 0) {
        throw new Error('scopes must be a non-empty array');
    }

    const rawKey  = generateRawKey();
    const keyHash = hashKey(rawKey);

    const apiKey = await ApiKey.create({
        key_hash:  keyHash,
        label:     label.trim(),
        scopes,
        is_active: true,
    });

    // Caller must store rawKey securely — it cannot be recovered from the hash.
    return { apiKey, rawKey };
}

/**
 * Verify a raw API key against the stored hash.
 * Returns the ApiKey record if valid, active, and authorized for requiredScope.
 * Returns null on any failure — never exposes why the key was rejected.
 * Updates last_used_at fire-and-forget (never blocks the response path).
 */
async function verifyApiKey(rawKey, requiredScope = null) {
    if (!rawKey || typeof rawKey !== 'string') return null;

    let keyHash;
    try {
        keyHash = hashKey(rawKey);
    } catch {
        return null;
    }

    const apiKey = await ApiKey.findOne({ where: { key_hash: keyHash } });

    if (!apiKey)           return null;
    if (!apiKey.is_active) return null;
    if (requiredScope && !apiKey.scopes.includes(requiredScope)) return null;

    // Fire-and-forget — do not await; do not throw.
    // Log failures so DB/ORM issues are observable without blocking the auth path.
    apiKey.update({ last_used_at: new Date() }).catch((err) => {
        console.warn(`[ApiKey] last_used_at update failed for id=${apiKey.id}: ${err.message}`);
    });

    return apiKey;
}

/**
 * Soft-revoke an API key by ID (sets is_active = false).
 * The hash record is retained for audit purposes.
 */
async function revokeApiKey(id) {
    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) throw new Error(`ApiKey ${id} not found`);
    await apiKey.update({ is_active: false });
    return apiKey;
}

module.exports = { createApiKey, verifyApiKey, revokeApiKey, hashKey, generateRawKey };
