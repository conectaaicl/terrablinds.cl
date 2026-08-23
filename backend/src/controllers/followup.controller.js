'use strict';

const { Op } = require('sequelize');
const { FollowUp, Opportunity, Contact } = require('../models');
const { FOLLOWUP_TYPES, FOLLOWUP_STATUSES, FOLLOWUP_PRIORITIES } = require('../models/constants');

const FOLLOWUP_ATTRS = [
    'id', 'opportunity_id', 'scheduled_at', 'type', 'status', 'priority',
    'next_action', 'responsible', 'note', 'completed_at', 'created_at', 'updated_at',
];

// ── POST /api/growth/opportunities/:id/follow-ups ─────────────────────────────

exports.createFollowUp = async (req, res, next) => {
    try {
        const oppId = parseInt(req.params.id, 10);
        if (!oppId) return res.status(400).json({ error: 'Invalid opportunity id' });

        const opp = await Opportunity.findByPk(oppId, { attributes: ['id'] });
        if (!opp) return res.status(404).json({ error: `Opportunity ${oppId} not found` });

        const { scheduled_at, type, status, priority, next_action, responsible, note } = req.body;

        if (!scheduled_at) return res.status(400).json({ error: 'scheduled_at is required' });
        if (type && !FOLLOWUP_TYPES.includes(type))
            return res.status(400).json({ error: `Invalid type: ${type}` });
        if (status && !FOLLOWUP_STATUSES.includes(status))
            return res.status(400).json({ error: `Invalid status: ${status}` });
        if (priority && !FOLLOWUP_PRIORITIES.includes(priority))
            return res.status(400).json({ error: `Invalid priority: ${priority}` });

        const fu = await FollowUp.create({
            opportunity_id: oppId,
            scheduled_at:   new Date(scheduled_at),
            type:           type       || 'call',
            status:         status     || 'pending',
            priority:       priority   || 'medium',
            next_action:    next_action || null,
            responsible:    responsible || null,
            note:           note        || null,
        });

        res.status(201).json(fu);
    } catch (err) { next(err); }
};

// ── GET /api/growth/opportunities/:id/follow-ups ──────────────────────────────

exports.listFollowUps = async (req, res, next) => {
    try {
        const oppId = parseInt(req.params.id, 10);
        if (!oppId) return res.status(400).json({ error: 'Invalid opportunity id' });

        const items = await FollowUp.findAll({
            where:      { opportunity_id: oppId },
            attributes: FOLLOWUP_ATTRS,
            order:      [['scheduled_at', 'ASC']],
        });
        res.json(items);
    } catch (err) { next(err); }
};

// ── PUT /api/growth/follow-ups/:id ────────────────────────────────────────────

exports.updateFollowUp = async (req, res, next) => {
    try {
        const fuId = parseInt(req.params.id, 10);
        if (!fuId) return res.status(400).json({ error: 'Invalid follow-up id' });

        const fu = await FollowUp.findByPk(fuId);
        if (!fu) return res.status(404).json({ error: `Follow-up ${fuId} not found` });

        const { scheduled_at, type, status, priority, next_action, responsible, note } = req.body;

        if (type     && !FOLLOWUP_TYPES.includes(type))
            return res.status(400).json({ error: `Invalid type: ${type}` });
        if (status   && !FOLLOWUP_STATUSES.includes(status))
            return res.status(400).json({ error: `Invalid status: ${status}` });
        if (priority && !FOLLOWUP_PRIORITIES.includes(priority))
            return res.status(400).json({ error: `Invalid priority: ${priority}` });

        const updates = {};
        if (scheduled_at !== undefined) updates.scheduled_at = new Date(scheduled_at);
        if (type          !== undefined) updates.type          = type;
        if (priority      !== undefined) updates.priority      = priority;
        if (next_action   !== undefined) updates.next_action   = next_action;
        if (responsible   !== undefined) updates.responsible   = responsible;
        if (note          !== undefined) updates.note          = note;

        if (status !== undefined) {
            updates.status = status;
            if (status === 'done' && !fu.completed_at) updates.completed_at = new Date();
        }

        await fu.update(updates);
        res.json(fu);
    } catch (err) { next(err); }
};

// ── DELETE /api/growth/follow-ups/:id ────────────────────────────────────────

exports.deleteFollowUp = async (req, res, next) => {
    try {
        const fuId = parseInt(req.params.id, 10);
        if (!fuId) return res.status(400).json({ error: 'Invalid follow-up id' });

        const fu = await FollowUp.findByPk(fuId);
        if (!fu) return res.status(404).json({ error: `Follow-up ${fuId} not found` });

        await fu.destroy();
        res.json({ message: `Follow-up ${fuId} deleted` });
    } catch (err) { next(err); }
};

// ── GET /api/growth/follow-ups?scope=today|overdue|upcoming|unscheduled ───────

exports.listAllFollowUps = async (req, res, next) => {
    try {
        const { scope, priority } = req.query;
        const now    = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);

        const where = { status: 'pending' };

        if (scope === 'today') {
            where.scheduled_at = { [Op.between]: [todayStart, todayEnd] };
        } else if (scope === 'overdue') {
            where.scheduled_at = { [Op.lt]: todayStart };
        } else if (scope === 'upcoming') {
            where.scheduled_at = { [Op.gt]: todayEnd };
        }
        // scope === 'all' or undefined → no date filter, but still only pending

        if (priority && FOLLOWUP_PRIORITIES.includes(priority)) {
            where.priority = priority;
        }

        const items = await FollowUp.findAll({
            where,
            attributes: FOLLOWUP_ATTRS,
            order: [['scheduled_at', 'ASC']],
            include: [{
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
            }],
        });

        res.json(items);
    } catch (err) { next(err); }
};
