'use strict';

describe('Growth Engine — model attributes', () => {
    let models;

    beforeAll(() => {
        models = require('../../models');
    });

    // ── Contact ──────────────────────────────────────────────────────────────

    describe('Contact', () => {
        test('exported from models/index.js', () => {
            expect(models.Contact).toBeDefined();
        });
        test('maps to contacts table', () => {
            expect(models.Contact.tableName).toBe('contacts');
        });
        test('has: id name email phone phone_normalized notes', () => {
            const a = models.Contact.rawAttributes;
            ['id', 'name', 'email', 'phone', 'phone_normalized', 'notes'].forEach(f =>
                expect(a).toHaveProperty(f)
            );
        });
        test('email is nullable', () => {
            expect(models.Contact.rawAttributes.email.allowNull).toBe(true);
        });
        test('phone_normalized is nullable', () => {
            expect(models.Contact.rawAttributes.phone_normalized.allowNull).toBe(true);
        });
    });

    // ── Opportunity ───────────────────────────────────────────────────────────

    describe('Opportunity', () => {
        test('exported from models/index.js', () => {
            expect(models.Opportunity).toBeDefined();
        });
        test('maps to opportunities table', () => {
            expect(models.Opportunity.tableName).toBe('opportunities');
        });
        test('has: id contact_id product_interest status lost_reason notes won_amount won_at', () => {
            const a = models.Opportunity.rawAttributes;
            ['id', 'contact_id', 'product_interest', 'status',
             'lost_reason', 'notes', 'won_amount', 'won_at'].forEach(f =>
                expect(a).toHaveProperty(f)
            );
        });
        test('contact_id is required (allowNull: false)', () => {
            expect(models.Opportunity.rawAttributes.contact_id.allowNull).toBe(false);
        });
        test('status defaults to "new"', () => {
            expect(models.Opportunity.rawAttributes.status.defaultValue).toBe('new');
        });
        test('status ENUM contains all catalog values', () => {
            const { OPPORTUNITY_STATUSES } = require('../../models/constants');
            const vals = models.Opportunity.rawAttributes.status.values;
            OPPORTUNITY_STATUSES.forEach(s => expect(vals).toContain(s));
        });
        test('won_amount is nullable', () => {
            expect(models.Opportunity.rawAttributes.won_amount.allowNull).toBe(true);
        });
    });

    // ── Touchpoint ────────────────────────────────────────────────────────────

    describe('Touchpoint', () => {
        test('exported from models/index.js', () => {
            expect(models.Touchpoint).toBeDefined();
        });
        test('maps to touchpoints table', () => {
            expect(models.Touchpoint.tableName).toBe('touchpoints');
        });
        test('has: id opportunity_id source external_ref channel_detail metadata occurred_at', () => {
            const a = models.Touchpoint.rawAttributes;
            ['id', 'opportunity_id', 'source', 'external_ref',
             'channel_detail', 'metadata', 'occurred_at'].forEach(f =>
                expect(a).toHaveProperty(f)
            );
        });
        test('opportunity_id is nullable', () => {
            expect(models.Touchpoint.rawAttributes.opportunity_id.allowNull).toBe(true);
        });
        test('source is required', () => {
            expect(models.Touchpoint.rawAttributes.source.allowNull).toBe(false);
        });
        test('source validator is scoped to SOURCES catalog', () => {
            const { SOURCES } = require('../../models/constants');
            const isIn = models.Touchpoint.rawAttributes.source.validate.isIn;
            expect(isIn[0]).toEqual(SOURCES);
        });
        test('external_ref is nullable', () => {
            expect(models.Touchpoint.rawAttributes.external_ref.allowNull).toBe(true);
        });
        test('metadata defaults to {}', () => {
            expect(models.Touchpoint.rawAttributes.metadata.defaultValue).toEqual({});
        });
    });

    // ── OpportunityEvent ──────────────────────────────────────────────────────

    describe('OpportunityEvent', () => {
        test('exported from models/index.js', () => {
            expect(models.OpportunityEvent).toBeDefined();
        });
        test('maps to opportunity_events table', () => {
            expect(models.OpportunityEvent.tableName).toBe('opportunity_events');
        });
        test('has: id opportunity_id from_status to_status actor note', () => {
            const a = models.OpportunityEvent.rawAttributes;
            ['id', 'opportunity_id', 'from_status', 'to_status', 'actor', 'note'].forEach(f =>
                expect(a).toHaveProperty(f)
            );
        });
        test('to_status is required', () => {
            expect(models.OpportunityEvent.rawAttributes.to_status.allowNull).toBe(false);
        });
        test('from_status is nullable (first event has no previous status)', () => {
            expect(models.OpportunityEvent.rawAttributes.from_status.allowNull).toBe(true);
        });
    });

    // ── ApiKey ────────────────────────────────────────────────────────────────

    describe('ApiKey', () => {
        test('exported from models/index.js', () => {
            expect(models.ApiKey).toBeDefined();
        });
        test('maps to api_keys table', () => {
            expect(models.ApiKey.tableName).toBe('api_keys');
        });
        test('has: id key_hash label scopes is_active last_used_at', () => {
            const a = models.ApiKey.rawAttributes;
            ['id', 'key_hash', 'label', 'scopes', 'is_active', 'last_used_at'].forEach(f =>
                expect(a).toHaveProperty(f)
            );
        });
        test('key_hash is required and unique', () => {
            const kh = models.ApiKey.rawAttributes.key_hash;
            expect(kh.allowNull).toBe(false);
            expect(kh.unique).toBe(true);
        });
        test('scopes defaults to ["ingest"]', () => {
            expect(models.ApiKey.rawAttributes.scopes.defaultValue).toEqual(['ingest']);
        });
        test('is_active defaults to true', () => {
            expect(models.ApiKey.rawAttributes.is_active.defaultValue).toBe(true);
        });
        test('last_used_at is nullable', () => {
            expect(models.ApiKey.rawAttributes.last_used_at.allowNull).toBe(true);
        });
    });

    // ── Lead extensions ───────────────────────────────────────────────────────

    describe('Lead (extensions)', () => {
        test('has contact_id', () => {
            expect(models.Lead.rawAttributes).toHaveProperty('contact_id');
        });
        test('contact_id is nullable', () => {
            expect(models.Lead.rawAttributes.contact_id.allowNull).toBe(true);
        });
        test('has opportunity_id', () => {
            expect(models.Lead.rawAttributes).toHaveProperty('opportunity_id');
        });
        test('opportunity_id is nullable', () => {
            expect(models.Lead.rawAttributes.opportunity_id.allowNull).toBe(true);
        });
    });

    // ── Quote extensions ──────────────────────────────────────────────────────

    describe('Quote (extensions)', () => {
        test('has opportunity_id', () => {
            expect(models.Quote.rawAttributes).toHaveProperty('opportunity_id');
        });
        test('opportunity_id is nullable', () => {
            expect(models.Quote.rawAttributes.opportunity_id.allowNull).toBe(true);
        });
        test('has version_number', () => {
            expect(models.Quote.rawAttributes).toHaveProperty('version_number');
        });
        test('version_number defaults to 1', () => {
            expect(models.Quote.rawAttributes.version_number.defaultValue).toBe(1);
        });
        test('version_number is NOT nullable', () => {
            expect(models.Quote.rawAttributes.version_number.allowNull).toBe(false);
        });
    });

    // ── TERMINAL_STATUSES constants ───────────────────────────────────────────

    describe('TERMINAL_STATUSES', () => {
        let TERMINAL_STATUSES;
        beforeAll(() => {
            ({ TERMINAL_STATUSES } = require('../../models/constants'));
        });
        test('contains all 5 closed statuses', () => {
            ['won', 'lost', 'spam', 'duplicate', 'out_of_coverage'].forEach(s =>
                expect(TERMINAL_STATUSES).toContain(s)
            );
        });
        test('does NOT contain open statuses', () => {
            ['new', 'contacted', 'qualified', 'quoted'].forEach(s =>
                expect(TERMINAL_STATUSES).not.toContain(s)
            );
        });
    });
});
