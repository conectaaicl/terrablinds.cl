'use strict';

const { Op } = require('sequelize');
const { GeOutbox, sequelize } = require('../models');
const { ingestLead } = require('./ingest.service');

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 30_000; // 30 s

let _timer = null;
let _tableExists = null; // cached after first check
let _degraded = false;   // true when outbox table is unavailable

async function tableExists() {
    if (_tableExists !== null) return _tableExists;
    try {
        await GeOutbox.findOne({ limit: 1 });
        _tableExists = true;
        _degraded = false;
    } catch (err) {
        if (err.name === 'SequelizeDatabaseError') {
            _tableExists = false;
            _degraded = true;
            // Log at error level — this means retry/persistence guarantees are GONE
            console.error('[GE Outbox] *** DEGRADED MODE *** ge_outbox table not found. ' +
                'Retry guarantees unavailable until migration runs. Run: ' +
                'sequelize db:migrate --to 20260822_add_ge_outbox_table.js');
        } else {
            throw err;
        }
    }
    return _tableExists;
}

/** True when the outbox table is unavailable and we are running in degraded mode (no retries). */
function isDegraded() { return _degraded; }

/**
 * Enqueue a GE ingest event into the outbox within an optional transaction.
 *
 * DEGRADED MODE: If the ge_outbox table doesn't exist (migration not run), falls back to
 * a direct ingestLead() call. This means NO retry, NO persistence, NO idempotency guarantee.
 * Idempotency at the contact level is preserved via externalRef in the payload.
 * The health endpoint reflects this state via isDegraded() → ge_severity: 'critical'.
 * This fallback exists only for backward compatibility with environments where the migration
 * has not run yet. In production, ge_outbox MUST exist before enabling the worker.
 */
async function enqueue(type, payload, { transaction } = {}) {
    if (!(await tableExists())) {
        // DEGRADED FALLBACK — log at ERROR level so operators cannot miss this
        console.error(`[GE Outbox] *** DEGRADED FALLBACK *** direct call (no retry/persistence/idempotency) ` +
            `for type=${type}. Run migration 20260822_add_ge_outbox_table.js to restore guarantees.`);
        if (type === 'ingest_lead') {
            return ingestLead(payload).catch(err =>
                console.error(`[GE Outbox] DEGRADED direct ingest failed: ${err.message}`)
            );
        }
        return;
    }
    await GeOutbox.create({ type, payload }, { transaction });
}

/**
 * Process one pending outbox item. Returns true if an item was processed.
 */
async function processNext() {
    return sequelize.transaction(async (t) => {
        const item = await GeOutbox.findOne({
            where: {
                processed_at: null,
                attempts:     { [Op.lt]: MAX_ATTEMPTS },
                [Op.or]: [
                    { locked_until: null },
                    { locked_until: { [Op.lt]: new Date() } },
                ],
            },
            order: [['created_at', 'ASC']],
            lock:  t.LOCK.UPDATE,
            transaction: t,
        });

        if (!item) return false;

        const lockUntil = new Date(Date.now() + 60_000); // lock for 60 s
        await item.update({ locked_until: lockUntil, attempts: item.attempts + 1 }, { transaction: t });
        return { item };
    }).then(async (result) => {
        if (!result) return false;
        const { item } = result;

        try {
            if (item.type === 'ingest_lead') {
                await ingestLead(item.payload);
            } else {
                throw new Error(`Unknown outbox type: ${item.type}`);
            }
            await item.update({ processed_at: new Date(), last_error: null });
            return true;
        } catch (err) {
            await item.update({ last_error: err.message.substring(0, 500), locked_until: null });
            console.error(`[GE Outbox] item=${item.id} attempt=${item.attempts} error: ${err.message}`);
            return false;
        }
    });
}

/**
 * Drain all pending items. Stops on first failure to avoid tight loops.
 */
async function drainOnce() {
    if (!(await tableExists())) return;
    let processed;
    do {
        processed = await processNext().catch(err => {
            console.error(`[GE Outbox] drainOnce error: ${err.message}`);
            return false;
        });
    } while (processed);
}

/** Returns true when the outbox worker interval is active. */
function isRunning() { return _timer !== null; }

function start() {
    // GE_WORKER_ENABLED must be explicitly 'true' to start.
    // Default is disabled so that a misconfigured production deploy
    // cannot start processing before the ge_outbox migration has run.
    if (process.env.GE_WORKER_ENABLED !== 'true') {
        console.log('[GE Outbox] Worker DISABLED (GE_WORKER_ENABLED is not "true"). ' +
            'Set GE_WORKER_ENABLED=true in production after running migrations.');
        return;
    }
    if (_timer) return;
    _timer = setInterval(drainOnce, POLL_INTERVAL_MS);
    _timer.unref?.(); // don't keep process alive just for the worker
    console.log(`[GE Outbox] Worker started (poll interval: ${POLL_INTERVAL_MS / 1000}s)`);
    drainOnce(); // immediate first run
}

function stop() {
    if (_timer) { clearInterval(_timer); _timer = null; }
}

module.exports = {
    enqueue, start, stop, processNext, drainOnce, isDegraded, isRunning,
    _resetTableCache: () => { _tableExists = null; _degraded = false; },
};
