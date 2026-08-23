const { Referral } = require('../models');
const { Op } = require('sequelize');

function generateCode(name) {
    const base = (name || 'REF').replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 5) || 'REF';
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `${base}${rand}`;
}

exports.getAll = async (req, res) => {
    try {
        const referrals = await Referral.findAll({ order: [['created_at', 'DESC']] });
        res.json(referrals);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching referrals' });
    }
};

exports.create = async (req, res) => {
    try {
        const { owner_name, owner_email, discount_pct, max_uses, notes, code: customCode } = req.body;
        if (!owner_name) return res.status(400).json({ error: 'owner_name is required' });

        let code = customCode ? String(customCode).toUpperCase().substring(0, 50) : generateCode(owner_name);
        // Ensure uniqueness
        const existing = await Referral.findOne({ where: { code } });
        if (existing) code = generateCode(owner_name);

        const referral = await Referral.create({
            code,
            owner_name: String(owner_name).substring(0, 200),
            owner_email: owner_email ? String(owner_email).substring(0, 200) : null,
            discount_pct: Math.min(50, Math.max(1, parseInt(discount_pct) || 10)),
            max_uses: max_uses ? Math.max(1, parseInt(max_uses)) : null,
            uses_count: 0,
            active: true,
            notes: notes ? String(notes).substring(0, 1000) : null,
        });
        res.status(201).json(referral);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Referral code already exists' });
        }
        res.status(500).json({ error: 'Error creating referral' });
    }
};

exports.update = async (req, res) => {
    try {
        const referral = await Referral.findByPk(req.params.id);
        if (!referral) return res.status(404).json({ error: 'Referral not found' });
        const { active, discount_pct, max_uses, notes, owner_email } = req.body;
        await referral.update({
            ...(active != null && { active: Boolean(active) }),
            ...(discount_pct != null && { discount_pct: Math.min(50, Math.max(1, parseInt(discount_pct) || 10)) }),
            ...(max_uses !== undefined && { max_uses: max_uses ? Math.max(1, parseInt(max_uses)) : null }),
            ...(notes != null && { notes: String(notes).substring(0, 1000) }),
            ...(owner_email !== undefined && { owner_email: owner_email ? String(owner_email).substring(0, 200) : null }),
        });
        res.json(referral);
    } catch (err) {
        res.status(500).json({ error: 'Error updating referral' });
    }
};

exports.remove = async (req, res) => {
    try {
        const referral = await Referral.findByPk(req.params.id);
        if (!referral) return res.status(404).json({ error: 'Referral not found' });
        await referral.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting referral' });
    }
};
