const { Referral } = require('../models');

// PUBLIC: validate code
exports.validate = async (req, res) => {
    try {
        const code = (req.params.code || '').trim().toUpperCase();
        const ref = await Referral.findOne({ where: { code, active: true } });
        if (!ref) return res.status(404).json({ valid: false, error: 'Código no válido o expirado' });
        if (ref.max_uses !== null && ref.uses_count >= ref.max_uses)
            return res.status(400).json({ valid: false, error: 'Código agotado' });
        res.json({ valid: true, code: ref.code, discount_pct: ref.discount_pct, owner_name: ref.owner_name });
    } catch (err) {
        res.status(500).json({ valid: false, error: 'Error' });
    }
};

// PUBLIC: record use (called from checkout)
exports.recordUse = async (req, res) => {
    try {
        const code = (req.params.code || '').trim().toUpperCase();
        const ref = await Referral.findOne({ where: { code, active: true } });
        if (!ref) return res.status(404).json({ error: 'Código no válido' });
        await ref.increment('uses_count');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};

// ADMIN CRUD
exports.list = async (req, res) => {
    try {
        const refs = await Referral.findAll({ order: [['created_at', 'DESC']] });
        res.json(refs);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};

exports.create = async (req, res) => {
    try {
        const { code, owner_name, owner_email, discount_pct, max_uses, notes } = req.body;
        if (!code?.trim()) return res.status(400).json({ error: 'Código requerido' });
        if (!owner_name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
        const ref = await Referral.create({
            code: code.trim().toUpperCase(),
            owner_name: owner_name.trim(),
            owner_email: owner_email?.trim() || null,
            discount_pct: Math.min(Math.max(parseInt(discount_pct) || 10, 1), 50),
            max_uses: max_uses ? parseInt(max_uses) : null,
            notes: notes?.trim() || null,
        });
        res.status(201).json(ref);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError')
            return res.status(400).json({ error: 'Código ya existe' });
        res.status(500).json({ error: 'Error' });
    }
};

exports.update = async (req, res) => {
    try {
        const ref = await Referral.findByPk(req.params.id);
        if (!ref) return res.status(404).json({ error: 'No encontrado' });
        const { active, discount_pct, max_uses, notes, owner_name, owner_email } = req.body;
        const update = {};
        if (active !== undefined) update.active = !!active;
        if (discount_pct !== undefined) update.discount_pct = Math.min(Math.max(parseInt(discount_pct), 1), 50);
        if (max_uses !== undefined) update.max_uses = max_uses ? parseInt(max_uses) : null;
        if (notes !== undefined) update.notes = notes;
        if (owner_name !== undefined) update.owner_name = owner_name;
        if (owner_email !== undefined) update.owner_email = owner_email;
        await ref.update(update);
        res.json(ref);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};

exports.remove = async (req, res) => {
    try {
        const ref = await Referral.findByPk(req.params.id);
        if (!ref) return res.status(404).json({ error: 'No encontrado' });
        await ref.destroy();
        res.json({ ok: true });
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};
