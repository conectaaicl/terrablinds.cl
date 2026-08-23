'use strict';

const { sequelize, Touchpoint, Opportunity } = require('../models');
const { SOURCES } = require('../models/constants');
const { upsertContact }           = require('./contact.service');
const { findOrCreateOpportunity } = require('./opportunity.service');

/**
 * Central ingest entry point for all Growth Engine channels.
 *
 * Idempotency:
 *   When externalRef is provided the (source, external_ref) composite partial UNIQUE index
 *   (defined in migrate_growth_engine.sql) prevents duplicate touchpoints at the DB level.
 *   The pre-flight findOne check avoids unnecessary work on replay/re-delivery.
 *   Events without externalRef (e.g. website_form submissions, anonymous chat sessions)
 *   are intentionally NOT idempotent — each interaction creates a fresh touchpoint.
 *
 * Atomicity:
 *   Contact → Opportunity → Touchpoint creation is wrapped in a single Sequelize transaction.
 *   Any failure rolls back the entire unit of work; no partial records are left.
 *   When an external transaction is supplied via options.transaction, ingestLead joins it
 *   so callers can include this call in a larger atomic unit (e.g. Lead creation).
 *
 * Race conditions:
 *   Contact deduplication by email uses findOrCreate backed by the DB UNIQUE index —
 *   two concurrent requests for the same email will produce exactly one Contact.
 *   The (source, external_ref) DB index handles concurrent re-delivery of the same event.
 *
 * @param {object}      params
 * @param {string}      params.source          — must be one of SOURCES from constants.js
 * @param {string|null} params.externalRef      — provider-assigned event ID (idempotency key)
 * @param {object}      params.contact          — { name, email, phone, notes }
 * @param {string|null} params.productInterest  — product category hint
 * @param {object}      params.metadata         — arbitrary JSONB (UTM, tag_id, commune, etc.)
 * @param {Date|string} params.occurredAt       — when the interaction happened
 * @param {string|null} params.channelDetail    — freeform channel label
 * @param {object}      [options]
 * @param {object}      [options.transaction]   — Sequelize transaction to join (optional)
 *
 * @returns {{ contact, contactCreated, opportunity, opportunityCreated, touchpoint, duplicate }}
 */
async function ingestLead(params = {}, options = {}) {
    const {
        source,
        externalRef     = null,
        contact:        contactData = {},
        productInterest = null,
        metadata        = {},
        occurredAt      = new Date(),
        channelDetail   = null,
    } = params;

    const { transaction: externalTx } = options;

    if (!SOURCES.includes(source)) {
        throw new Error(
            `Invalid source: "${source}". Must be one of: ${SOURCES.join(', ')}`,
        );
    }

    const run = async (t) => {

        // ── Idempotency gate (only when externalRef supplied) ─────────────────
        if (externalRef) {
            const existing = await Touchpoint.findOne({
                where: { source, external_ref: externalRef },
                transaction: t,
            });

            if (existing) {
                const opportunity = existing.opportunity_id
                    ? await Opportunity.findByPk(existing.opportunity_id, { transaction: t })
                    : null;

                return {
                    contact:           null,
                    contactCreated:    false,
                    opportunity,
                    opportunityCreated: false,
                    touchpoint:        existing,
                    duplicate:         true,
                };
            }
        }

        // ── 1. Resolve or create Contact ──────────────────────────────────────
        const { contact, created: contactCreated } = await upsertContact(
            contactData,
            { transaction: t },
        );

        // ── 2. Resolve or create Opportunity ─────────────────────────────────
        const { opportunity, created: opportunityCreated } = await findOrCreateOpportunity(
            contact.id,
            { productInterest },
            { transaction: t },
        );

        // ── 3. Record Touchpoint ──────────────────────────────────────────────
        const touchpoint = await Touchpoint.create({
            opportunity_id: opportunity.id,
            source,
            external_ref:   externalRef || null,
            channel_detail: channelDetail || null,
            metadata:       metadata || {},
            occurred_at:    occurredAt instanceof Date ? occurredAt : new Date(occurredAt),
        }, { transaction: t });

        return {
            contact,
            contactCreated,
            opportunity,
            opportunityCreated,
            touchpoint,
            duplicate: false,
        };
    };

    return externalTx ? run(externalTx) : sequelize.transaction(run);
}

module.exports = { ingestLead };
