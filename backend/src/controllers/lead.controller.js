const { Lead } = require('../models');

// Save lead from chat widget (public)
exports.saveLead = async (req, res) => {
    try {
        const { name, email, phone, source = 'chat', notes } = req.body;
        if (!name && !email && !phone) {
            return res.status(400).json({ error: 'Se requiere al menos nombre, email o teléfono.' });
        }

        // Avoid duplicate leads from same email/phone in last 24h
        if (email) {
            const recent = await Lead.findOne({
                where: { email },
                order: [['created_at', 'DESC']],
            });
            if (recent) {
                // Update notes if new ones provided
                if (notes) await recent.update({ notes, updated_at: new Date() });
                return res.json({ id: recent.id, updated: true });
            }
        }

        const lead = await Lead.create({ name, email, phone, source, notes });
        res.status(201).json({ id: lead.id });
    } catch (err) {
        console.error('Error saving lead:', err.message);
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
