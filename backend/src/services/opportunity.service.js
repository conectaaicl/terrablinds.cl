'use strict';

const { Op } = require('sequelize');
const { Opportunity, OpportunityEvent, sequelize } = require('../models');
const { TERMINAL_STATUSES, OPPORTUNITY_STATUSES } = require('../models/constants');

// ── State machine ─────────────────────────────────────────────────────────────
// Terminal statuses have no valid outbound transitions — they are permanently closed.
// quoted ↔ contacted/qualified models renegotiation before a close decision.
const VALID_TRANSITIONS = Object.freeze({
    new:             ['contacted', 'qualified', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
    contacted:       ['qualified', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
    qualified:       ['contacted', 'quoted', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
    quoted:          ['contacted', 'qualified', 'won', 'lost', 'spam', 'duplicate', 'out_of_coverage'],
    won:             [],
    lost:            [],
    spam:            [],
    duplicate:       [],
    out_of_coverage: [],
});

// ── Opportunity resolution ────────────────────────────────────────────────────
/**
 * Find the most recent open Opportunity for a contact, or create a fresh one.
 * A new inbound on a terminal opportunity starts a new commercial cycle.
 */
async function findOrCreateOpportunity(contactId, { productInterest = null } = {}, { transaction } = {}) {
    const existing = await Opportunity.findOne({
        where: {
            contact_id: contactId,
            status:     { [Op.notIn]: TERMINAL_STATUSES },
        },
        order: [['created_at', 'DESC']],
        transaction,
    });

    if (existing) return { opportunity: existing, created: false };

    const opportunity = await Opportunity.create({
        contact_id:       contactId,
        product_interest: productInterest || null,
        status:           'new',
    }, { transaction });

    return { opportunity, created: true };
}

// ── Opportunity state transition ──────────────────────────────────────────────
/**
 * Transition an Opportunity to a new status and record an immutable OpportunityEvent.
 *
 * Uses SELECT FOR UPDATE when an external transaction is supplied, preventing
 * concurrent status changes on the same row.
 *
 * won_amount must be supplied explicitly; it is never derived from Quote.total_amount.
 *
 * @param {number}      opportunityId
 * @param {string}      newStatus
 * @param {string|null} actor         — email or system identifier triggering the change
 * @param {string|null} note
 * @param {object}      options
 * @param {number|null} options.wonAmount   — set when transitioning to 'won'
 * @param {object|null} options.transaction — join an existing transaction
 */
async function transitionOpportunity(opportunityId, newStatus, actor = null, note = null, options = {}) {
    const { wonAmount, transaction: externalTx } = options;

    if (!OPPORTUNITY_STATUSES.includes(newStatus)) {
        throw new Error(`Unknown status: "${newStatus}"`);
    }

    const exec = async (t) => {
        const opportunity = await Opportunity.findByPk(opportunityId, {
            lock:        t.LOCK ? t.LOCK.UPDATE : undefined,
            transaction: t,
        });

        if (!opportunity) throw new Error(`Opportunity ${opportunityId} not found`);

        const fromStatus = opportunity.status;
        const allowed    = VALID_TRANSITIONS[fromStatus] ?? [];

        if (!allowed.includes(newStatus)) {
            throw new Error(
                `Invalid transition: "${fromStatus}" → "${newStatus}". ` +
                `Allowed from "${fromStatus}": [${allowed.join(', ') || 'none — terminal status'}]`,
            );
        }

        const updates = { status: newStatus };
        if (newStatus === 'won') {
            updates.won_at = new Date();
            if (wonAmount !== undefined && wonAmount !== null) {
                updates.won_amount = wonAmount;
            }
        }

        await opportunity.update(updates, { transaction: t });

        await OpportunityEvent.create({
            opportunity_id: opportunityId,
            from_status:    fromStatus,
            to_status:      newStatus,
            actor:          actor || null,
            note:           note  || null,
        }, { transaction: t });

        return opportunity;
    };

    return externalTx ? exec(externalTx) : sequelize.transaction(exec);
}

module.exports = { findOrCreateOpportunity, transitionOpportunity, VALID_TRANSITIONS };
