'use strict';

/**
 * Non-destructive GE dev seed — inserts sample contacts, opportunities, touchpoints,
 * and follow-ups for local development and demo purposes.
 *
 * Guards:
 *  - Never runs in production
 *  - Skips any contact that already exists by email (idempotent)
 *
 * Usage: node src/scripts/seed_ge_dev.js
 */

if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: seed_ge_dev.js must NOT be run in production.');
    process.exit(1);
}

require('dotenv').config();

const { sequelize, Contact, Opportunity, Touchpoint, FollowUp } = require('../models');

const SAMPLE_CONTACTS = [
    { name: 'Ana García Montoya', email: 'ana.garcia@ejemplo.cl', phone: '+56912345001' },
    { name: 'Pedro Herrera López', email: 'pedro.herrera@ejemplo.cl', phone: '+56912345002' },
    { name: 'Carolina Muñoz Silva', email: 'carolina.munoz@ejemplo.cl', phone: '+56912345003' },
    { name: 'Jorge Rivas Torres', email: 'jorge.rivas@ejemplo.cl', phone: '+56912345004' },
    { name: 'Valentina Campos Rojas', email: 'valentina.campos@ejemplo.cl', phone: '+56912345005' },
];

async function seed() {
    await sequelize.authenticate();
    console.log('[seed_ge_dev] DB connected. Seeding...');

    let inserted = 0;
    let skipped  = 0;

    for (const [i, contactData] of SAMPLE_CONTACTS.entries()) {
        const existing = await Contact.findOne({ where: { email: contactData.email } });
        if (existing) {
            console.log(`  SKIP contact ${contactData.email} (already exists)`);
            skipped++;
            continue;
        }

        const contact = await Contact.create(contactData);
        console.log(`  CREATE contact id=${contact.id} email=${contact.email}`);

        const statuses = ['new', 'contacted', 'qualified', 'quoted', 'won'];
        const status = statuses[i % statuses.length];

        const opp = await Opportunity.create({
            contact_id:       contact.id,
            status,
            product_interest: ['Cortinas roller', 'Persianas venecianas', 'Cortinas blackout', 'Roller solar', 'Persianas romanas'][i],
            won_amount:       status === 'won' ? 150000 + i * 20000 : null,
            won_at:           status === 'won' ? new Date() : null,
        });
        console.log(`  CREATE opportunity id=${opp.id} status=${opp.status}`);

        await Touchpoint.create({
            opportunity_id: opp.id,
            source:         ['chat_widget', 'instagram', 'booking', 'website_form', 'whatsapp_organico'][i],
            occurred_at:    new Date(Date.now() - (i + 1) * 2 * 24 * 3600 * 1000),
            external_ref:   `seed-tp-${contact.id}`,
        });

        if (!['won', 'lost'].includes(status)) {
            await FollowUp.create({
                opportunity_id: opp.id,
                scheduled_at:   new Date(Date.now() + (i + 1) * 24 * 3600 * 1000),
                type:           ['call', 'email', 'visit', 'message', 'call'][i],
                status:         'pending',
                priority:       ['high', 'medium', 'low', 'high', 'medium'][i],
                responsible:    'Héctor',
                note:           `Follow-up de prueba #${i + 1}`,
            });
        }

        inserted++;
    }

    console.log(`[seed_ge_dev] Done — ${inserted} contacts inserted, ${skipped} skipped.`);
    await sequelize.close();
}

seed().catch(err => {
    console.error('[seed_ge_dev] Error:', err.message);
    process.exit(1);
});
