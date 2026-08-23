'use strict';

/**
 * RBAC guard tests — verify that ALL growth/followup/today routers:
 *  1. Wire `protect` (reference identity check on global router.use layers)
 *  2. Wire a restrictTo-produced guard (count check: ≥ 2 global middleware)
 *  3. `restrictTo` itself correctly rejects non-admin roles (unit test)
 */

jest.mock('../../models', () => {
    const mkModel = () => ({
        findAll:         jest.fn().mockResolvedValue([]),
        findOne:         jest.fn().mockResolvedValue(null),
        findByPk:        jest.fn().mockResolvedValue(null),
        findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
        count:           jest.fn().mockResolvedValue(0),
        create:          jest.fn().mockResolvedValue({}),
    });
    return {
        Contact:          mkModel(),
        Opportunity:      mkModel(),
        Touchpoint:       mkModel(),
        OpportunityEvent: mkModel(),
        Quote:            mkModel(),
        FollowUp:         mkModel(),
        GeOutbox:         mkModel(),
        sequelize: {
            fn:          jest.fn((_fn, col) => col),
            col:         jest.fn(c => c),
            transaction: jest.fn(),
        },
    };
});

jest.mock('../../services/opportunity.service', () => ({
    transitionOpportunity: jest.fn(),
    VALID_TRANSITIONS: {},
}));
jest.mock('../../services/scoring.service', () => ({
    computeScore: jest.fn().mockReturnValue({ score: 0, factors: [] }),
}));

const { protect, restrictTo } = require('../../middleware/auth.middleware');
const growthRouter   = require('../../routes/growth.routes');
const followupRouter = require('../../routes/followup.routes');
const todayRouter    = require('../../routes/today.routes');

/**
 * Collect the middleware handles registered via router.use() (not on individual routes).
 * These are the "global" guards applied to every route in the router.
 */
function globalHandles(router) {
    return (router.stack || [])
        .filter(l => !l.route)
        .map(l => l.handle);
}

/**
 * All handler functions on a specific route layer (flattened from route.stack).
 */
function allRouteHandles(router) {
    return (router.stack || [])
        .filter(l => l.route)
        .flatMap(l => (l.route.stack || []).map(s => s.handle));
}

// ── Wiring checks ─────────────────────────────────────────────────────────────

describe('Growth routes RBAC — protect is wired', () => {
    // protect is a named export (arrow function). Check by reference identity.
    function assertProtectPresent(router, label) {
        const global = globalHandles(router);
        const route  = allRouteHandles(router);
        const all    = [...global, ...route];
        expect(all).toContain(protect);
    }

    test('growth.routes.js includes protect', () => assertProtectPresent(growthRouter, 'growth'));
    test('followup.routes.js includes protect', () => assertProtectPresent(followupRouter, 'followup'));
    test('today.routes.js includes protect', () => assertProtectPresent(todayRouter, 'today'));
});

describe('Growth routes RBAC — at least 2 global middleware guards', () => {
    // router.use(protect, restrictTo('admin')) registers two layers before routes.
    // restrictTo returns a new anonymous function each call so we can't check by ref;
    // we verify count ≥ 2 to confirm both protect and a second guard exist.
    function assertTwoGlobalGuards(router, label) {
        const guards = globalHandles(router);
        expect(guards.length).toBeGreaterThanOrEqual(2);
    }

    test('growth.routes.js has ≥ 2 global guards', () => assertTwoGlobalGuards(growthRouter, 'growth'));
    test('followup.routes.js has ≥ 2 global guards', () => assertTwoGlobalGuards(followupRouter, 'followup'));
    test('today.routes.js has ≥ 2 global guards', () => assertTwoGlobalGuards(todayRouter, 'today'));
});

// ── restrictTo() — unit behaviour ─────────────────────────────────────────────

describe('restrictTo() — unit behaviour', () => {
    function makeCtx(role) {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json   = jest.fn().mockReturnValue(res);
        return {
            req:  { user: { role } },
            res,
            next: jest.fn(),
        };
    }

    test('allows admin role', () => {
        const { req, res, next } = makeCtx('admin');
        restrictTo('admin')(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects user role with 403', () => {
        const { req, res, next } = makeCtx('user');
        restrictTo('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects missing role with 403', () => {
        const { req, res, next } = makeCtx(undefined);
        restrictTo('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
