'use strict';

describe('Sequelize associations', () => {
    let models;

    beforeAll(() => {
        models = require('../../models');
    });

    // ── Contact ───────────────────────────────────────────────────────────────

    test('Contact.hasMany(Opportunity) as "opportunities"', () => {
        expect(models.Contact.associations).toHaveProperty('opportunities');
    });

    test('Contact → Opportunity FK is "contact_id"', () => {
        expect(models.Contact.associations.opportunities.foreignKey).toBe('contact_id');
    });

    // ── Opportunity ───────────────────────────────────────────────────────────

    test('Opportunity.belongsTo(Contact) as "contact"', () => {
        expect(models.Opportunity.associations).toHaveProperty('contact');
    });

    test('Opportunity.hasMany(Touchpoint) as "touchpoints"', () => {
        expect(models.Opportunity.associations).toHaveProperty('touchpoints');
    });

    test('Opportunity → Touchpoint FK is "opportunity_id"', () => {
        expect(models.Opportunity.associations.touchpoints.foreignKey).toBe('opportunity_id');
    });

    test('Opportunity.hasMany(OpportunityEvent) as "events"', () => {
        expect(models.Opportunity.associations).toHaveProperty('events');
    });

    test('Opportunity → OpportunityEvent FK is "opportunity_id"', () => {
        expect(models.Opportunity.associations.events.foreignKey).toBe('opportunity_id');
    });

    test('Opportunity.hasMany(Quote) as "quotes"', () => {
        expect(models.Opportunity.associations).toHaveProperty('quotes');
    });

    // ── Touchpoint ────────────────────────────────────────────────────────────

    test('Touchpoint.belongsTo(Opportunity) as "opportunity"', () => {
        expect(models.Touchpoint.associations).toHaveProperty('opportunity');
    });

    // ── OpportunityEvent ──────────────────────────────────────────────────────

    test('OpportunityEvent.belongsTo(Opportunity) as "opportunity"', () => {
        expect(models.OpportunityEvent.associations).toHaveProperty('opportunity');
    });

    // ── Quote ─────────────────────────────────────────────────────────────────

    test('Quote.belongsTo(Opportunity) as "opportunity"', () => {
        expect(models.Quote.associations).toHaveProperty('opportunity');
    });

    // ── Lead ──────────────────────────────────────────────────────────────────

    test('Lead.belongsTo(Contact) as "contact"', () => {
        expect(models.Lead.associations).toHaveProperty('contact');
    });

    test('Lead.belongsTo(Opportunity) as "opportunity"', () => {
        expect(models.Lead.associations).toHaveProperty('opportunity');
    });
});
