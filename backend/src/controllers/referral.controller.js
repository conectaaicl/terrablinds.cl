const { Referral } = require('../models');

const VALID_STATUSES = ['pending', 'contacted', 'completed', 'rejected'];

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
        const { referrer_name, referrer_email, referrer_phone, referred_name, referred_email, referred_phone, notes } = req.body;
        if (!referrer_name) {
            return res.status(400).json({ error: 'referrer_name is required' });
        }
        const referral = await Referral.create({
            referrer_name: String(referrer_name).substring(0, 200),
            referrer_email: referrer_email ? String(referrer_email).substring(0, 200) : null,
            referrer_phone: referrer_phone ? String(referrer_phone).substring(0, 30) : null,
            referred_name: referred_name ? String(referred_name).substring(0, 200) : null,
            referred_email: referred_email ? String(referred_email).substring(0, 200) : null,
            referred_phone: referred_phone ? String(referred_phone).substring(0, 30) : null,
            notes: notes ? String(notes).substring(0, 1000) : null,
            status: 'pending',
            reward_amount: 0,
        });
        res.status(201).json(referral);
    } catch (err) {
        res.status(500).json({ error: 'Error creating referral' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const referral = await Referral.findByPk(req.params.id);
        if (!referral) return res.status(404).json({ error: 'Referral not found' });
        const { status, reward_amount, notes } = req.body;
        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        await referral.update({
            ...(status && { status }),
            ...(reward_amount != null && { reward_amount: Math.max(0, parseInt(reward_amount) || 0) }),
            ...(notes != null && { notes: String(notes).substring(0, 1000) }),
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
