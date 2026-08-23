'use strict';

const { Op } = require('sequelize');
const { Contact, Opportunity, Touchpoint, FollowUp } = require('../models');
const { TERMINAL_STATUSES, STALE_DAYS, OPPORTUNITY_STATUSES } = require('../models/constants');
const { computeScore } = require('../services/scoring.service');

const OPEN_STATUSES = OPPORTUNITY_STATUSES.filter(s => !TERMINAL_STATUSES.includes(s));

// ── GET /api/growth/today ─────────────────────────────────────────────────────
// Aggregated "what do I do today?" view for the sales team.

exports.getToday = async (req, res, next) => {
    try {
        const now        = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
        const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 3600 * 1000);
        const oneDayAgo  = new Date(Date.now() - 24 * 3600 * 1000);

        const [
            overdueFollowUps,
            todayFollowUps,
            staleOpps,
            newUncontacted,
            recentActivity,
        ] = await Promise.all([

            // Overdue pending follow-ups
            FollowUp.findAll({
                where: { status: 'pending', scheduled_at: { [Op.lt]: todayStart } },
                order: [['scheduled_at', 'ASC']],
                limit: 20,
                include: [{
                    model: Opportunity, as: 'opportunity',
                    attributes: ['id', 'status', 'product_interest'],
                    include: [{ model: Contact, as: 'contact', attributes: ['id', 'name', 'phone'], required: false }],
                    required: false,
                }],
            }),

            // Today's pending follow-ups
            FollowUp.findAll({
                where: { status: 'pending', scheduled_at: { [Op.between]: [todayStart, todayEnd] } },
                order: [['scheduled_at', 'ASC']],
                limit: 20,
                include: [{
                    model: Opportunity, as: 'opportunity',
                    attributes: ['id', 'status', 'product_interest'],
                    include: [{ model: Contact, as: 'contact', attributes: ['id', 'name', 'phone'], required: false }],
                    required: false,
                }],
            }),

            // Stale open opportunities (no update in STALE_DAYS)
            Opportunity.findAll({
                where: {
                    status:     { [Op.notIn]: TERMINAL_STATUSES },
                    updated_at: { [Op.lt]: staleThreshold },
                },
                attributes: ['id', 'status', 'product_interest', 'updated_at', 'contact_id'],
                order: [['updated_at', 'ASC']],
                limit: 20,
                include: [{ model: Contact, as: 'contact', attributes: ['id', 'name', 'phone'], required: false }],
            }),

            // New contacts with no touchpoints (uncontacted leads)
            Contact.findAll({
                where: { created_at: { [Op.gte]: new Date(Date.now() - 3 * 24 * 3600 * 1000) } },
                attributes: ['id', 'name', 'email', 'phone', 'created_at'],
                order: [['created_at', 'DESC']],
                limit: 10,
                include: [{
                    model: Opportunity, as: 'opportunities',
                    attributes: ['id', 'status'],
                    separate: true,
                    where: { status: 'new' },
                    required: true,
                }],
            }),

            // Recent activity in last 24h for context
            Touchpoint.findAll({
                where: { occurred_at: { [Op.gte]: oneDayAgo } },
                attributes: ['id', 'source', 'occurred_at', 'opportunity_id'],
                order: [['occurred_at', 'DESC']],
                limit: 10,
                include: [{
                    model: Opportunity, as: 'opportunity',
                    attributes: ['id', 'status', 'product_interest'],
                    include: [{ model: Contact, as: 'contact', attributes: ['id', 'name'], required: false }],
                    required: false,
                }],
            }),
        ]);

        // Add computed score to stale opps
        const staleWithScore = staleOpps.map(opp => {
            const plain = opp.get({ plain: true });
            const { score } = computeScore(plain, { touchpoints: [], quotes: [], events: [] });
            return { ...plain, score };
        });

        res.json({
            summary: {
                overdue_follow_ups: overdueFollowUps.length,
                today_follow_ups:   todayFollowUps.length,
                stale_opportunities: staleOpps.length,
                new_uncontacted:    newUncontacted.length,
                stale_days:         STALE_DAYS,
            },
            overdue_follow_ups:  overdueFollowUps,
            today_follow_ups:    todayFollowUps,
            stale_opportunities: staleWithScore,
            new_uncontacted:     newUncontacted,
            recent_activity:     recentActivity,
        });
    } catch (err) { next(err); }
};
