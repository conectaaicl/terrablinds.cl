'use strict';

const { Contact } = require('../models');

// ── Phone normalization ───────────────────────────────────────────────────────
// Produces E.164 format for Chilean numbers only.
// Returns null for unrecognized formats rather than guessing.
function normalizePhone(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const digits = raw.replace(/\D/g, '');

    // With Chilean country code (56)
    if (digits.startsWith('569') && digits.length === 11) return `+${digits}`;   // mobile: 569XXXXXXXX
    if (digits.startsWith('56')  && digits.length === 10) return `+${digits}`;   // landline: 56XXXXXXXX (8-digit local)

    // Without country code
    if (digits.startsWith('9') && digits.length === 9) return `+56${digits}`;    // mobile: 9XXXXXXXX
    if (digits.length === 8)                            return `+56${digits}`;    // landline: 8 digits

    return null; // ambiguous — never guess
}

function normalizeEmail(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
}

// Never overwrite existing non-null fields with empty/null incoming values.
function buildUpdateFields(existing, { name, normalizedEmail, phone, normalizedPhone, notes }) {
    const u = {};
    if (name           && !existing.name)             u.name             = name;
    if (normalizedEmail && !existing.email)            u.email            = normalizedEmail;
    if (phone           && !existing.phone)            u.phone            = phone;
    if (normalizedPhone && !existing.phone_normalized) u.phone_normalized = normalizedPhone;
    if (notes           && !existing.notes)            u.notes            = notes;
    return u;
}

// ── Core contact resolution ───────────────────────────────────────────────────
/**
 * Find or create a Contact.
 *
 * Resolution order:
 *   1. Email (strong identifier) — DB partial UNIQUE index; race-safe via findOrCreate.
 *   2. Phone only — phone is NOT a strong identifier (shared phones: family, business,
 *      reception). Always creates a new Contact; phone_normalized is stored for
 *      future admin-assisted dedup (Phase 5) but never triggers automatic fusion.
 *   3. Neither — always creates a new Contact.
 *
 * Merge rule: incoming data fills *empty* fields only; existing values are never overwritten.
 */
async function upsertContact({ name, email, phone, notes } = {}, { transaction } = {}) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    // ── Strong path: email ────────────────────────────────────────────────────
    if (normalizedEmail) {
        const [contact, created] = await Contact.findOrCreate({
            where: { email: normalizedEmail },
            defaults: {
                name:             name || null,
                email:            normalizedEmail,
                phone:            phone || null,
                phone_normalized: normalizedPhone || null,
                notes:            notes || null,
            },
            transaction,
        });

        if (!created) {
            const updates = buildUpdateFields(contact, { name, normalizedEmail, phone, normalizedPhone, notes });
            if (Object.keys(updates).length > 0) {
                await contact.update(updates, { transaction });
            }
        }

        return { contact, created };
    }

    // ── Weak path: phone only ─────────────────────────────────────────────────
    // A Chilean phone can be shared (family, empresa, reception, pareja). Even an
    // unambiguous single match is insufficient evidence for automatic identity fusion.
    // We always create a new Contact here; phone_normalized is indexed so admin
    // tools (Phase 5) can surface candidates for manual review later.
    if (normalizedPhone) {
        const contact = await Contact.create({
            name:             name || null,
            email:            null,
            phone:            phone || null,
            phone_normalized: normalizedPhone || null,
            notes:            notes || null,
        }, { transaction });
        return { contact, created: true };
    }

    // ── Fallback: always create ───────────────────────────────────────────────
    const contact = await Contact.create({
        name:             name || null,
        email:            null,
        phone:            phone || null,
        phone_normalized: normalizedPhone || null,
        notes:            notes || null,
    }, { transaction });

    return { contact, created: true };
}

module.exports = { upsertContact, normalizePhone, normalizeEmail };
