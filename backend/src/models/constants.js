const SOURCES = Object.freeze([
    'website_form',
    'chat_widget',
    'whatsapp_organico',
    'instagram',
    'facebook',
    'google_organic',
    'google_business',
    'meta_ads',
    'google_ads',
    'conectatap',
    'qr_nfc',
    'referido',
    'mercado_publico',
    'booking',
    'manual',
    'other',
]);

const OPPORTUNITY_STATUSES = Object.freeze([
    'new',
    'contacted',
    'qualified',
    'quoted',
    'won',
    'lost',
    'spam',
    'duplicate',
    'out_of_coverage',
]);

// Statuses that close a commercial process.
// A new inbound from the same contact starts a fresh Opportunity.
const TERMINAL_STATUSES = Object.freeze([
    'won', 'lost', 'spam', 'duplicate', 'out_of_coverage',
]);

// Number of days without activity before an opportunity is considered stale.
// Must be the single source of truth — frontend reads this from /api/growth/config.
const STALE_DAYS = 7;

// Scoring weights for deterministic opportunity score (0–100).
const SCORE_WEIGHTS = Object.freeze({
    stage:       { new: 10, contacted: 15, qualified: 20, quoted: 25 },
    touchpoint:  5,          // per touchpoint, up to SCORE_WEIGHTS.maxTouchpoints
    maxTouchpoints: 20,      // cap: +20
    hasQuote:    15,
    hasBooking:  12,         // booking source touchpoint
    stale:       -2,         // per day over STALE_DAYS, up to SCORE_WEIGHTS.maxStalePenalty
    maxStalePenalty: -30,
    // Source bonuses (applied on latest touchpoint's source)
    source: {
        booking:         12,
        website_form:    8,
        conectatap:      8,
        qr_nfc:          6,
        referido:        6,
        chat_widget:     5,
        whatsapp_organico: 4,
        instagram:       3,
        facebook:        3,
        google_organic:  3,
        google_business: 3,
        meta_ads:        2,
        google_ads:      2,
        mercado_publico: 4,
        manual:          0,
        other:           1,
    },
});

// Follow-up types
const FOLLOWUP_TYPES = Object.freeze([
    'call', 'email', 'visit', 'message', 'other',
]);

// Follow-up statuses
const FOLLOWUP_STATUSES = Object.freeze([
    'pending', 'done', 'cancelled', 'missed',
]);

// Follow-up priorities
const FOLLOWUP_PRIORITIES = Object.freeze(['low', 'medium', 'high']);

module.exports = {
    SOURCES,
    OPPORTUNITY_STATUSES,
    TERMINAL_STATUSES,
    STALE_DAYS,
    SCORE_WEIGHTS,
    FOLLOWUP_TYPES,
    FOLLOWUP_STATUSES,
    FOLLOWUP_PRIORITIES,
};
