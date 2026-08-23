const { Lead, sequelize } = require('../models');
const axios = require('axios');
const { ingestLead } = require('../services/ingest.service');

const N8N_LEAD_WEBHOOK = 'https://n8n.conectaai.cl/webhook/nuevo-lead';

// Maps lead source values to Growth Engine SOURCES constants
const LEAD_SOURCE_TO_GE = {
    chat:        'chat_widget',
    website:     'website_form',
    form:        'website_form',
    whatsapp:    'whatsapp_organico',
    instagram:   'instagram',
    facebook:    'facebook',
    referido:    'referido',
    manual:      'manual',
};

function resolveGrowthSource(leadSource) {
    return LEAD_SOURCE_TO_GE[leadSource] || 'other';
}

async function fireLeadTelegram(lead) {
    try {
        await axios.post(N8N_LEAD_WEBHOOK, {
            contact: {
                name:        lead.name || 'Visitante',
                external_id: `lead_${lead.id}`,
                id:          lead.id,
            },
            message: { content: lead.notes || '(sin mensaje)', conversation_id: 0 },
            phone:   lead.phone || '',
            channel: lead.source || 'chat',
        }, { timeout: 6000 });
    } catch (err) {
        console.warn('Lead webhook (non-blocking):', err.message);
    }
}

// Save lead from chat widget (public)
exports.saveLead = async (req, res) => {
    try {
        const { name, email, phone, source = 'chat', notes } = req.body;
        if (!name && !email && !phone) {
            return res.status(400).json({ error: 'Se requiere al menos nombre, email o teléfono.' });
        }

        // Avoid duplicate leads from same email (preserves existing API contract)
        if (email) {
            const recent = await Lead.findOne({
                where: { email },
                order: [['created_at', 'DESC']],
            });
            if (recent) {
                if (notes) await recent.update({ notes, updated_at: new Date() });
                return res.json({ id: recent.id, updated: true });
            }
        }

        const growthSource = resolveGrowthSource(source);
        let lead;

        // Atomic: Lead creation + Growth Engine ingest in one transaction.
        // If GE fails the transaction rolls back — no orphaned Lead without Contact/Opportunity.
        await sequelize.transaction(async (t) => {
            lead = await Lead.create({ name, email, phone, source, notes }, { transaction: t });

            const result = await ingestLead({
                source:      growthSource,
                externalRef: `lead:${lead.id}`,
                contact:     { name, email, phone },
            }, { transaction: t });

            await lead.update({
                contact_id:     result.contact?.id     || null,
                opportunity_id: result.opportunity?.id || null,
            }, { transaction: t });
        });

        // After commit: fire n8n webhook (HTTP side-effect stays outside the transaction)
        fireLeadTelegram(lead).catch(() => {});

        res.status(201).json({ id: lead.id });
    } catch (err) {
        console.error('[Lead] Error saving lead:', err.message);
        res.status(500).json({ error: 'Error al guardar contacto.' });
    }
};

// Get all leads (admin only)
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.findAll({ order: [['created_at', 'DESC']] });
        res.json(leads);
    } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ error: 'Error al obtener leads.' });
    }
};

// Update lead status (admin only)
exports.updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const lead = await Lead.findByPk(id);
        if (!lead) return res.status(404).json({ error: 'Lead no encontrado.' });
        await lead.update({ status, notes });
        res.json(lead);
    } catch (err) {
        console.error('Error updating lead:', err.message);
        res.status(500).json({ error: 'Error al actualizar lead.' });
    }
};

// Delete lead (admin only)
exports.deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        await Lead.destroy({ where: { id } });
        res.json({ message: 'Lead eliminado.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar lead.' });
    }
};
