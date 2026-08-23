'use strict';

const { Op } = require('sequelize');
const {
    Contact, Opportunity, Touchpoint, OpportunityEvent, Quote, GeOutbox, FollowUp, Lead, sequelize,
} = require('../models');
const { transitionOpportunity, VALID_TRANSITIONS } = require('../services/opportunity.service');
const { OPPORTUNITY_STATUSES, TERMINAL_STATUSES, STALE_DAYS } = require('../models/constants');
const { computeScore } = require('../services/scoring.service');
const geWorker = require('../services/ge_worker.service');

const OPEN_STATUSES   = OPPORTUNITY_STATUSES.filter(s => !TERMINAL_STATUSES.includes(s));
const LIMIT_MAX       = 100;
const LIMIT_DEFAULT   = 20;

const CONTACT_ATTRS = ['id', 'name', 'email', 'phone', 'phone_normalized', 'notes', 'created_at', 'updated_at'];
const OPP_ATTRS     = ['id', 'contact_id', 'status', 'product_interest', 'notes', 'won_amount', 'won_at', 'lost_reason', 'created_at', 'updated_at'];

function parsePage(q) {
    const page  = Math.max(1, parseInt(q.page, 10)  || 1);
    const limit = Math.min(LIMIT_MAX, Math.max(1, parseInt(q.limit, 10) || LIMIT_DEFAULT));
    return { page, limit, offset: (page - 1) * limit };
}

// ── GET /api/growth/dashboard ─────────────────────────────────────────────────

exports.getDashboard = async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

        const [statusRows, wonRow, recentContacts, staleCount, sourceRows] = await Promise.all([
            Opportunity.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
                group: ['status'],
                raw: true,
            }),
            Opportunity.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('won_amount')), 0), 'total'],
                ],
                where: { status: 'won' },
                raw: true,
            }),
            Contact.findAll({
                attributes: CONTACT_ATTRS,
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{
                    model:      Opportunity,
                    as:         'opportunities',
                    attributes: ['id', 'status', 'product_interest', 'created_at'],
                    separate:   true,
                    order:      [['created_at', 'DESC']],
                    limit:      1,
                    required:   false,
                }],
            }),
            Opportunity.count({
                where: {
                    status:     { [Op.notIn]: TERMINAL_STATUSES },
                    updated_at: { [Op.lt]: sevenDaysAgo },
                },
            }),
            Touchpoint.findAll({
                attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'cnt']],
                group: ['source'],
                raw: true,
            }),
        ]);

        const byStatus = {};
        statusRows.forEach(r => { byStatus[r.status] = parseInt(r.cnt, 10); });

        const openCount = OPEN_STATUSES.reduce((sum, s) => sum + (byStatus[s] || 0), 0);

        res.json({
            opportunities: {
                new:       byStatus.new   || 0,
                open:      openCount,
                won:       byStatus.won   || 0,
                lost:      byStatus.lost  || 0,
                by_status: byStatus,
            },
            revenue: {
                won: parseFloat(wonRow?.total ?? 0),
            },
            contacts_recent:     recentContacts,
            stale_count:         staleCount,
            source_distribution: sourceRows.map(r => ({
                source: r.source,
                count:  parseInt(r.cnt, 10),
            })).sort((a, b) => b.count - a.count),
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/pipeline ──────────────────────────────────────────────────

exports.getPipeline = async (req, res, next) => {
    try {
        const rows = await Opportunity.findAll({
            where:      { status: { [Op.notIn]: TERMINAL_STATUSES } },
            attributes: OPP_ATTRS,
            order:      [['created_at', 'DESC']],
            include: [
                {
                    model:      Contact,
                    as:         'contact',
                    attributes: ['id', 'name', 'email', 'phone'],
                    required:   false,
                },
                {
                    model:      Touchpoint,
                    as:         'touchpoints',
                    attributes: ['id', 'source', 'occurred_at'],
                    separate:   true,
                    order:      [['occurred_at', 'DESC']],
                    required:   false,
                },
                {
                    model:      Quote,
                    as:         'quotes',
                    attributes: ['id'],
                    required:   false,
                },
                {
                    model:      OpportunityEvent,
                    as:         'events',
                    attributes: ['id'],
                    separate:   true,
                    required:   false,
                },
            ],
        });

        const pipeline = {};
        OPEN_STATUSES.forEach(s => { pipeline[s] = []; });

        rows.forEach(opp => {
            const plain             = opp.get({ plain: true });
            plain.last_touchpoint   = plain.touchpoints?.[0] || null;
            plain.quote_count       = plain.quotes?.length   || 0;
            plain.valid_transitions = VALID_TRANSITIONS[opp.status] || [];
            const { score, factors } = computeScore(plain, {
                touchpoints: plain.touchpoints || [],
                quotes:      plain.quotes      || [],
                events:      plain.events      || [],
            });
            plain.score   = score;
            plain.factors = factors;
            delete plain.touchpoints;
            delete plain.quotes;
            delete plain.events;
            if (pipeline[opp.status]) pipeline[opp.status].push(plain);
        });

        res.json(pipeline);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/opportunities ────────────────────────────────────────────

exports.listOpportunities = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePage(req.query);
        const { status, q }           = req.query;

        const where = {};
        if (status && OPPORTUNITY_STATUSES.includes(status)) {
            where.status = status;
        }

        const contactWhere = {};
        if (q) {
            const like = { [Op.iLike]: `%${q}%` };
            contactWhere[Op.or] = [
                { name:  like },
                { email: like },
                { phone: like },
            ];
        }

        const { count, rows } = await Opportunity.findAndCountAll({
            where,
            attributes: OPP_ATTRS,
            include: [{
                model:      Contact,
                as:         'contact',
                attributes: ['id', 'name', 'email', 'phone'],
                where:      q ? contactWhere : undefined,
                required:   !!q,
            }],
            order:    [['created_at', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        // Bulk-load score data for this page to avoid n+1 queries
        const ids = rows.map(r => r.id);
        let scoreMap = {};
        if (ids.length) {
            const [tps, quotes, events] = await Promise.all([
                Touchpoint.findAll({
                    where: { opportunity_id: { [Op.in]: ids } },
                    attributes: ['id', 'source', 'occurred_at', 'opportunity_id'],
                }),
                Quote.findAll({
                    where: { opportunity_id: { [Op.in]: ids } },
                    attributes: ['id', 'opportunity_id'],
                }),
                OpportunityEvent.findAll({
                    where: { opportunity_id: { [Op.in]: ids } },
                    attributes: ['id', 'opportunity_id'],
                }),
            ]);
            const tpMap  = {};
            const qMap   = {};
            const evMap  = {};
            tps.forEach(t    => { (tpMap[t.opportunity_id]  = tpMap[t.opportunity_id]  || []).push(t); });
            quotes.forEach(q => { (qMap[q.opportunity_id]   = qMap[q.opportunity_id]   || []).push(q); });
            events.forEach(e => { (evMap[e.opportunity_id]  = evMap[e.opportunity_id]  || []).push(e); });
            ids.forEach(id => {
                const plain = rows.find(r => r.id === id)?.get({ plain: true }) || {};
                const { score, factors } = computeScore(plain, {
                    touchpoints: tpMap[id]  || [],
                    quotes:      qMap[id]   || [],
                    events:      evMap[id]  || [],
                });
                scoreMap[id] = { score, factors };
            });
        }

        const data = rows.map(opp => {
            const plain = opp.get({ plain: true });
            plain.score   = scoreMap[opp.id]?.score   ?? null;
            plain.factors = scoreMap[opp.id]?.factors ?? [];
            return plain;
        });

        res.json({ total: count, page, limit, pages: Math.ceil(count / limit), data });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/opportunities/:id (360°) ──────────────────────────────────

exports.getOpportunity = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id, 10);
        if (!parsedId || isNaN(parsedId)) {
            return res.status(400).json({ error: 'Invalid opportunity id' });
        }

        const opp = await Opportunity.findByPk(parsedId, {
            attributes: OPP_ATTRS,
            include: [
                {
                    model:      Contact,
                    as:         'contact',
                    attributes: CONTACT_ATTRS,
                    required:   false,
                },
                {
                    model:      Touchpoint,
                    as:         'touchpoints',
                    attributes: ['id', 'source', 'external_ref', 'channel_detail', 'metadata', 'occurred_at', 'created_at'],
                    separate:   true,
                    order:      [['occurred_at', 'DESC']],
                    required:   false,
                },
                {
                    model:      OpportunityEvent,
                    as:         'events',
                    attributes: ['id', 'from_status', 'to_status', 'actor', 'note', 'created_at'],
                    separate:   true,
                    order:      [['created_at', 'DESC']],
                    required:   false,
                },
                {
                    model:      Quote,
                    as:         'quotes',
                    attributes: ['id', 'status', 'total_amount', 'customer_name', 'customer_email', 'created_at'],
                    required:   false,
                },
            ],
        });

        if (!opp) return res.status(404).json({ error: `Opportunity ${parsedId} not found` });

        const plain             = opp.get({ plain: true });
        plain.valid_transitions = VALID_TRANSITIONS[opp.status] || [];
        res.json(plain);
    } catch (err) {
        next(err);
    }
};

// ── POST /api/growth/opportunities/:id/transition ─────────────────────────────

exports.transitionOpp = async (req, res, next) => {
    try {
        const parsedId                     = parseInt(req.params.id, 10);
        const { to_status, note, won_amount } = req.body;

        if (!parsedId || isNaN(parsedId)) {
            return res.status(400).json({ error: 'Invalid opportunity id' });
        }
        if (!to_status || !OPPORTUNITY_STATUSES.includes(to_status)) {
            return res.status(400).json({ error: `Invalid status: "${to_status}"` });
        }

        const actor     = req.user?.email || String(req.user?.id || 'admin');
        const wonAmount = to_status === 'won' && won_amount != null
            ? parseFloat(won_amount)
            : undefined;

        const opp = await transitionOpportunity(parsedId, to_status, actor, note || null, { wonAmount });

        res.json({
            id:                opp.id,
            status:            opp.status,
            won_amount:        opp.won_amount,
            won_at:            opp.won_at,
            updated_at:        opp.updated_at,
            valid_transitions: VALID_TRANSITIONS[opp.status] || [],
        });
    } catch (err) {
        if (err.message?.includes('Invalid transition') || err.message?.includes('not found')) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
};

// ── GET /api/growth/contacts ──────────────────────────────────────────────────

exports.listContacts = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePage(req.query);
        const { q }                   = req.query;

        const where = {};
        if (q) {
            const like = { [Op.iLike]: `%${q}%` };
            where[Op.or] = [
                { name:             like },
                { email:            like },
                { phone:            like },
                { phone_normalized: like },
            ];
        }

        const { count, rows } = await Contact.findAndCountAll({
            where,
            attributes: CONTACT_ATTRS,
            order:      [['created_at', 'DESC']],
            limit,
            offset,
            distinct:   true,
            include: [{
                model:      Opportunity,
                as:         'opportunities',
                attributes: ['id', 'status', 'product_interest', 'won_amount', 'created_at'],
                separate:   true,
                order:      [['created_at', 'DESC']],
                limit:      1,
                required:   false,
            }],
        });

        res.json({ total: count, page, limit, pages: Math.ceil(count / limit), data: rows });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/contacts/:id ──────────────────────────────────────────────

exports.getContact = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id, 10);
        if (!parsedId || isNaN(parsedId)) {
            return res.status(400).json({ error: 'Invalid contact id' });
        }

        const contact = await Contact.findByPk(parsedId, {
            attributes: CONTACT_ATTRS,
            include: [{
                model:      Opportunity,
                as:         'opportunities',
                attributes: OPP_ATTRS,
                separate:   true,
                order:      [['created_at', 'DESC']],
                include: [{
                    model:      Quote,
                    as:         'quotes',
                    attributes: ['id', 'status', 'total_amount', 'customer_name', 'created_at'],
                    required:   false,
                }],
            }],
        });

        if (!contact) return res.status(404).json({ error: `Contact ${parsedId} not found` });

        let phone_match_count = 0;
        if (contact.phone_normalized) {
            phone_match_count = await Contact.count({
                where: {
                    phone_normalized: contact.phone_normalized,
                    id:               { [Op.ne]: parsedId },
                },
            });
        }

        const plain             = contact.get({ plain: true });
        plain.phone_match_count = phone_match_count;
        res.json(plain);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/opportunities/:id/score ───────────────────────────────────

exports.getScore = async (req, res, next) => {
    try {
        const parsedId = parseInt(req.params.id, 10);
        if (!parsedId) return res.status(400).json({ error: 'Invalid opportunity id' });

        const opp = await Opportunity.findByPk(parsedId, {
            attributes: OPP_ATTRS,
            include: [
                { model: Touchpoint,        as: 'touchpoints', attributes: ['id','source','occurred_at'], separate: true, order: [['occurred_at','DESC']], required: false },
                { model: Quote,             as: 'quotes',      attributes: ['id'], required: false },
                { model: OpportunityEvent,  as: 'events',      attributes: ['id'], required: false },
            ],
        });
        if (!opp) return res.status(404).json({ error: `Opportunity ${parsedId} not found` });

        const plain = opp.get({ plain: true });
        const result = computeScore(plain, {
            touchpoints: plain.touchpoints || [],
            quotes:      plain.quotes      || [],
            events:      plain.events      || [],
        });
        res.json({ opportunity_id: parsedId, ...result });
    } catch (err) { next(err); }
};

// ── GET /api/growth/opportunities/stale ───────────────────────────────────────

exports.listStale = async (req, res, next) => {
    try {
        const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 3600 * 1000);
        const rows = await Opportunity.findAll({
            where: {
                status:     { [Op.notIn]: TERMINAL_STATUSES },
                updated_at: { [Op.lt]: staleThreshold },
            },
            attributes: OPP_ATTRS,
            order: [['updated_at', 'ASC']],
            include: [{
                model: Contact, as: 'contact',
                attributes: ['id', 'name', 'email', 'phone'],
                required: false,
            }],
        });
        res.json({ stale_days: STALE_DAYS, total: rows.length, data: rows });
    } catch (err) { next(err); }
};

// ── GET /api/growth/config ────────────────────────────────────────────────────

exports.getGrowthConfig = async (req, res, next) => {
    try {
        res.json({ stale_days: STALE_DAYS });
    } catch (err) { next(err); }
};

// ── GET /api/growth/activity ──────────────────────────────────────────────────
// ARCHITECTURE NOTE: This endpoint merges up to 200 touchpoints + 200 events in JS memory,
// then paginates the merged array. This means `total` is capped at 400 and pagination works
// on the in-memory slice rather than the true DB total. The `_capped` flag in the response
// signals when the cap is reached. Mitigation: use `from`/`to` date filters to narrow results.
// A future rewrite to DB-level UNION pagination would remove this constraint (Phase 8+).

exports.listActivity = async (req, res, next) => {
    try {
        const { page, limit, offset } = parsePage(req.query);
        const { source, type, from, to } = req.query;

        const dateFilter = {};
        if (from) dateFilter[Op.gte] = new Date(from);
        if (to)   dateFilter[Op.lte] = new Date(to);

        const oppInclude = {
            model:      Opportunity,
            as:         'opportunity',
            attributes: ['id', 'status', 'product_interest'],
            required:   false,
            include: [{
                model:      Contact,
                as:         'contact',
                attributes: ['id', 'name', 'email', 'phone'],
                required:   false,
            }],
        };

        const CAP = 200;
        const [touchpoints, events] = await Promise.all([
            type === 'event' ? Promise.resolve([]) :
            Touchpoint.findAll({
                where: {
                    ...(source ? { source } : {}),
                    ...(Object.keys(dateFilter).length ? { occurred_at: dateFilter } : {}),
                },
                attributes: ['id', 'source', 'external_ref', 'channel_detail', 'metadata', 'occurred_at', 'opportunity_id'],
                order:      [['occurred_at', 'DESC']],
                limit:      CAP,
                include:    [oppInclude],
            }),
            type === 'touchpoint' ? Promise.resolve([]) :
            OpportunityEvent.findAll({
                where: Object.keys(dateFilter).length ? { created_at: dateFilter } : {},
                attributes: ['id', 'from_status', 'to_status', 'actor', 'note', 'created_at', 'opportunity_id'],
                order:      [['created_at', 'DESC']],
                limit:      CAP,
                include:    [oppInclude],
            }),
        ]);

        const merged = [
            ...touchpoints.map(t => ({ type: 'touchpoint', at: t.occurred_at, data: t.toJSON() })),
            ...events.map(e => ({ type: 'event', at: e.created_at, data: e.toJSON() })),
        ].sort((a, b) => new Date(b.at) - new Date(a.at));

        const total  = merged.length;
        const capped = touchpoints.length === CAP || events.length === CAP;
        const paged  = merged.slice(offset, offset + limit);

        res.json({
            total,
            page,
            limit,
            pages:   Math.ceil(total / limit),
            data:    paged,
            _capped: capped || undefined, // present and true only when cap was reached
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/health ────────────────────────────────────────────────────

exports.getHealth = async (req, res, next) => {
    try {
        const now = new Date();
        const staleThreshold = new Date(now - STALE_DAYS * 24 * 3600 * 1000);

        let outboxStats = null;
        try {
            const [pendingCount, failedCount, oldestPending] = await Promise.all([
                GeOutbox.count({
                    where: { processed_at: null, attempts: { [Op.lt]: 5 } },
                }),
                GeOutbox.count({
                    where: { processed_at: null, attempts: { [Op.gte]: 5 } },
                }),
                GeOutbox.findOne({
                    where: { processed_at: null, attempts: { [Op.lt]: 5 } },
                    order: [['created_at', 'ASC']],
                    attributes: ['created_at'],
                }),
            ]);
            outboxStats = {
                pending:                pendingCount,
                failed:                 failedCount,
                oldest_pending_age_min: oldestPending
                    ? Math.round((now - new Date(oldestPending.created_at)) / 60000)
                    : null,
            };
        } catch {
            // ge_outbox table doesn't exist (degraded mode) — stats unavailable
        }

        const [overdueFollowUps, staleCount] = await Promise.all([
            FollowUp.count({
                where: { status: 'pending', scheduled_at: { [Op.lt]: now } },
            }),
            Opportunity.count({
                where: {
                    status:     { [Op.notIn]: TERMINAL_STATUSES },
                    updated_at: { [Op.lt]: staleThreshold },
                },
            }),
        ]);

        const degraded = geWorker.isDegraded();
        res.json({
            ge_status:           degraded ? 'degraded' : 'operational',
            ge_severity:         degraded ? 'critical' : 'ok',
            outbox:              outboxStats,
            overdue_follow_ups:  overdueFollowUps,
            stale_opportunities: staleCount,
            checked_at:          now,
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/lead-stats ───────────────────────────────────────────────
// Returns time-period breakdowns for contacts (authoritative GE source) and
// raw leads table (note: lead rows may be deleted; contacts persist).
// Three state kinds kept separate: technical GE state, lead reception, pipeline.

exports.getLeadStats = async (req, res, next) => {
    try {
        const now           = new Date();
        const oneDayAgo     = new Date(now - 86400000);
        const sevenDaysAgo  = new Date(now - 7  * 86400000);
        const thirtyDaysAgo = new Date(now - 30 * 86400000);

        const [
            contactsToday, contacts7d, contacts30d, totalContacts, lastContact,
            totalLeads,    leadsToday, leads7d,     leads30d,
            convertedContacts,
        ] = await Promise.all([
            Contact.count({ where: { created_at: { [Op.gte]: oneDayAgo     } } }),
            Contact.count({ where: { created_at: { [Op.gte]: sevenDaysAgo  } } }),
            Contact.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } }),
            Contact.count(),
            Contact.findOne({ order: [['created_at', 'DESC']], attributes: ['created_at'] }),
            Lead.count(),
            Lead.count({ where: { created_at: { [Op.gte]: oneDayAgo     } } }),
            Lead.count({ where: { created_at: { [Op.gte]: sevenDaysAgo  } } }),
            Lead.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } }),
            // Contacts that have at least one opportunity = converted
            Contact.count({
                include: [{
                    model:    Opportunity,
                    as:       'opportunities',
                    required: true,
                    attributes: [],
                }],
                distinct: true,
            }),
        ]);

        res.json({
            contacts: {
                total:    totalContacts,
                today:    contactsToday,
                last_7d:  contacts7d,
                last_30d: contacts30d,
                last_at:  lastContact?.created_at || null,
                converted_to_opportunity: convertedContacts,
            },
            leads: {
                total:    totalLeads,
                today:    leadsToday,
                last_7d:  leads7d,
                last_30d: leads30d,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/growth/alerts ────────────────────────────────────────────────────
// Lightweight alert count used by the frontend notification badge.
// No persistent model — computes live. Designed to be fast (3 parallel queries).

exports.getAlerts = async (req, res, next) => {
    try {
        const now = new Date();
        const staleThreshold = new Date(now - STALE_DAYS * 24 * 3600 * 1000);

        const [overdueCount, staleCount] = await Promise.all([
            FollowUp.count({
                where: { status: 'pending', scheduled_at: { [Op.lt]: now } },
            }),
            Opportunity.count({
                where: {
                    status:     { [Op.notIn]: TERMINAL_STATUSES },
                    updated_at: { [Op.lt]: staleThreshold },
                },
            }),
        ]);

        const ge_degraded = geWorker.isDegraded();

        const alerts = [];
        if (overdueCount > 0)  alerts.push({ type: 'overdue_follow_ups', label: `${overdueCount} seguimiento${overdueCount > 1 ? 's' : ''} vencido${overdueCount > 1 ? 's' : ''}`, count: overdueCount });
        if (staleCount > 0)    alerts.push({ type: 'stale_opportunities', label: `${staleCount} oportunidad${staleCount > 1 ? 'es' : ''} estancada${staleCount > 1 ? 's' : ''}`, count: staleCount });
        if (ge_degraded)       alerts.push({ type: 'ge_degraded', label: 'Motor de crecimiento en modo degradado', count: 1 });

        res.json({ total: alerts.reduce((s, a) => s + a.count, 0), alerts });
    } catch (err) {
        next(err);
    }
};
